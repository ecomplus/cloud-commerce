let userAgent: string;
let screenWidth: number;
if (!import.meta.env.SSR) {
  userAgent = navigator.userAgent;
  screenWidth = document.body ? document.body.offsetWidth : window.screen.width;
} else {
  userAgent = '';
  screenWidth = 0;
}

export const isMobile = /Android|iPhone|iPad|iPod|webOS/i.test(userAgent);

export const isScreenXs = screenWidth < 640;

export const isScreenLg = screenWidth >= 1024;
