# ShikshaSetu — Advanced Visual Mind Map Implementation Plan
**Reference-Based Educational Revision Concept Sheet System**

---

## Executive Summary
This document defines the technical architecture, data model, AI generation pipeline, visual layout engine, and component architecture for the **ShikshaSetu Advanced Visual Mind Map System**.

Unlike generic hierarchical node graphs (trees or force-directed spider graphs), this system builds **dense, color-coded, one-page revision concept sheets** modelled after professional educational study posters and textbook revision guides.

---

## 1. Existing Architecture Analysis

### 1.1 File Upload & Text Extraction Architecture
- **Current State**: 
  - `CsvBulkImport.tsx` handles client-side CSV parsing.
  - Image handling is supported via client-side base64 / blob URLs and Supabase storage bucket references.
- **Mind Map Pipeline Addition**:
  - Accept text input, PDF (`pdf-parse` / `pdfjs-dist`), DOCX (`mammoth`), and image uploads (`Tesseract.js` / Gemini Multimodal OCR).
  - Server-side document chunking and text normalization pipeline.

### 1.2 Existing AI Provider Architecture
- **Current State**:
  - `lib/intelligence/providers/aiProvider.ts` provides `ResilientAIProvider` orchestrating Groq (`llama-3.3-70b-versatile`) with automatic fallback to Google Gemini (`gemini-2.5-flash`).
  - Response formatting enforces `{ response_format: { type: "json_object" } }` with schema validation and sanitization (`sanitizeAiText`).
- **Mind Map Pipeline Reuse**:
  - Reuse `ResilientAIProvider` with specialized system prompts enforcing the exact Mind Map JSON schema, strict mathematical formula extraction (LaTeX/KaTeX), and structured declarative diagram tokens.

### 1.3 Existing Storage & Multi-Tenancy
- **Current State**:
  - Multi-tenant isolation enforced via `school_id` tenant keys, `getAuthContext()`, `requirePermission()`, and `createScopedClient()`.
  - Supabase database migrations with RLS (e.g., `032_multi_tenant_schools.sql`, `033_enforce_tenant_rls.sql`).
- **Mind Map Storage**:
  - New dedicated tables: `study_notes`, `concept_mindmaps`, `mindmap_sections`.
  - Storage bucket: `study-materials` (scoped per tenant school).

---

## 2. New Data Models & Database Schema

### 2.1 Table: `study_notes`
Tracks uploaded raw material, source document metadata, and ownership.
```sql
CREATE TABLE study_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL, -- teacher_id or student_id
  owner_role TEXT NOT NULL CHECK (owner_role IN ('teacher', 'student')),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  section TEXT,
  file_url TEXT,
  file_type TEXT CHECK (file_type IN ('pdf', 'docx', 'image', 'text')),
  raw_text TEXT NOT NULL,
  page_count INT DEFAULT 1,
  is_published BOOLEAN DEFAULT false, -- If true, accessible by assigned class students
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

### 2.2 Table: `concept_mindmaps`
Stores generated visual mind-map state, layout configs, and revision metadata.
```sql
CREATE TABLE concept_mindmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  note_id UUID NOT NULL REFERENCES study_notes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  layout_mode TEXT DEFAULT 'exam_revision' CHECK (layout_mode IN ('auto', 'compact', 'exam_revision', 'presentation')),
  mindmap_data JSONB NOT NULL, -- Full structured JSON
  is_published BOOLEAN DEFAULT false,
  published_by UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

---

## 3. Structured Mind-Map JSON Schema

The AI generator and storage layer strictly adhere to the following schema:

```typescript
export type ConceptAccentColor = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'teal';

export type MindMapItemType =
  | 'concept'
  | 'definition'
  | 'formula'
  | 'example'
  | 'key_point'
  | 'condition'
  | 'comparison'
  | 'process'
  | 'diagram'
  | 'warning'
  | 'shortcut';

export interface MindMapItem {
  id: string;
  type: MindMapItemType;
  title?: string;
  content: string; // KaTeX equations enclosed in standard notation e.g. $C = \frac{\varepsilon A}{d}$
  details?: string;
  diagramType?: 'circuit' | 'capacitor' | 'process-flow' | 'comparison-table' | 'hierarchy' | 'custom-svg';
  diagramData?: Record<string, any>;
  source?: {
    page?: number;
    section?: string;
    excerpt?: string;
  };
}

export interface MindMapSection {
  id: string;
  title: string;
  accent: ConceptAccentColor;
  importance: 'high' | 'medium' | 'low';
  summary?: string;
  items: MindMapItem[];
  connections: Array<{
    targetSectionId: string;
    relationshipLabel?: string;
    type?: 'depends_on' | 'contrasts_with' | 'derives' | 'combines_to';
  }>;
  gridSpan?: {
    cols: number; // 1 to 3 column span in responsive revision sheet
    rows?: number;
  };
}

export interface ConceptMindMapData {
  title: string;
  subject: string;
  grade: string;
  summary: string;
  keyFormulasSummary: string[];
  sections: MindMapSection[];
}
```

---

## 4. Visual Layout & Sheet Rendering Engine

