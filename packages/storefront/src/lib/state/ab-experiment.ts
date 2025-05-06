import type { RemoteConfig } from 'firebase/remote-config';
import type { AbExperimentContent } from '@@sf/content';
import { ref, computed, watch } from 'vue';
import { requestIdleCallback } from '@@sf/sf-lib';
import useStorage from '@@sf/state/use-storage';

export const isAbExpReady = ref(false);

const abVariantContent = useStorage<Omit<AbExperimentContent, 'experimentId'> & {
  experimentId: string | null,
}>(
  'abVariantContent',
  { experimentId: null },
  globalThis.sessionStorage,
);

export const abExperimentId = computed(() => {
  return abVariantContent.experimentId;
});

export const getAbValue = (name: string) => {
  if (import.meta.env.SSR) return null;
  if (isAbExpReady.value && !abExperimentId.value) {
    return null;
  }
  const value = ref<string | number | boolean | null>(null);
  const setValue = () => {
    const keys = Object.keys(abVariantContent);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i] as Exclude<keyof AbExperimentContent, 'experimentId'>;
      if (Array.isArray(abVariantContent[key])) {
        const field = abVariantContent[key].find((_field) => _field.name === name);
        if (field) {
          value.value = field.value;
        }
      }
    }
  };
  if (isAbExpReady.value) {
    setTimeout(() => {
      setValue();
    }, 9);
  } else {
    watch(isAbExpReady, () => {
      setValue();
    }, { once: true });
  }
  return value;
};

export const setAbVariant = (experimentId: string) => {
  const _abVariantContent = globalThis._abExperiments?.find((abExp: any) => {
    return abExp?.experimentId === experimentId;
  });
  if (_abVariantContent) {
    Object.assign(abVariantContent, _abVariantContent);
    if (!import.meta.env.SSR && !window.AB_EXPERIMENT_ID) {
      window.AB_EXPERIMENT_ID = experimentId;
    }
  }
  isAbExpReady.value = true;
};

let remoteConfig: RemoteConfig | undefined;
let isRcInitialized = false;

export const initializeRemoteConfig = (canWaitIdle = true) => {
  if (import.meta.env.SSR || isRcInitialized) return;
  isRcInitialized = true;
  const runImport = () => import('../scripts/firebase-app')
    .then(async ({
      getRemoteConfig,
      rcFetchAndActivate,
      rcGetValue,
    }) => {
      remoteConfig = getRemoteConfig();
      await rcFetchAndActivate(remoteConfig);
      const abExpField = globalThis._abExpRemoteField || 'ab_experiment_id';
      const experimentId = rcGetValue(remoteConfig, abExpField).asString();
      if (experimentId) {
        setAbVariant(experimentId);
      }
    })
    .catch(console.error)
    .finally(() => {
      isAbExpReady.value = true;
    });
  if (canWaitIdle) {
    requestIdleCallback(runImport);
  } else {
    runImport();
  }
};

if (!import.meta.env.SSR) {
  if (globalThis._abExperiments?.length) {
    if (window.AB_EXPERIMENT_ID) {
      setAbVariant(window.AB_EXPERIMENT_ID);
    } else if (abVariantContent.experimentId) {
      isAbExpReady.value = true;
    } else {
      initializeRemoteConfig();
    }
  } else {
    isAbExpReady.value = true;
  }
}
