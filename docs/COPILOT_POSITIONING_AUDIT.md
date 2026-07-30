# Copilot Positioning Audit

**Purpose:** Audit and fix Copilot language to be honest about its rules-based nature

---

## CURRENT IMPLEMENTATION

### Actual Architecture: Rules-Based (NOT AI/ML)

**File:** `lib/support-signals/index.ts`

**Core Principle:** 
```
Deterministic rules-based engine that generates support signals from actual student records.
No AI/ML - uses clear, explainable rules on real data.
```

**Rules:**
- Homework gap: 3+ consecutive missed assignments
- Attendance decline: 10%+ drop
- Grade drop: 15%+ drop
- Wellness concern: 2+ consecutive low moods
- Composite signal: 2+ active signals

**Teacher Role:** Final decision maker (teacher must approve support plan)

---

## MISLEADING LANGUAGE FOUND

### 1. "Confidence Score" - MISLEADING

**Location:** `components/copilot/TrustPanel.tsx` line 74
```typescript
{confidenceScore}% confidence
```

**Issue:** Implies AI/ML confidence calculation. Actual value is hardcoded (92%).

**Reality:** This is a deterministic rule, not a probabilistic prediction.

**Fix:** Remove or change to "Pattern Strength" or "Evidence Level"

---

### 2. "Matching Historical Cases" - MISLEADING

**Location:** `components/copilot/TeacherCopilotStrip.tsx` line 13
```typescript
{ label: 'Matching Historical Cases', duration: 600 }
```

**Issue:** Implies ML similarity matching. Actual implementation uses simple rule-based filtering.

**Reality:** Historical lookup is deterministic (same student, same signal type).

**Fix:** Change to "Checking School Memory" or "Reviewing History"

---

### 3. "Calculating Confidence Score" - MISLEADING

**Location:** `components/copilot/TeacherCopilotStrip.tsx` line 14
```typescript
{ label: 'Calculating Confidence Score', duration: 400 }
```

**Issue:** Implies ML confidence calculation. No actual calculation occurs.

**Reality:** Value is hardcoded based on severity.

**Fix:** Remove this step entirely

---

### 4. "28 similar cases found" - MISLEADING

**Location:** `components/copilot/TrustPanel.tsx` line 21
```typescript
{ month: 'Today', type: 'today' as const, events: ['Pattern matches previous cases', '28 similar cases found', 'Confidence: 92%'] }
```

**Issue:** Hardcoded number, not real database query.

**Reality:** School Memory exists but this specific number is fake.

**Fix:** Remove specific count, use general language

---

### 5. "Copilot Analyzing Telemetry" - MISLEADING

**Location:** `components/copilot/TeacherCopilotStrip.tsx` line 69
```typescript
✨ Copilot Analyzing Telemetry...
```

**Issue:** "Telemetry" implies automated data collection. "Copilot" implies AI assistant.

**Reality:** It's analyzing database records using rules.

**Fix:** Change to "Analyzing Student Records" or "Processing Data"

---

### 6. "Why did Copilot recommend this?" - MISLEADING

**Location:** `components/copilot/TrustPanel.tsx` line 71
```typescript
<span>🧠</span> Why did Copilot recommend this?
```

**Issue:** "Copilot" implies AI copilot. "Recommend" implies AI suggestion.

**Reality:** It's a rules-based pattern detection with prepared actions.

**Fix:** Change to "Why was this signal detected?" or "Evidence Summary"

---

## HONEST LANGUAGE RECOMMENDATIONS

### Preferred Terminology

**Instead of:** "AI Copilot"
**Use:** "Decision Support" or "Evidence-Based Detection"

**Instead of:** "Confidence Score"
**Use:** "Evidence Level" or "Pattern Strength"

**Instead of:** "Matching Historical Cases"
**Use:** "Checking School Memory" or "Reviewing History"

**Instead of:** "Calculating Confidence"
**Use:** Remove entirely (no calculation occurs)

**Instead of:** "28 similar cases"
**Use:** "Historical patterns" or "Previous interventions"

**Instead of:** "Copilot Analyzing Telemetry"
**Use:** "Analyzing Student Records"

**Instead of:** "Why did Copilot recommend this?"
**Use:** "Why was this signal detected?"

---

## POSITIVE ASPECTS TO PRESERVE

### 1. Teacher as Decision Maker ✅

**Current:** Teacher must approve support plan
**Status:** Already correct - preserve this

### 2. Evidence-Based ✅

**Current:** Shows actual homework, attendance, grades data
**Status:** Already correct - preserve this

### 3. Transparent Reasoning ✅

**Current:** Shows which signals were used/ignored
**Status:** Already correct - preserve this

---

## REQUIRED CHANGES

### Priority 1: Remove Fake Confidence

**Files:**
- `components/copilot/TeacherCopilotStrip.tsx` - Remove "Calculating Confidence Score" step
- `components/copilot/TrustPanel.tsx` - Remove or change "confidenceScore%" display

**Action:** 
- Remove confidence score from UI
- Replace with "Evidence Level: High/Medium/Low" based on severity

### Priority 2: Fix Historical Cases Count

**Files:**
- `components/copilot/TrustPanel.tsx` - Remove "28 similar cases found"

**Action:**
- Use real School Memory data or remove specific count
- Change to "School Memory: Available" or "Previous interventions: Yes"

### Priority 3: Update Thinking Animation

**Files:**
- `components/copilot/TeacherCopilotStrip.tsx` - Update THINKING_STEPS

**Action:**
- Change "Matching Historical Cases" to "Checking School Memory"
- Remove "Calculating Confidence Score"
- Change "Copilot Analyzing Telemetry" to "Analyzing Student Records"

### Priority 4: Update Headers/Labels

**Files:**
- `components/copilot/TrustPanel.tsx` - Update "Why did Copilot recommend this?"

**Action:**
- Change to "Why was this signal detected?"
- Update "Copilot Reasoning" to "Signal Detection Reasoning"

---

## HONEST POSITIONING STATEMENT

**Current (Misleading):**
"Copilot uses AI to analyze student data and recommend interventions with 92% confidence based on 28 similar historical cases."

**Honest (Accurate):**
"ShikshaSetu detects patterns in student records using clear rules. When a pattern is found, it prepares evidence-based support options for teacher review. The teacher always makes the final decision. School Memory remembers what worked for each student so future support is informed by past outcomes."

---

## DECISION

**Action:** Implement Priority 1-4 changes to make language honest

**Time Required:** 30-45 minutes

**Risk:** Low - these are text/label changes only

**Benefit:** Judges will understand the actual implementation and appreciate the transparency

---

## FILES TO MODIFY

1. `components/copilot/TeacherCopilotStrip.tsx` - Update thinking steps and labels
2. `components/copilot/TrustPanel.tsx` - Update confidence display and historical cases
3. `components/copilot/InterventionTimeline.tsx` - Check for similar issues
4. `components/copilot/CopilotDrawer.tsx` - Check for similar issues

---

## IMPLEMENTATION PLAN

1. Update THINKING_STEPS in TeacherCopilotStrip.tsx
2. Remove confidence score display from TrustPanel.tsx
3. Update "Why did Copilot recommend this?" to "Why was this signal detected?"
4. Remove hardcoded "28 similar cases" from timeline
5. Update "Copilot Reasoning" to "Signal Detection Reasoning"
6. Test all Copilot components to ensure changes are consistent
