# ShikshaSetu Visual Mind Map — Phase A Architectural Audit

**Audit Date:** August 18, 2026  
**Scope:** Phase A Production MVP  
**Status:** ALL REQUIRED INFRASTRUCTURE PRESENT & COMPATIBLE

---

## 1. Storage & Database Infrastructure
- **Multi-Tenant Scoping**: All database operations route through `getAuthContext()` which resolves `school_id`, `role`, and `userId`.
- **Database Client**: `createScopedClient(authContext)` automatically injects `school_id` into all queries, preventing cross-school data leaks.
- **Offline / Seed Resilience**: In environments where Supabase is not connected, the architecture utilizes deterministic seed fallbacks (e.g. for student rosters, lesson drafts, and sample concept maps) ensuring 100% operational uptime during pilots.

---

## 2. AI Intelligence Infrastructure
- **Provider**: `lib/intelligence/providers/aiProvider.ts` provides `ResilientAIProvider`.
  - **Primary**: Groq (`llama-3.3-70b-versatile`) with JSON response mode for sub-2s inference.
  - **Fallback**: Google Gemini (`gemini-2.5-flash`) with automated error catching.
- **Safety & PII**: `sanitizeAiText` removes potentially harmful markup. Only lesson notes and educational concepts are sent to the AI; zero student PII is exposed.

---

## 3. Mathematical Notation & Diagram Rendering
- **LaTeX / KaTeX**: `katex` package installed. Used by `FormulaRenderer.tsx` for scientific equation rendering.
- **Declarative Diagrams**: `MiniDiagramRenderer.tsx` uses pure, deterministic React SVG components for circuits, capacitors, flowcharts, and comparison tables.

---

## 4. Export Infrastructure
- **A4 PDF Generation**: `html2pdf.js` with off-screen high-DPI canvas captures the exact rendered sheet layout, preventing blank pages and browser viewport cutoffs.

---

## 5. Scope Boundaries for Phase A
- **Included**: Structured mind-map schema, AI concept extraction, visual revision sheet layout, KaTeX formula renderer, declarative mini diagrams, zoom, pan, focus mode, search/highlight, and A4 PDF export.
- **Explicitly Deferred**: In-place editing, section regeneration, quiz mode, SchoolGPT chat integration, student class publishing, collaboration, and PNG export.
