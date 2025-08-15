import { seed } from './fixtures/seed';

export default async function globalSetup() {
  await seed();
}
