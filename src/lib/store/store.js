import { persisted } from 'svelte-local-storage-store'

export const numberOfRunsStore = persisted('numberOfRunsStore', 1);
export const backendsStore = persisted('backendsStore', []);
export const dataTypesStore = persisted('dataTypesStore', []);
export const modelTypesStore = persisted('modelTypesStore', []);
export const modelsStore = persisted('modelsStore', []);
export const autoStore = persisted('autoStore', false);
export const testQueueStore = persisted('testQueueStore', []);
export const testQueueLengthStore = persisted('testQueueLengthStore', 0);
export const resultsStore = persisted('resultsStore', []);
export const infoStore = persisted('infoStore', []);
export const modelDownloadProgressStore = persisted('modelDownloadProgressStore', []);
export const modelDownloadUrlStore = persisted('modelDownloadUrlStore', 1);