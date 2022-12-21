import type { App } from 'vue';
import { i18n, formatMoney } from '@ecomplus/utils';
import { VTooltip } from 'floating-vue';
// @ts-ignore
import Fade from '@@components/globals/Fade.vue';

const formatPercentage = (value: number, digits = 1) => {
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(digits)}%`;
};

export default (app: App) => {
  app.use({
    // eslint-disable-next-line no-shadow
    install: (app, options) => {
      // @ts-ignore
      app.config.globalProperties.$t = (dict, lang) => {
        // @ts-ignore
        return i18n(dict, lang || options?.lang);
      };
      app.config.globalProperties.$money = formatMoney;
      app.config.globalProperties.$percentage = formatPercentage;
    },
  });
  app.directive('tooltip', VTooltip);
  app.component('Fade', Fade);
};

export type FormatPercentage = typeof formatPercentage;
