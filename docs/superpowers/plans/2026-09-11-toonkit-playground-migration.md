# Toonkit Playground Migration: Next.js to React/Vite/React Router DOM

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Toonkit playground from Next.js to a standard React application using Vite and React Router DOM, while maintaining use of the actual Toonkit library from the repository.

**Architecture:** Remove Next.js dependencies, create a React application structure with Vite, use React Router DOM for routing, and ensure the playground imports and uses the actual Toonkit library implementation from `/toonjs/src`.

**Tech Stack:** React 19, TypeScript 5, Vite, React Router DOM, Toonkit library (local)

**Spec:** N/A (This is a migration task)

## Global Constraints

- The Toonkit library in `/toonjs/` must remain functional for npm/JSR publishing
- The playground must use the actual Toonkit implementation, not mocked/fake versions
- No Next.js dependencies should remain in the final application
- The application should be buildable and runnable with standard React tooling
- Maintain the existing visual design and functionality of the playground
- Preserve all existing Toonkit examples and conversion capabilities

---

### Task 1: Prepare for migration - backup and assessment

**Files:**
- Create: backup of current Next.js app structure (for reference)
- Modify: package.json (to update dependencies and scripts)
- Create: new React/Vite structure

**Interfaces:**
- Consumes: Current Next.js application structure
- Produces: Prepared state for migration

- [ ] **Step 1: Document current Next.js structure**
  
  Create a backup reference of:
  - `/src/app` directory structure
  - `/src/app/playground/page.tsx` (current playground implementation)
  - `/src/app/api/toon/` routes (backend endpoints)
  - `/next.config.ts`, `/package.json`, `/tsconfig.json`
  - `/public` directory contents

- [ ] **Step 2: Verify Toonkit library accessibility**
  
  Confirm that:
  - The Toonkit library in `/toonjs/` can be imported locally
  - The public API (toonToJson, jsonToToon, etc.) is accessible
  - No breaking changes exist in the library interface

- [ ] **Step 3: Commit**
  
  Run: git add docs/superpowers/plans/2026-09-11-toonkit-playground-migration.md
  Run: git commit -m "docs: create playground migration plan"

---

### Task 2: Set up React/Vite foundation

**Files:**
- Create: index.html (root HTML template)
- Create: vite.config.ts (Vite configuration)
- Create: src/main.tsx (React entry point)
- Create: src/App.tsx (main App component with routing)
- Modify: package.json (add React/Vite dependencies, update scripts)
- Modify: tsconfig.json (update for React/Vite)
- Delete: next.config.ts, vercel.json (Next.js specific configs)

**Interfaces:**
- Consumes: None (creating new foundation)
- Produces: Working React/Vite application skeleton

- [ ] **Step 1: Create basic HTML template**
  
  Create index.html with:
  - Proper viewport meta tags
  - Title and metadata
  - Root div for React mounting
  - Favicon and basic assets

- [ ] **Step 2: Configure Vite**
  
  Create vite.config.ts with:
  - React plugin configuration
  - TypeScript support
  - Proper build output settings
  - Development server configuration

- [ ] **Step 3: Set up React entry point**
  
  Create main.tsx with:
  - ReactDOM.createRoot rendering
  - BrowserRouter from react-router-dom
  - StrictMode for development
  - CSS/global styles import

- [ ] **Step 4: Create main App component**
  
  Create App.tsx with:
  - Routes configuration using React Router DOM
  - Basic layout structure
  - Route definitions for home and playground

- [ ] **Step 5: Update package.json**
  
  Add dependencies:
  - react, react-dom
  - @types/react, @types/react-dom
  - vite
  - @vitejs/plugin-react
  - react-router-dom
  - @types/react-router-dom
  
  Update scripts:
  - dev: "vite"
  - build: "vite build"
  - preview: "vite preview"
  
  Remove Next.js dependencies and scripts

- [ ] **Step 6: Update tsconfig.json**
  
  Modify for React/Vite:
  - Update JSX setting to "react-jsx"
  - Adjust module resolution
  - Update include/exclude patterns
  - Remove Next.js specific plugins

