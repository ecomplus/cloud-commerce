import { createApp } from 'vue';
import CartRecommendations from '@@sf/components/CartRecommendations.vue';
// Entrypoint Vue do próprio tema, para a vitrine herdar os globais ($t, ALink, AImg…)
import createThemeApp from '~/pages/_vue';

const CONTAINER_ID = 'cart-recommendations';

/**
 * Monta a vitrine de recomendados logo abaixo do SPA legado em `/app/`.
 * O tema pode customizar por `window.propsCartRecommendations` ou desligar
 * atribuindo `false`, sem precisar tocar em nenhum arquivo da loja.
 */
const mountCartRecommendations = () => {
  if (document.getElementById(CONTAINER_ID)) return;
  const appEl = document.getElementById('storefront-app');
  if (!appEl) return;
  const container = document.createElement('div');
  container.id = CONTAINER_ID;
  appEl.insertAdjacentElement('afterend', container);
  const props = (window as any).propsCartRecommendations;
  const app = createApp(CartRecommendations, {
    onRoutes: ['cart', 'checkout', 'confirmation'],
    ...(typeof props === 'object' ? props : null),
  });
  createThemeApp(app);
  app.mount(container);
};

mountCartRecommendations();

export default mountCartRecommendations;
