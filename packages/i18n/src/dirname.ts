import { fileURLToPath } from 'node:url';

export default fileURLToPath(new URL('.', import.meta.url));
