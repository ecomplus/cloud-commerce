import type NReact from 'react';
import { initWebcontainer } from './preview/webcontainer';

export const genPreviewContainer = ({ React, cmsConfig, ghToken }: {
  React: typeof NReact,
  cmsConfig: Record<string, any>,
  ghToken?: string,
}) => {
  const { repo } = cmsConfig.backend;
  const cliTextareaId = 'webcontainerCli';
  const serverIframeId = 'serverPreview';
  // https://github.com/decaporg/decap-cms/issues/2183#issuecomment-997373169
  return class Prevew extends React.Component {
    render() {
      const { entry } = (this as any).props;
      console.log({ entry });
      const slug = '';
      const urlPath = `/~preview/${slug}`;
      const html = `
      <textarea id="${cliTextareaId}"></textarea>
      <iframe
        if="${serverIframeId}"
        data-url="${urlPath}"
        border="0"
        width="100%"
        height="100%"
        style="border: 1px solid #EEE; height: calc(100vh - 30px)"
      ></iframe>`;
      return React.createElement('div', {
        dangerouslySetInnerHTML: { __html: html },
      });
    }
    componentDidMount() {
      const iframe = document.getElementById('preview-pane') as HTMLIFrameElement;
      const cliTextarea = iframe.contentWindow!.document
        .getElementById(cliTextareaId) as HTMLTextAreaElement;
      const previewIframe = iframe.contentWindow!.document
        .getElementById(serverIframeId) as HTMLIFrameElement;
      initWebcontainer({ repo, ghToken, cliTextarea })
        .then(({ webcontainerInstance, startDevServer }) => {
          startDevServer();
          webcontainerInstance.on('server-ready', (port, url) => {
            console.log({ port, url });
            previewIframe.src = `${url}${previewIframe.dataset.url}`;
          });
        });
    }
  };
};

export default genPreviewContainer;
