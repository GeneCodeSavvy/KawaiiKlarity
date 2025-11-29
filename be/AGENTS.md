# Agent Guidelines for Backend Development

## Commands
- **Run**: `bun index.ts` or `bun --hot index.ts` (with hot reload)
- **Test**: `bun test` (runs all tests) or `bun test <file>` (single test file)
- **Install**: `bun install` (never use npm/yarn/pnpm)
- **Build**: `bun build <file>` (for bundling)

## Runtime & APIs
- Use **Bun runtime** exclusively - never Node.js, npm, or other package managers
- Prefer Bun APIs: `Bun.serve()`, `bun:sqlite`, `Bun.redis`, `Bun.sql`, `Bun.file`
- Built-in WebSocket support - don't use `ws` package
- No need for dotenv - Bun loads .env automatically

## TypeScript Configuration
- Strict mode enabled with `noUncheckedIndexedAccess` and `noImplicitOverride`
- ES modules only (`"type": "module"`)
- Use `.ts` extensions in imports when using `allowImportingTsExtensions`
- Target ESNext with preserve module syntax

## Code Style
- Use double quotes for strings
- Import statements should be clean and organized
- Prefer functional programming patterns where appropriate
- Use proper TypeScript types - avoid `any`
- Handle errors explicitly with proper error types