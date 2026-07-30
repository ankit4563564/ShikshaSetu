# SchoolGPT Truth Test Report

**Date:** 2026-07-30  
**Purpose:** Determine if SchoolGPT uses real LLM models or is hardcoded/fake

---

## IMPLEMENTATION AUDIT

### Architecture: REAL LLM Implementation

**File:** `lib/schoolgpt/generateResponse.ts`

**LLM Providers:**
1. **Primary:** Groq API (`llama-3.3-70b-versatile`)
   - Endpoint: `https://api.groq.com/openai/v1/chat/completions`
   - Environment variable: `GROQ_API_KEY`
   - Validation: Checks if key starts with `gsk_`
   - Timeout: 12 seconds
   - Response format: JSON object

2. **Fallback:** Gemini API (`gemini-2.5-flash`)
   - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
   - Environment variables: `GEMINI_API_KEY` or `GOOGLE_AI_API_KEY`
   - Timeout: 12 seconds
   - Response format: JSON object

### Data Grounding: REAL

**File:** `app/actions/schoolgptActions.ts`

**Database Retrievers:**
- `retrieveAttendance()` - Real Supabase attendance data
- `retrieveAttendanceTrends()` - Real Supabase attendance trends
- `retrieveHomework()` - Real Supabase homework data
- `retrieveTimetable()` - Real Supabase timetable data
- `retrieveStudentPerformance()` - Real Supabase grades data
- `retrieveStudentNeedingAttention()` - Real Supabase student data
- `retrieveBus()` - Real Supabase bus data
- `retrieveExams()` - Real Supabase exams data
- `retrieveEvents()` - Real Supabase events data
- `retrieveNotices()` - Real Supabase notices data
- `retrieveLibrary()` - Real Supabase library data
- `retrieveRules()` - Real Supabase rules data
- `retrieveClubs()` - Real Supabase clubs data
- `retrieveTeachers()` - Real Supabase teachers data

### Deterministic Fast-Path: REAL

**Condition:** If `queryPlan.isDeterministic` is true and data is available

**Behavior:** Returns response directly from data layer without LLM call

**Purpose:** Instant response for simple lookup queries (e.g., "What homework is due?")

### Fallback Logic: REAL

**Condition:** If both Groq and Gemini API calls fail or API keys are missing

**Behavior:** Returns structured fallback response using retrieved data

**Example fallback:**
```
"I couldn't find specific records matching your query in the current database. 
Please feel free to rephrase or explore the portal options."
```

---

## ENVIRONMENT VARIABLE STATUS

**File:** `.env.example`

**Required Variables:**
```
GROQ_API_KEY=
GEMINI_API_KEY=
GOOGLE_AI_API_KEY=
```

**Actual Configuration:** 
- `.env.local` file does not exist in repository
- Cannot verify if API keys are actually configured in deployment environment

---

## EXECUTION FLOW

```
User Query
→ Intent Classification
→ Permission Boundary Check
→ Clarification Check (if ambiguous)
→ Query Planning
→ Database Retrieval (REAL Supabase data)
→ Hybrid Retrieval
→ Response Generation:
  ├─ If deterministic: Return data directly (no LLM)
  ├─ Try Groq API (if GROQ_API_KEY exists)
  ├─ Try Gemini API (if GEMINI_API_KEY exists)
  └─ Fallback to structured response (if no API keys)
→ Response Guard (role-based sanitization)
→ Return to UI
```

---

## VERDICT

**Architecture:** ✅ REAL - Not fake, uses actual LLM APIs  
**Data Grounding:** ✅ REAL - Uses actual Supabase data  
**Fallback:** ✅ REAL - Graceful degradation when API keys missing  
**Runtime Status:** ❓ UNKNOWN - Depends on environment variable configuration

---

## RISK ASSESSMENT

### High Risk: Judge clicks SchoolGPT, gets fallback response

**Scenario:** 
- Judge asks "How is Aarav doing?"
- System returns: "I couldn't find specific records matching your query..."
- Judge thinks: "The AI doesn't work"
- Hackathon score: Reduced

### Root Cause
- API keys may not be configured in deployment environment
- Fallback response is generic and doesn't demonstrate AI capability

---

## RECOMMENDATION

### Option A: Verify API Keys (Preferred if time permits)

**Action:**
1. Check if `GROQ_API_KEY` or `GEMINI_API_KEY` is configured in deployment
2. If yes: Test SchoolGPT with realistic queries
3. If working: Keep SchoolGPT in demo
4. If not working: Configure API keys or proceed to Option B

**Time Required:** 15-30 minutes

### Option B: Hide SchoolGPT from Primary Judge Demo (Safer)

**Action:**
1. Remove SchoolGPT from landing page primary demo flow
2. Keep SchoolGPT available only in dedicated `/schoolgpt` route (if exists)
3. Focus judge demo on Connected Experience (which is fully working)
4. Do not mention SchoolGPT in primary presentation

**Time Required:** 5-10 minutes

### Option C: Add Honest Labeling (If keeping visible)

**Action:**
1. Add clear label: "SchoolGPT (Demo Mode - Requires API Key)"
2. Add explanatory text: "AI responses require API configuration. Currently showing structured responses."
3. Ensure judge understands this is a demo limitation, not a product failure

**Time Required:** 10 minutes

---

## DECISION

**Recommended:** Option B (Hide from Primary Demo)

**Reasoning:**
- Connected Experience is the strongest differentiator and is fully working
- SchoolGPT adds complexity and risk without guaranteed payoff
- Judges will be impressed by the real cross-portal coordination
- SchoolGPT can be re-enabled later when API keys are properly configured

**Alternative:** If you have API keys configured, proceed with Option A and verify runtime behavior.

---

## EVIDENCE

**Files Reviewed:**
- `lib/schoolgpt/generateResponse.ts` - LLM implementation
- `app/actions/schoolgptActions.ts` - Server action with database retrievers
- `.env.example` - Environment variable template

**Key Code Snippets:**
```typescript
// Groq API call
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey || !apiKey.startsWith('gsk_')) return null;

// Gemini API call
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
if (!apiKey) return null;

// Fallback
return buildFinalResponse(
  data || 'I couldn\'t find specific records matching your query...',
  modulesConsulted,
  intent,
  retrievedConfidence,
  undefined,
  role as SchoolRole
);
```

---

## CONCLUSION

SchoolGPT has a **real LLM implementation** with proper architecture and data grounding. However, its runtime behavior depends on API key configuration. Without verified API keys, it will fall back to structured responses, which may disappoint judges during a hackathon demo.

**Safe approach:** Hide SchoolGPT from primary judge demo, focus on Connected Experience which is guaranteed to work.
