# e-com.plus Cloud Commerce Configuration

## Git Staging Rules

**IMPORTANT**: When performing git add and commit operations:
- NEVER stage package.json and lock files (package-lock.json, yarn.lock, pnpm-lock.yaml) unless explicitly requested
- Exception: Only stage dependency files when the user specifically asks to "add dependency files" or similar explicit instruction
- Always check what files are being staged before committing
- Ask for confirmation if dependency files would be included unintentionally

## Git Commit Message Rules

**IMPORTANT**: Commit messages must be user-friendly and business-focused:
- **Main message** should describe what the change accomplishes for users/business
- **Secondary lines** can include technical implementation details
- Focus on the problem being solved rather than technical jargon in the main message
- Example:
  - Good: "Fix product import when image uploads fail"
  - Bad: "Add Promise.allSettled and timeout handling to parseProduct"
- Keep main message concise and clear about the user impact
- Technical details belong in the commit body, not the subject line

## Project Context

Complete platform on top of headless commerce APIs. High performant Astro + Vue storefront with built-in CMS. Integrations for payments, shipping, ERPs, CRMs and others. Truly extensible event-driven and serverless architecture. Easy and cheap deploy to Firebase.

This project includes multiple store submodules with dependencies that frequently change during development.