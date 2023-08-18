import type { Ref } from 'vue';
import {
  ref,
  computed,
  watch,
  onMounted,
} from 'vue';
import {
  promiseTimeout,
  useTimeout,
  useDebounceFn,
  useScroll,
  watchDebounced,
} from '@vueuse/core';
import { isMobile } from '@@sf/sf-lib';

export interface Props {
  header: Ref<HTMLElement | null>;
  canSetStyles?: boolean;
  canCreateHeightDiv?: boolean;
  isShownOnScrollDown?: boolean;
  isShownOnMobile?: boolean;
}

const useStickyHeader = (props: Props) => {
  const {
    header,
    canSetStyles,
    canCreateHeightDiv,
    isShownOnScrollDown,
    isShownOnMobile,
  } = {
    canSetStyles: true,
    canCreateHeightDiv: true,
    ...props,
  };
  const { ready, start } = useTimeout(100, { controls: true, immediate: false });
  const staticHeight = ref(0);
  const staticY = ref(0);
  let heightDiv: HTMLElement | undefined;
  const { y: _y } = !import.meta.env.SSR && (isShownOnMobile || !isMobile)
    ? useScroll(document)
    : { y: ref(0) };
  const y = ref(0);
  watchDebounced(_y, (nextY) => {
    y.value = nextY;
  }, {
    debounce: isMobile ? 100 : 50,
    maxWait: isMobile ? 800 : 400,
  });
  const isSticky = computed(() => ready.value && y.value > staticY.value * 1.2);
  const transition = ref('none');
  watch(isSticky, async (_isSticky) => {
    if (canSetStyles && header.value) {
      header.value.style.position = _isSticky ? 'fixed' : '';
      header.value.style.width = _isSticky ? '100vw' : '';
    }
    if (heightDiv) {
      heightDiv.style.height = _isSticky ? `${staticHeight.value}px` : '';
    }
    if (!_isSticky) {
      start();
      transition.value = 'none';
    } else {
      await promiseTimeout(300);
      transition.value = 'opacity var(--transition-slow), transform var(--transition)';
    }
  });
  const isScrollUp = ref(false);
  watch(y, (newY, oldY) => {
    isScrollUp.value = newY > 0 && newY < oldY;
  });

  if (!import.meta.env.SSR) {
    onMounted(() => {
      if (!header.value) throw new Error('<header> (props.header) not set');
      const fixHeight = () => {
        const headerElm = header.value as HTMLElement;
        staticHeight.value = headerElm.offsetHeight;
        staticY.value = staticHeight.value
          + window.scrollY + headerElm.getBoundingClientRect().top;
        start();
      };
      const imgs = header.value.getElementsByTagName('IMG');
      let isAllLoaded = true;
      for (let i = 0; i < imgs.length; i++) {
        const img = imgs[i] as HTMLImageElement;
        if (!img.complete || img.naturalHeight === 0) {
          isAllLoaded = false;
          img.onload = fixHeight;
        }
      }
      if (isAllLoaded) {
        fixHeight();
      }
      window.addEventListener('resize', useDebounceFn(fixHeight, 300));
      if (canSetStyles) {
        header.value.style.willChange = 'transform';
        watch([isSticky, isScrollUp], ([_isSticky, _isScrollUp]) => {
          let opacity: string = '';
          let transform: string = '';
          if (_isSticky && (!_isScrollUp || isShownOnScrollDown)) {
            opacity = '0';
            transform = 'translateY(-100%)';
          }
          const headerElm = header.value as HTMLElement;
          headerElm.style.opacity = opacity;
          headerElm.style.transform = transform;
        });
        watch(transition, (_transition) => {
          (header.value as HTMLElement).style.transition = _transition;
        });
      }
      if (canCreateHeightDiv) {
        heightDiv = document.createElement('div');
        header.value.parentElement?.insertBefore(heightDiv, header.value);
      }
    });
  }

  return {
    staticHeight,
    staticY,
    isSticky,
    isScrollUp,
    transition,
  };
};

export default useStickyHeader;

export { useStickyHeader };
