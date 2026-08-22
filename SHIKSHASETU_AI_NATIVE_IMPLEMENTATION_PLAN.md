# SHIKSHASETU — AI-NATIVE TIER 2/3 SCHOOL EXPERIENCE IMPLEMENTATION PLAN
**Version**: 1.0  
**Author**: Senior AI Architect & Lead Product Engineer  
**Date**: August 17, 2026  
**Status**: Technical Architecture & Execution Plan  

---

## 1. EXISTING ARCHITECTURE REUSED

The implementation plan builds strictly on ShikshaSetu's existing production-connected infrastructure without introducing duplicate frameworks or unnecessary dependencies:

- **Server Security & Multi-Tenancy**: [getAuthContext.ts](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/lib/auth/getAuthContext.ts), `requirePermission()`, [scoped.ts](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/lib/supabase/scoped.ts), PostgreSQL Row-Level Security (RLS).
- **Intelligence Engine**: [buildStudentContext.ts](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/lib/intelligence/context/buildStudentContext.ts), [analyzeStudentSignals.ts](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/lib/intelligence/services/analyzeStudentSignals.ts), [ruleEvaluator.ts](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/lib/rules-engine/ruleEvaluator.ts).
- **Domain Server Actions**: [interventionActions.ts](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/app/actions/interventionActions.ts), [student360Actions.ts](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/app/actions/student360Actions.ts), [homeworkActions.ts](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/app/actions/homeworkActions.ts), [marksActions.ts](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/app/actions/marksActions.ts).
- **Localization Infrastructure**: [LanguageContext.tsx](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/components/shared/LanguageContext.tsx) (providing `en`, `hi`, and `mr` translation keys).

---

## 2. FILES TO MODIFY

1. **`[MODIFY]` [buildStudentContext.ts](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/lib/intelligence/context/buildStudentContext.ts)**:
   - Upgrade longitudinal student context builder to aggregate 6-week attendance trends, homework completion trends, subject-specific exam trends, and active intervention outcomes pre-scoped to `school_id`.
2. **`[MODIFY]` [analyzeStudentSignals.ts](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/lib/intelligence/services/analyzeStudentSignals.ts)**:
   - Enhance multi-signal correlation algorithm (Attendance ↓ + Homework ↓ + Marks ↓ = High Confidence Academic Flag).
   - Add subject-specific analysis (e.g. Mathematics declining vs English improving).
3. **`[MODIFY]` [Student360Modal.tsx](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/components/teacher/Student360Modal.tsx)**:
   - Refactor first viewport to answer *"Why does this student need attention today?"* within 5 seconds (Top 3 Signals, Evidence, Trend, AI Explanation, Explicit Human Approval Button).
4. **`[MODIFY]` [ParentTodayClientRefactored.tsx](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/components/parent/ParentTodayClientRefactored.tsx)**:
   - Streamline parent timeline ("What happened with my child today?") displaying arrival, homework, and dismissal events in authorized regional language context.
5. **`[MODIFY]` [LanguageContext.tsx](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/components/shared/LanguageContext.tsx)**:
   - Expand translation dictionary keys for teacher roll call, gate verification, student support, and homework submission in English (`en`) and Hindi (`hi`).

---

## 3. FILES TO CREATE

1. **`[NEW]` [teacherAiActions.ts](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/app/actions/teacherAiActions.ts)**:
   - Implement `generateHomeworkDraftAction` and `generateTestPaperDraftAction`.
   - Requires `getAuthContext()` and `requirePermission(context, 'homework:write')`.
   - Returns structured draft payload for human teacher review/edit before DB insertion.
2. **`[NEW]` [voiceActions.ts](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/app/actions/voiceActions.ts)**:
   - Implement `processVoiceIntentAction`.
   - Accepts audio transcript/speech intent string.
   - Enforces `getAuthContext()`, verifies role permissions, maps natural language intent to existing authorized server queries/actions, and returns structured result.
3. **`[NEW]` [aiNative.test.ts](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/tests/intelligence/aiNative.test.ts)**:
   - Vitest test suite for longitudinal context, multi-signal correlation, draft generation authorization, Hindi localization, and voice authorization security.

---

## 4. DATABASE CHANGES

- **Zero Schema Overhaul Required**.
- All AI workflows operate against existing PostgreSQL tables (`attendance`, `homework`, `homework_submissions`, `exams`, `grades`, `interventions`, `intervention_milestones`, `student_tasks`, `gate_passes`, `gate_pass_audit_logs`).

---

## 5. AI DATA FLOW & HUMAN-IN-THE-LOOP ARCHITECTURE

```
Server Request ➔ getAuthContext() ➔ buildStudentContext() ➔ Rule Heuristic / Provider ➔ Schema Validation ➔ UI Review Card ➔ Teacher Approval ➔ Server Action Mutation
```

