import { createApp } from 'vue';
import CartRecommendations from '@@sf/components/CartRecommendations.vue';
// Theme own Vue entrypoint, so the showcase inherits globals ($t, ALink, AImg…)
import createThemeApp from '~/pages/_vue';

const CONTAINER_ID = 'cart-recommendations';

/**
 * Mounts the recommended products showcase right below the legacy SPA on `/app/`.
 * Themes may customize it with `window.propsCartRecommendations` or disable it
 * by assigning `false`, with no need to touch any store file.
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
    ...(props && typeof props === 'object' && !Array.isArray(props) ? props : null),
  });
  createThemeApp(app);
  app.mount(container);
};

mountCartRecommendations();

export default mountCartRecommendations;
