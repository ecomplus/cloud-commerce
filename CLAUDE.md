# e-com.plus Cloud Commerce Configuration

## Git Staging Rules

**IMPORTANT**: When performing git add and commit operations:
- NEVER stage package.json and lock files (package-lock.json, yarn.lock, pnpm-lock.yaml) unless explicitly requested
- Exception: Only stage dependency files when the user specifically asks to "add dependency files" or similar explicit instruction
- Always check what files are being staged before committing
- Ask for confirmation if dependency files would be included unintentionally

## Project Context

Complete platform on top of headless commerce APIs. High performant Astro + Vue storefront with built-in CMS. Integrations for payments, shipping, ERPs, CRMs and others. Truly extensible event-driven and serverless architecture. Easy and cheap deploy to Firebase.

This project includes multiple store submodules with dependencies that frequently change during development.