import { describe, expect, it, beforeEach, afterEach, jest } from "@jest/globals";

describe("env validation", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it("returns parsed env on success", () => {
    Object.assign(process.env, {
      DATABASE_URL: "https://example.com",
      PORT: "3000",
      GEOCODE_USER_AGENT: "test-agent",
      COGNITO_JWT_PUBLIC_KEY: "key",
      COGNITO_AUDIENCE: "aud",
      COGNITO_ISSUER: "issuer",
      S3_BUCKET_NAME: "bucket",
      S3_REGION: "us-east-1",
      AWS_ACCESS_KEY_ID: "keyId",
      AWS_SECRET_ACCESS_KEY: "secret",
    });

    const env = require("../env").default;
    expect(env.PORT).toBe(3000);
    expect(env.DATABASE_URL).toBe("https://example.com");
  });

  it("throws when required var missing", () => {
    Object.assign(process.env, {
      PORT: "3000",
      GEOCODE_USER_AGENT: "test-agent",
      COGNITO_JWT_PUBLIC_KEY: "key",
      COGNITO_AUDIENCE: "aud",
      COGNITO_ISSUER: "issuer",
      S3_BUCKET_NAME: "bucket",
      S3_REGION: "us-east-1",
      AWS_ACCESS_KEY_ID: "keyId",
      AWS_SECRET_ACCESS_KEY: "secret",
    });

    expect(() => require("../env")).toThrow();
  });
});
