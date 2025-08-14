# Contributing

## TypeScript

Both the client and server projects use TypeScript with `strict` mode enabled. Do not relax compiler options. When interacting with untyped or third-party code, prefer adding explicit types. If a type error cannot be resolved, include a `@ts-expect-error` comment explaining why the suppression is necessary.
