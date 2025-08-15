import { cleanup } from './fixtures/seed';

export default async function globalTeardown() {
  await cleanup();
}
