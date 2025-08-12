import { describe, it, beforeEach, afterEach, expect, jest } from "@jest/globals";

describe("server startup env validation", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it("throws if required env vars are missing", () => {
    Object.assign(process.env, {
      PORT: "3000",
      DATABASE_URL: "https://example.com",
      GEOCODE_USER_AGENT: "agent",
      COGNITO_AUDIENCE: "aud",
      COGNITO_ISSUER: "issuer",
      S3_BUCKET_NAME: "bucket",
      S3_REGION: "us-east-1",
      AWS_ACCESS_KEY_ID: "keyId",
      AWS_SECRET_ACCESS_KEY: "secret",
      // COGNITO_JWT_PUBLIC_KEY intentionally missing
    });

    expect(() => require("../index")).toThrow();
  });
});
