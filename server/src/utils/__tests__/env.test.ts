import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';

describe('env validation', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('returns parsed env on success', () => {
    Object.assign(process.env, {

    expect(env.PORT).toBe(3000);
    expect(env.DATABASE_URL).toBe('https://example.com');
  });

  it('throws when required var missing', () => {
    Object.assign(process.env, {

  });
});
