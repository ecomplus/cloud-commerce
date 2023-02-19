let userAgent: string;
let screenWidth: number;
if (!import.meta.env.SSR) {
  userAgent = navigator.userAgent;
  screenWidth = document.body ? document.body.offsetWidth : window.screen.width;
} else {
  userAgent = '';
  screenWidth = 0;
}

export const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');

export const isSafariNew = isSafari && /Version\/1[4-9]/i.test(userAgent);

// @ts-ignore
export const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

export const isMobile = isIOS || /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

export const isScreenXs = screenWidth < 640;

export const isScreenLg = screenWidth >= 1024;
