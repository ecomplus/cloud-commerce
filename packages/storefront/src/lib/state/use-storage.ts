import { reactive, watch } from 'vue';

export default <T extends {}>(key: string, initialValue: T, storage = localStorage) => {
  let persistedValue: T | undefined | null;
  const sessionJson = storage.getItem(key);
  if (sessionJson) {
    try {
      persistedValue = JSON.parse(sessionJson);
    } catch (e) {
      persistedValue = null;
      storage.removeItem(key);
    }
  }
  const state = reactive<T>(persistedValue || initialValue);
  watch(state, () => {
    storage.setItem(key, JSON.stringify(state));
  });
  return state;
};