### 4.1 Editorial Revision Sheet Architecture
The layout mimics a single, dense A4 / poster revision sheet:
1. **Header Banner**: Chapter Title, subject badge, 2-line conceptual summary, and quick formula strip.
2. **Dense Multi-Column Grid (CSS Grid + Dynamic Area Packing)**:
   - Sections auto-fit into high-density 3-column / 2-column balanced layouts.
   - High importance concepts (e.g. Fundamental Laws, Key Formulas) span 2 columns with prominent borders.
3. **SVG Connection Layer**:
   - Bezier curve relationship connectors rendered in an overlaid absolute SVG layer connecting card anchor points.
   - Interactive line highlights on hover/focus.
4. **Card Visual Style**:
   - Pure white/cream background `#FFFFFF` / `#FBFBFA`.
   - 1.5px solid borders with 20px rounded corners.
   - Left accent color border (4px) + color-coded section tag badge.
   - Zero excessive shadows or blurred glassmorphism. Crisp, high-contrast academic typography (Outfit/Inter + JetBrains Mono for formulas).

---

## 5. Mathematical Formula Rendering (KaTeX)
- Formulas are parsed and rendered via lightweight `katex` (React KaTeX wrapper).
- Full support for fractions, superscripts, subscripts, matrices, and Greek symbols:
  $$\text{Equivalent Capacitance in Parallel:} \quad C_p = C_1 + C_2 + C_3 + \dots$$
  $$\text{Energy Stored:} \quad U = \frac{1}{2} C V^2 = \frac{Q^2}{2C}$$
- Fallback math formatting for text copied or exported to plain text.

---

## 6. Declarative Mini-Diagram System
Rather than generating unpredictable pixel images, the AI outputs declarative diagram tokens:
- **`parallel-capacitor` / `series-circuit`**: Clean SVG circuit diagram with labelled plates and dielectric constants.
- **`process-flow`**: Step-by-step horizontal or vertical sequence diagram.
- **`comparison-table`**: Side-by-side contrast card (e.g., Series vs. Parallel).
- **`geometry-physics`**: Clean geometrical representation of electric field vectors or force setups.

---

## 7. Interactive Modes & Exploration

1. **Normal Mode**: Complete, dense revision poster.
2. **Focus Mode**: Clicking any section zooms in/highlights that topic and fades unrelated cards to 20% opacity.
3. **Revision Mode**: Highlights all formulas, key definitions, and exam warning alerts.
4. **Quiz / Active Recall Mode**: Selectively masks formula answers and definitions with interactive tap-to-reveal scratchcards.
5. **Section Detail Drawer**:
   - Opens drawer with expanded explanations, source text excerpts, and 1-click **Explain with SchoolGPT** or **Generate 3 Practice Questions**.

---

## 8. In-Place Section Editing & Selective Regeneration

- **Direct Editing**: Teachers can click edit on any section title, formula, text block, or change the accent color without regenerating the whole map.
- **Single-Section Regeneration**: If a teacher wants more examples or clearer definitions for "Dielectric Breakdown", the client calls `regenerateMindMapSectionAction({ sectionId, prompt })`, updating only that specific section while preserving all other manual customizations.

---

## 9. High-Fidelity Export (PDF, PNG, Print)

- **Target**: Clean 1-page A4 landscape or portrait revision sheet.
- **Engine**: Captured via off-screen high-DPI canvas overlay (`html2pdf.js` / native vector `window.print()`).
- **Formatting Preservation**: Preserves KaTeX formulas, crisp SVG arrows, color tags, and typography.

---

## 10. Security & Tenant Isolation

- **Role Permissions**:
  - `teacher`: `notes:write`, `notes:publish`, `mindmap:edit`.
  - `student`: `notes:read_own`, `notes:read_class_shared`.
  - `parent`: `notes:read_child_shared`.
- **Tenant Boundary**: Enforced on every database read/write via `createScopedClient(authContext)`.
- **Zero Student PII sent to LLM**: Only curriculum topic text, extracted notes, and formulas are processed by the AI.

---

## 11. Phase-by-Phase Implementation Roadmap

```
Phase A: TypeScript Schemas & KaTeX Formula Renderer
    ↓
Phase B: Document Text Extraction Pipeline (PDF, Text, Docx)
    ↓
Phase C: AI Concept & Mind Map Extraction Service (ResilientAIProvider)
    ↓
Phase D: Educational Poster Visual Layout Engine & SVG Connectors
    ↓
Phase E: Interactive Study Modes (Focus, Revision, Quiz Recall)
    ↓
Phase F: Side Detail Drawer & SchoolGPT Actions (Explain, Quiz)
    ↓
Phase G: In-Place Editing & Single-Section Regeneration
    ↓
Phase H: 1-Page A4 PDF / High-Res PNG / Print Export
    ↓
Phase I: Teacher Class Publishing & Student Workspace Integration
```

---

## 12. Verification & Testing Strategy
- **Unit Tests**:
  - Formula KaTeX validation tests.
  - Mind Map JSON schema validation and sanitization.
  - Layout packing coordinate calculations and collision tests.
- **Integration Tests**:
  - Teacher note upload $\rightarrow$ concept map generation $\rightarrow$ publication to class.
  - Student note access permissions and quiz mode interactions.
- **Export Verification**:
  - Validate non-blank A4 PDF export with formulas and mini-diagrams rendered.
