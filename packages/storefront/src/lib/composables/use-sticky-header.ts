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
} from '@vueuse/core';

export interface Props {
  header: Ref<HTMLElement>;
  canSetStyles?: boolean;
  canCreateHeightDiv?: boolean;
  isShownOnScrollDown?: boolean;
}

const useStickyHeader = (props: Props) => {
  const {
    header,
    canSetStyles,
    canCreateHeightDiv,
    isShownOnScrollDown,
  } = {
    canSetStyles: true,
    canCreateHeightDiv: true,
    ...props,
  };
  const { ready, start } = useTimeout(100, { controls: true, immediate: false });
  const staticHeight = ref(0);
  const staticY = ref(0);
  let heightDiv: HTMLElement | undefined;
  const { y } = !import.meta.env.SSR ? useScroll(document) : { y: ref(0) };
  const isSticky = computed(() => ready.value && y.value > staticY.value * 1.2);
  const transition = ref('none');
  watch(isSticky, async (_isSticky) => {
    if (canSetStyles) {
      header.value.style.position = _isSticky ? 'sticky' : null;
    }
    if (heightDiv) {
      heightDiv.style.height = _isSticky ? `${staticHeight.value}px` : null;
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
      const fixHeight = () => {
        staticHeight.value = header.value.offsetHeight;
        staticY.value = staticHeight.value
          + window.pageYOffset + header.value.getBoundingClientRect().top;
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
          let opacity: string | null = null;
          let transform: string | null = null;
          if (_isSticky && (!_isScrollUp || isShownOnScrollDown)) {
            opacity = '0';
            transform = 'translateY(-100%)';
          }
          header.value.style.opacity = opacity;
          header.value.style.transform = transform;
        });
        watch(transition, (_transition) => {
          header.value.style.transition = _transition;
        });
      }
      if (canCreateHeightDiv) {
        heightDiv = document.createElement('div');
        header.value.parentElement.insertBefore(heightDiv, header.value);
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