1. **Server-Constructed Context**: Client submits only target `studentId`. Server fetches authorized metrics via `createScopedClient()`.
2. **PII Redaction**: Student names, parent phone numbers, and addresses are stripped before LLM processing.
3. **Structured Validation**: Outputs are parsed against Zod schemas ([signalAnalysisSchema.ts](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/lib/intelligence/schemas/signalAnalysisSchema.ts)).
4. **Strict Human Review**: AI **NEVER** mutates student interventions or publishes homework/tests automatically. Every action requires explicit teacher confirmation (`[ APPROVE SUPPORT PLAN ]` or `[ PUBLISH ASSIGNMENT ]`).

---

## 6. SECURITY & PRIVACY MODEL

- **Tenant Scope Guarantee**: Every AI context query filters strictly by `school_id = current_user_school_id()`.
- **Role-Based Permission Rules**:
  - Teacher context builder verifies class teacher assignment (`students:read_class`).
  - Parent voice query verifies `guardian_access` relationship (`can_pickup` / `relationship`).
- **No Unrestricted Database Dumps**: Prompts contain only aggregated metrics, not full DB dumps or private counselor notes.

---

## 7. REGIONAL LANGUAGE LOCALIZATION MODEL

- **Translation Dictionary Scope**: Centralized in [LanguageContext.tsx](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/components/shared/LanguageContext.tsx).
- **Core Languages**:
  - `en` (English)
  - `hi` (Hindi — *हिंदी*)
- **Translation Key Standard**:
  - `teacher.take_attendance`: *"Take Attendance"* / *"हाजिरी लगाएं"*
  - `parent.today_status`: *"Child Arrival Status"* / *"बच्चे की स्थिति"*
  - `gate.verified`: *"Verified Pickup"* / *"सत्यापित पिकअप"*

---

## 8. VOICE-FIRST ARCHITECTURE

Natural language inputs are processed through an intent-mapping server action that enforces strict authorization:

```typescript
// app/actions/voiceActions.ts
export async function processVoiceIntentAction(speechInput: string) {
  const context = await getAuthContext();
  
  // 1. Detect Intent
  const intent = parseIntent(speechInput); // e.g. 'check_attendance' | 'view_signals'
  
  // 2. Authorize Intent against Role Context
  if (intent === 'check_attendance') {
    requirePermission(context, 'attendance:read');
    return getStudentAttendanceSummary(context);
  }
  
  // 3. Return Authorized Structured Payload
}
```

---

## 9. UX ENHANCEMENTS FOR TIER 2/3 USERS

- **Student 360 First Viewport**:
  - Student photo + display name + grade/section.
  - Top 3 Signals with clear trend arrows (e.g. `Attendance 81% ↓ 8%`, `Homework 64% ↓ 17%`).
  - Plain-language AI explanation.
  - Action button: **`[ APPROVE SUPPORT PLAN ]`**.
- **Parent Today Timeline**:
  - Simple chronological card feed: Arrival ➔ Classroom Activity ➔ Assigned Homework ➔ Dismissal Checkout.

---

## 10. TESTING SPECIFICATION

The new test suite [tests/intelligence/aiNative.test.ts](file:///c:/Users/Mannuuu/Desktop/DUO/MAIN/tests/intelligence/aiNative.test.ts) will cover:
1. **Multi-Signal Correlation**: Verifies high-confidence warning generated when attendance, homework, and marks decline simultaneously.
2. **Subject-Specific Analysis**: Verifies math decline detected independently from English progress.
3. **AI Draft Generation Security**: Ensures unauthenticated or unauthorized users cannot generate homework/test drafts.
4. **Localization Key Fallback**: Verifies missing Hindi translation keys fall back gracefully to English.
5. **Voice Authorization Boundary**: Verifies voice queries for unauthorized students are rejected with `Permission denied`.

---

## 11. IMPLEMENTATION SEQUENCE

1. **Phase 1 (Longitudinal Context & Signals)**: Upgrade `buildStudentContext.ts` and `analyzeStudentSignals.ts`.
2. **Phase 2 (Teacher AI Drafting)**: Create `app/actions/teacherAiActions.ts` for homework & test paper draft generation.
3. **Phase 3 (Localization & Voice)**: Expand `LanguageContext.tsx` and create `app/actions/voiceActions.ts`.
4. **Phase 4 (Student 360 & Parent Today UX)**: Update `Student360Modal.tsx` and `ParentTodayClientRefactored.tsx`.
5. **Phase 5 (Testing & Verification)**: Run Vitest, tsc, lint, build, and Playwright verification.

---

## 12. EXPLICITLY DEFERRED FEATURES

The following features are **STRICTLY EXCLUDED** from this phase:
- ❌ Generic "Ask anything" SchoolGPT chatbot drawer.
- ❌ Canteen / Vendor ERP modules.
- ❌ Library management modules.
- ❌ Hardware GPS vehicle integration.
- ❌ WhatsApp Business API gateway.
- ❌ Fee payment gateway.

---
*Implementation Plan Complete. Standing by for approval to begin code modifications.*
