# Contributing to Tabulator Manager

Thank you for your interest in contributing to Tabulator Manager! We welcome contributions across our TypeScript core, Laravel query pipeline, demo showcases, and documentation.

---

## Development Environment Setup

### Prerequisites
- **Node.js**: v20 or v22 (LTS)
- **pnpm**: v12 (`npm i -g pnpm`)
- **PHP**: v8.2, v8.3, or v8.4
- **Composer**: v2.x
- **Docker**: For running multi-database integration tests and container blueprints

### Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/tabulator-manager/tabulator-manager.git
cd tabulator-manager

# Install JavaScript/TypeScript dependencies
pnpm install

# Install PHP/Laravel dependencies
cd packages/laravel
composer install
cd ../..
```

---

## Testing & Verification

Always run test suites before submitting a pull request:

```bash
# Run all tests across the monorepo
pnpm test

# Run TypeScript core tests with coverage report
pnpm test:coverage

# Run Laravel package Pest test suite
pnpm test:laravel

# Typecheck TypeScript source
pnpm typecheck
```

---

## Local Demo Showcase

Run the interactive Linear-inspired preview application locally:

```bash
# Build the core package first
pnpm build:core

# Start Vite dev server for apps/demo
pnpm --filter demo dev
```

Open `http://localhost:5173` in your browser.

---

## Conventional Commits & Changesets

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature or capability
- `fix:` A bug fix
- `docs:` Documentation improvements
- `refactor:` Code restructuring without behavior change
- `test:` Adding or improving tests
- `chore:` Dependency bumps, CI updates, or build tool changes

### Adding a Changeset
Whenever you make changes to `@tabulator-manager/core` or `tabulator-manager/laravel`:

```bash
pnpm changeset
```

Follow the interactive prompts:
1. Select which package(s) were changed.
2. Choose the semver bump type (`patch`, `minor`, or `major`).
3. Write a concise description for the release changelog.
4. Commit the generated markdown file in `.changeset/`.
