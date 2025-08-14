# Contributing

Thank you for considering contributing to the Enterprise Garage Sale App! This document outlines the process for getting your changes into the project.

## Branching

- Start from the latest `main` branch.
- Create a feature branch with a descriptive name:
  ```bash
  git checkout -b feature/short-description
  ```
- Keep your branch up to date by regularly rebasing or merging from `main`.

## Commit Messages

- Make small, focused commits.
- Write clear, imperative commit messages, e.g. `feat: add property search filter`.
- Reference related issues when applicable.

## Testing

Before opening a pull request, ensure all tests pass.

```bash
# Client tests
cd client
npm test
npm run test:e2e

# Server tests
cd ../server
npm test
```

Refer to [TESTING.md](TESTING.md) for more details on the testing strategy.

## Pull Requests

- Push your branch to your fork and open a pull request against `main`.
- Provide a clear description of the problem and solution.
- Ensure your code adheres to project conventions and passes all checks.

We appreciate your contributions and thank you for helping to improve the project!