- [ ] **Step 7: Commit**
  
  Run: git add index.html vite.config.ts src/main.tsx src/App.tsx package.json tsconfig.json
  Run: git rm -r --cached .next node_modules/next  # Remove Next.js artifacts
  Run: git commit -m "feat: set up React/Vite foundation for playground"

---

### Task 3: Create application structure and basic routing

**Files:**
- Create: src/pages/Home.tsx (home page)
- Create: src/pages/Playground.tsx (migrated playground)
- Create: src/components/Layout.tsx (optional layout component)
- Create: src/assets/ (directory for images, icons, etc.)
- Modify: src/App.tsx (complete routing setup)

**Interfaces:**
- Consumes: React/Vite foundation
- Produces: Basic application structure with routing

- [ ] **Step 1: Create home page**
  
  Create Home.tsx with:
  - Simple welcome message
  - Navigation links to playground
  - Basic styling

- [ ] **Step 2: Migrate playground component**
  
  Create Playground.tsx by:
  - Converting from Next.js page to React component
  - Removing Next.js specific imports and hooks
  - Replacing fetch calls with direct Toonkit library usage
  - Preserving all UI logic, styling, and functionality
  - Ensuring it uses the actual Toonkit library from `/toonjs/src`

- [ ] **Step 3: Set up routing**
  
  Update App.tsx with:
  - BrowserRouter, Routes, Route from react-router-dom
  - Home route at "/"
  - Playground route at "/playground"
  - Optional 404 route
  - Navigation links in header/layout

- [ ] **Step 4: Handle assets and styling**
  
  - Copy or adapt CSS from Next.js playground
  - Ensure all styles work in Vite environment
  - Handle any images, fonts, or other assets
  - Update imports to use relative paths or public directory

- [ ] **Step 5: Commit**
  
  Run: git add src/pages/Home.tsx src/pages/Playground.tsx src/components/Layout.tsx src/App.tsx
  Run: git commit -m "feat: create application structure with routing"

---

### Task 4: Migrate playground functionality - remove API dependencies

**Files:**
- Modify: src/pages/Playground.tsx (remove API calls, use direct Toonkit)
- Create: src/utils/toonkit.ts (optional utility wrapper if needed)
- Test: Verify playground works with actual Toonkit library

**Interfaces:**
- Consumes: React/Vite application structure
- Produces: Playground that uses actual Toonkit library directly

- [ ] **Step 1: Remove Next.js API dependencies**
  
  In Playground.tsx:
  - Remove all fetch calls to "/api/toon/send" and "/api/toon/receive"
  - Remove server-side API logic and fallbacks
  - Replace with direct imports from Toonkit library

- [ ] **Step 2: Import and use actual Toonkit library**
  
  Add imports like:
  ```typescript
  import { jsonToToon, toonToJson, safeParse } from "../../toonjs/src/index.js";
  ```
  
  Or use a relative path that works in both dev and build

- [ ] **Step 3: Implement direct conversion functions**
  
  Replace API-based conversion with:
  ```typescript
  // JSON to TOON
  const toonOutput = jsonToToon(JSON.parse(input));
  
  // TOON to JSON
  const jsonOutput = JSON.stringify(toonToJson(input), null, 2);
  ```
  
  With proper error handling using try/catch

- [ ] **Step 4: Preserve error handling and UI logic**
  
  Ensure:
  - Error messages are displayed correctly
  - Loading states work properly
  - Examples panel functions correctly
  - Copy to clipboard functionality remains
  - All UI interactions (clear, examples, etc.) work

- [ ] **Step 5: Commit**
  
  Run: git add src/pages/Playground.tsx src/utils/toonkit.ts (if created)
  Run: git commit -m "feat: migrate playground to use actual Toonkit library directly"

---

### Task 5: Test and verify the migrated application

**Files:**
- Test: Application builds and runs correctly
- Test: Playground functions with real Toonkit examples
- Test: Type checking passes
- Test: Build outputs are correct

**Interfaces:**
- Consumes: Migrated React/Vite application
- Produces: Verified, working application

- [ ] **Step 1: Install dependencies and test development server**
  
  Run: npm install
  Run: npm run dev
  Verify:
  - Application starts without errors
  - Home page loads at http://localhost:5173
  - Playground loads at http://localhost:5173/playground
  - Basic UI elements render correctly

