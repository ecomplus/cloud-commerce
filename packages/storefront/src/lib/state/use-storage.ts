import type { Reactive } from 'vue';
import { reactive } from 'vue';
import { useDebounceFn, watchDebounced } from '@vueuse/core';

const deepMergeState = (newState: Record<string, any>, _state: Reactive<any>) => {
  Object.keys(newState).forEach((field) => {
    const newVal = newState[field];
    if (typeof newVal === 'object' && newVal) {
      const _val = _state[field];
      if (Array.isArray(newVal)) {
        if (Array.isArray(_val)) {
          _val.splice(0, _val.length);
          newVal.forEach((item) => _val.push(item));
          return;
        }
      } else if (typeof _val === 'object' && _val) {
        deepMergeState(newVal, _val);
        return;
      }
    }
    _state[field] = newVal;
  });
};

const useStorage = <T extends {}>(
  key: string,
  initialValue: T,
  storage = globalThis.localStorage,
  isWithBroadcast = true,
) => {
  if (!storage) {
    return reactive<T>(initialValue);
  }
  // eslint-disable-next-line consistent-return
  const getStorageItem = () => {
    const sessionJson = storage.getItem(key);
    if (sessionJson) {
      try {
        return JSON.parse(sessionJson) as T;
      } catch {
        storage.removeItem(key);
        return null;
      }
    }
  };
  const persistedValue = getStorageItem();
  const state = reactive<T>(persistedValue || initialValue);
  let bc: BroadcastChannel | undefined;
  let isFromBc = false;
  if (isWithBroadcast && !import.meta.env.SSR && globalThis.BroadcastChannel) {
    const syncState = useDebounceFn(() => {
      const newState = getStorageItem();
      if (!newState) return;
      deepMergeState(newState, state);
      isFromBc = true;
    }, 100);
    bc = new BroadcastChannel(key);
    bc.onmessage = (event) => {
      if (event.data === 'set') syncState();
    };
  }
  watchDebounced(state, () => {
    storage.setItem(key, JSON.stringify(state));
    if (bc) {
      if (isFromBc) isFromBc = false;
      else bc.postMessage('set');
    }
  }, {
    debounce: 50,
  });
  return state;
};

export default useStorage;
