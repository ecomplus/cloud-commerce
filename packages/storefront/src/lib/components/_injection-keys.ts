/* eslint-disable import/prefer-default-export */
import type { Ref, InjectionKey } from 'vue';

export const carouselKey = Symbol('carousel') as InjectionKey<{
  autoplay: Ref<number>,
  changeSlide: (direction: number) => void,
  isBoundLeft: Ref<boolean>,
  isBoundRight: Ref<boolean>,
}>;