- [ ] **Step 2: Test playground functionality**
  
  Verify:
  - JSON to TOON conversion works with examples
  - TOON to JSON conversion works with examples
  - Error handling displays properly for invalid input
  - Clear button resets the form
  - Example buttons load correct presets
  - Copy to clipboard functionality works
  - All UI interactions and styling work as expected

- [ ] **Step 3: Run type checking**
  
  Run: npm run typecheck (if configured) or tsc --noEmit
  Verify: No TypeScript errors

- [ ] **Step 4: Test production build**
  
  Run: npm run build
  Run: npm run preview
  Verify:
  - Application builds successfully
  - Preview loads correctly
  - All functionality works in production build

- [ ] **Step 5: Commit**
  
  Run: git add package-lock.json (if updated)
  Run: git commit -m "feat: verify migrated playground functionality"

---

### Task 6: Clean up Next.js artifacts and final verification

**Files:**
- Delete: Next.js specific files and directories
- Clean: Unused dependencies and configuration
- Verify: Final application state

**Interfaces:**
- Consumes: Working migrated application
- Produces: Clean React/Vite application with no Next.js dependencies

- [ ] **Step 1: Remove Next.js specific files**
  
  Delete:
  - /src/app directory (entire Next.js app structure)
  - /src/app/api/ directory (API routes)
  - /src/app/api-simulator/ (if not needed elsewhere)
  - /src/app/layout.tsx, /src/app/page.tsx, etc.
  - /src/app/seo/ directory (SEO-specific content)
  - /src/app/[slug]/ directory (dynamic routes)
  - /src/app/providers.tsx (if Next.js specific)
  - /src/app/robots.ts (if not needed)
  - /src/app/sitemap.ts (if not needed)
  - /src/app/seoKeywords.ts (if not needed)
  - /src/app/developer/page.tsx (if not needed)
  - /src/app/example/page.tsx (if not needed)
  - /src/app/docs/ directory (if not needed elsewhere)
  - /src/app/components/ (if Next.js specific components)
  - /next.config.ts
  - /vercel.json
  - /eslint.config.mjs (if Next.js specific)
  - /scripts/ (if Next.js specific scripts)
  - Any other Next.js artifacts

- [ ] **Step 2: Remove Next.js dependencies**
  
  From package.json, remove:
  - next
  - react (if duplicated, keep one)
  - react-dom (if duplicated, keep one)
  - @types/node (if not needed)
  - eslint-config-next
  - Any other Next.js related dependencies

- [ ] **Step 3: Verify clean dependency tree**
  
  Run: npm ls next
  Should show: empty or no Next.js dependencies
  
  Run: npm ls
  Verify: No unexpected Next.js related packages

- [ ] **Step 4: Final functionality verification**
  
  Repeat tests from Task 5 to ensure nothing broken during cleanup

- [ ] **Step 5: Commit**
  
  Run: git add . (remaining changes)
  Run: git commit -m "feat: cleanup Next.js artifacts and final verification"

### Task 7: Verify Toonkit library still works for publishing

**Files:**
- Test: toonjs/package.json build and publishing
- Test: toonjs/npm pack --dry-run
- Test: toonjs/npm test

**Interfaces:**
- Consumes: Toonkit library in /toonjs/
- Produces: Verified library ready for npm/JSR publishing

- [ ] **Step 1: Verify Toonkit library builds**
  
  cd toonjs && npm run build
  Verify: Successful build with correct outputs

- [ ] **Step 2: Verify Toonkit library tests pass**
  
  cd toonjs && npm test
  Verify: All tests pass

- [ ] **Step 3: Verify Toonkit library type checking**
  
  cd toonjs && npm run typecheck
  Verify: No TypeScript errors

- [ ] **Step 4: Verify Toonkit library package contents**
  
  cd toonjs && npm pack --dry-run
  Verify: Correct contents, no unnecessary files

- [ ] **Step 5: Commit**
  
  Run: git add toonjs/ (if any changes made during verification)
  Run: git commit -m "feat: verify Toonkit library integrity post-migration"