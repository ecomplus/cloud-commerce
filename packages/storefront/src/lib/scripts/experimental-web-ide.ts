import { initVM } from '../../web-ide/webcontainer';

const cliTextareaId = 'IDEcli';
const serverIframeId = 'IDEserver';

if (!import.meta.env.SSR) {
  const cliTextarea = document.createElement('textarea');
  cliTextarea.id = cliTextareaId;
  document.body.appendChild(cliTextarea);
  const serverIframe = document.createElement('iframe');
  serverIframe.id = serverIframeId;
  serverIframe.width = '100%';
  serverIframe.height = '100%';
  serverIframe.style.cssText = 'border: 1px solid #EEE; height: calc(100vh - 30px)';
  document.body.appendChild(serverIframe);

  const initIDE = async () => {
    const repo = 'ecomplus/store';
    const { vm, startDevServer } = await initVM({ repo, cliTextarea });
    vm.on('server-ready', (port, href) => {
      console.log({ port, href });
      const url = new URL(href);
      url.searchParams.set('webcontainer', 'dev');
      serverIframe.src = `${url}`;
    });
    startDevServer();
  };
  initIDE();
}
