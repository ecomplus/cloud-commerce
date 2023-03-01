import type { App } from 'vue';
import { i18n, formatMoney } from '@ecomplus/utils';
import Fade from '@@sf/components/globals/Fade.vue';
import ALink from '@@sf/components/globals/ALink.vue';
import AImg from '@@sf/components/globals/AImg.vue';

const formatPercentage = (value: number, digits = 1) => {
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(digits)}%`;
};

const createApp = (app: App) => {
  app.use({
    // eslint-disable-next-line no-shadow
    install: (app: App, options: Record<string, any>) => {
      // @ts-ignore
      app.config.globalProperties.$t = (dict, lang) => {
        // @ts-ignore
        return i18n(dict, lang || options?.lang);
      };
      app.config.globalProperties.$money = formatMoney;
      app.config.globalProperties.$percentage = formatPercentage;
      app.config.globalProperties.$settings = globalThis.storefront.settings;
      app.config.globalProperties.$context = globalThis.storefront.context;
    },
  });
  app.component('Fade', Fade);
  app.component('ALink', ALink);
  app.component('AImg', AImg);
};

export default createApp;

export type FormatPercentage = typeof formatPercentage;
