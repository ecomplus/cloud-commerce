import type { App } from 'vue';
import { i18n, formatMoney } from '@ecomplus/utils';

export default (app: App) => {
  app.use({
    // eslint-disable-next-line no-shadow
    install: (app, options) => {
      // @ts-ignore
      app.config.globalProperties.$t = (dict, lang) => {
        // @ts-ignore
        return i18n(dict, lang || options?.lang);
      };
      app.config.globalProperties.$formatMoney = formatMoney;
    },
  });
};
