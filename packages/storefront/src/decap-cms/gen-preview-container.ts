import type NReact from 'react';
import afetch from '../helpers/afetch';
import { initWebcontainer } from './preview/webcontainer';

const getRepoCommits = async (repo: string, ghToken?: string) => {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (ghToken) {
    headers.Authorization = `Bearer ${ghToken}`;
  }
  const res = await afetch(`https://api.github.com/repos/${repo}/commits`, {
    headers,
  });
  if (res.ok) {
    return res.json();
  }
  const err: any = new Error('Failed reading repository commits on GitHub API');
  err.res = res;
  err.text = await res.text();
  throw new Error(err);
};

export const genPreviewContainer = ({
  React,
  WebContainer,
  cmsConfig,
  ghToken,
}: {
  React: typeof NReact,
  WebContainer: any,
  cmsConfig: Record<string, any>,
  ghToken?: string,
}) => {
  const { repo } = cmsConfig.backend;
  const cliTextareaId = 'webcontainerCli';
  // https://github.com/decaporg/decap-cms/issues/2183#issuecomment-997373169
  return class Prevew extends React.Component {
    render() {
      const { entry } = (this as any).props;
      console.log({ entry });
      const { host } = window.location;
      const slug = '';
      const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.');
      const src = `${isLocal ? 'http' : 'https'}://${host}/~preview/${slug}`;
      const html = `
      <textarea id="${cliTextareaId}"></textarea>
      <code>${src}</code>`;
      return React.createElement('div', {
        dangerouslySetInnerHTML: { __html: html },
      });
    }
    componentDidMount() {
      let commitSha: string | undefined;
      (async () => {
        try {
          const commits = await getRepoCommits(repo, ghToken);
          commitSha = commits[0]?.sha;
        } catch (err) {
          console.error(err);
        }
      })();
      const iframe = document.getElementById('preview-pane') as HTMLIFrameElement;
      const cliTextarea = iframe.contentWindow!.document
        .getElementById(cliTextareaId) as HTMLTextAreaElement;
      initWebcontainer({
        repo,
        ghToken,
        WebContainer,
        cliTextarea,
      }).then(({ startDevServer }) => {
        startDevServer(commitSha);
      });
    }
  };
};

export default genPreviewContainer;
