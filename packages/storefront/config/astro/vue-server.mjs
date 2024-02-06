/* eslint-disable no-restricted-syntax */
import { h, createSSRApp, defineComponent } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { setup } from 'virtual:@astrojs/vue/app';

/**
 * Astro passes `children` as a string of HTML, so we need
 * a wrapper `div` to render that content as VNodes.
 *
 * This is the Vue + JSX equivalent of using `<div v-html="value" />`
 */
const StaticHtml = defineComponent({
  props: {
    value: String,
    name: String,
    hydrate: {
      type: Boolean,
      default: true,
    },
  },
  setup({ name, value, hydrate }) {
    if (!value) return () => null;
    const tagName = hydrate ? 'astro-slot' : 'astro-static-slot';
    return () => h(tagName, { name, innerHTML: value });
  },
});

/**
 * Other frameworks have `shouldComponentUpdate` in order to signal
 * that this subtree is entirely static and will not be updated
 *
 * Fortunately, Vue is smart enough to figure that out without any
 * help from us, so this just works out of the box!
 */

function check(Component) {
  return !!Component.ssrRender || !!Component.__ssrInlineRender;
}

async function renderToStaticMarkup(Component, inputProps, slotted, metadata) {
  const slots = {};
  const props = { ...inputProps };
  delete props.slot;
  for (const [key, value] of Object.entries(slotted)) {
    slots[key] = () => h(StaticHtml, {
      value,
      name: key === 'default' ? undefined : key,
      // Adjust how this is hydrated only when the version of Astro supports `astroStaticSlot`
      hydrate: metadata.astroStaticSlot ? !!metadata.hydrate : true,
    });
  }
  const app = createSSRApp({ render: () => h(Component, props, slots) });
  await setup(app);
  const html = await renderToString(app);
  return { html };
}

export default {
  check,
  renderToStaticMarkup,
  supportsAstroStaticSlot: true,
};
