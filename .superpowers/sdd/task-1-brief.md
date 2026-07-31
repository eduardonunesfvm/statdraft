# Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `src/main.tsx`, `src/App.tsx`, `src/index.css`

**Interfaces:**
- Produces: Working Vite dev server at `http://localhost:5173`

**Work from:** C:\Users\du\Downloads\statdraft

**IMPORTANT:** This project already has an initial git commit and a `.gitignore` file. DO NOT re-init git. DO NOT modify `.gitignore`. Just create the files specified below.

## Step 1: Create package.json

```json
{
  "name": "statdraft",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.468.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16",
    "typescript": "~5.6.2",
    "vite": "^6.0.3"
  }
}
```

## Step 2: Run npm install

```bash
npm install
```

## Step 3: Create index.html

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>StatDraft</title>
  </head>
  <body class="bg-gray-950 text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## Step 4: Create vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

## Step 5: Create tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "resolveJsonModule": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}
```

## Step 6: Create tsconfig.node.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

## Step 7: Create tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          light: '#2d8a2d',
          DEFAULT: '#1a5c1a',
          dark: '#0a3d0a',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
```

## Step 8: Create postcss.config.js

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## Step 9: Create src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a3d0a 0%, #0d1b0d 50%, #0a3d0a 100%);
}
```

## Step 10: Create src/main.tsx

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## Step 11: Create src/App.tsx (placeholder)

```typescript
function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold text-green-400">StatDraft</h1>
    </div>
  )
}

export default App
```

## Step 12: Verify dev server starts

Run `npx vite --host` and confirm it starts (then stop it with Ctrl+C). Expected: Opens at localhost, shows "StatDraft" in green text on dark background.

## Step 13: Verify TypeScript compiles

```bash
npx tsc --noEmit
```
Expected: No errors.

## Step 14: Commit

```bash
git add -A
git commit -m "chore: scaffold project with Vite + React + TS + Tailwind + Zustand"
```

## Report

Write your report to: `C:\Users\du\Downloads\statdraft\.superpowers\sdd\task-1-report.md`

Include:
- What you implemented
- Test results (tsc, vite dev)
- Files changed
- Self-review findings
- Status: DONE | DONE_WITH_CONCERNS | BLOCKED
