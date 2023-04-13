/* eslint-disable import/prefer-default-export */
import type { Ref, InjectionKey } from 'vue';

export type CarouselInject = {
  autoplay: Ref<number | undefined>,
  changeSlide: (direction: number) => void,
  isBoundLeft: Ref<boolean>,
  isBoundRight: Ref<boolean>,
};

export const carouselKey = Symbol('carousel') as InjectionKey<CarouselInject>;
