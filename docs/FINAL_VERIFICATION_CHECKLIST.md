# Final Verification Checklist

**Purpose:** Production build, TypeScript, console, manual verification, 3x demo cycle

---

## 1. PRODUCTION BUILD

### Command to Run:
```bash
npm run build
```

### Expected Results:
- ✅ Build completes without errors
- ✅ No TypeScript compilation errors
- ✅ No linting errors
- ✅ Build output in `.next` directory
- ✅ Static assets generated correctly

### Known Issues to Watch For:
- TypeScript errors in modified files
- Missing imports in new server action
- Lint errors in Copilot components (already fixed)

### Status: MANUAL VERIFICATION REQUIRED
**Action Required:** Run `npm run build` and verify no errors

---

## 2. TYPESCRIPT CHECK

### Command to Run:
```bash
npx tsc --noEmit
```

### Expected Results:
- ✅ No TypeScript errors
- ✅ All types properly defined
- ✅ No implicit any errors

### Files Modified During Hardening:
- `app/actions/schoolMemoryActions.ts` - New file, verify types
- `components/demo/ConnectedExperienceCenter.tsx` - Modified, verify types
- `components/copilot/TeacherCopilotStrip.tsx` - Modified, verify types
- `components/copilot/TrustPanel.tsx` - Modified, verify types

### Status: MANUAL VERIFICATION REQUIRED
**Action Required:** Run TypeScript check and verify no errors

---

## 3. CONSOLE CHECK

### Browser Console Errors to Check For:
- ✅ No React errors
- ✅ No hydration errors
- ✅ No missing module errors
- ✅ No network errors (404, 500)
- ✅ No unhandled promise rejections

### Routes to Check:
- `/` - Landing page
- `/demo/connected` - Connected Experience Center
- `/teacher` - Teacher portal
- `/parent` - Parent portal
- `/student` - Student portal
- `/admin` - Admin portal
- `/gate` - Gate portal

### Status: MANUAL VERIFICATION REQUIRED
**Action Required:** Open each route in browser and check console

---

## 4. MANUAL VERIFICATION

### Connected Demo Flow (/demo/connected):

**Step 1: Initial State**
- [ ] Page loads without errors
- [ ] Aarav Sharma profile displayed
- [ ] "Aarav needs support" status shown
- [ ] Evidence cards displayed (homework, attendance, classroom)
- [ ] Teacher decision panel visible
- [ ] Support plan steps listed

**Step 2: Approve Support**
- [ ] Click "Coordinate Support" button
- [ ] Loading state shown
- [ ] No errors in console
- [ ] Transition to "Getting help" state
- [ ] Visual journey displayed
- [ ] Timeline shows approval

**Step 3: Complete Task**
- [ ] Click "Mark Practice Complete" button
- [ ] Loading state shown
- [ ] No errors in console
- [ ] Transition to "Back on track" state
- [ ] School Memory displayed
- [ ] Success message shown

**Step 4: Reset Demo**
- [ ] Click "Reset Demo" button
- [ ] Loading state shown
- [ ] No errors in console
- [ ] Return to initial state
- [ ] All data cleared

### Status: MANUAL VERIFICATION REQUIRED
**Action Required:** Manually test Connected Demo flow

---

## 5. 3X DEMO CYCLE

### Cycle 1: Full Flow
1. Load `/demo/connected`
2. Approve support plan
3. Complete task
4. Verify School Memory
5. Reset demo
6. Verify return to initial state

### Cycle 2: Full Flow
1. Load `/demo/connected`
2. Approve support plan
3. Complete task
4. Verify School Memory
5. Reset demo
6. Verify return to initial state

### Cycle 3: Full Flow
1. Load `/demo/connected`
2. Approve support plan
3. Complete task
4. Verify School Memory
5. Reset demo
6. Verify return to initial state

### Expected Results:
- ✅ All cycles complete successfully
- ✅ No errors in any cycle
- ✅ Consistent behavior across cycles
- ✅ Reset works reliably

### Status: MANUAL VERIFICATION REQUIRED
**Action Required:** Run 3 complete demo cycles

---

## 6. PORTAL VERIFICATION

### Teacher Portal (/teacher):
- [ ] Page loads without errors
- [ ] Dashboard displays correctly
- [ ] Navigation works
- [ ] No console errors

### Parent Portal (/parent):
- [ ] Page loads without errors
- [ ] Dashboard displays correctly
- [ ] Navigation works
- [ ] No console errors

### Student Portal (/student):
- [ ] Page loads without errors
- [ ] Dashboard displays correctly
- [ ] Navigation works
- [ ] No console errors

### Admin Portal (/admin):
- [ ] Page loads without errors
- [ ] Dashboard displays correctly
- [ ] Navigation works
- [ ] No console errors

### Gate Portal (/gate):
- [ ] Page loads without errors
- [ ] Scan interface works
- [ ] No console errors

### Status: MANUAL VERIFICATION REQUIRED
**Action Required:** Test each portal

---

## 7. DATA PERSISTENCE CHECK

### School Memory:
- [ ] Interventions saved to database
- [ ] Tasks saved to database
- [ ] Milestones saved to database
- [ ] Reset clears data correctly

### Status: MANUAL VERIFICATION REQUIRED
**Action Required:** Check Supabase database

---

## VERIFICATION SUMMARY

### Automated Checks (Can Run Now):
- [ ] Production build: `npm run build`
- [ ] TypeScript check: `npx tsc --noEmit`

### Manual Checks (Require Browser):
- [ ] Console check for all routes
- [ ] Connected Demo flow test
- [ ] 3x demo cycle test
- [ ] Portal verification
- [ ] Data persistence check

---

## KNOWN ISSUES FROM HARDENING

### Fixed:
- ✅ Copilot lint errors (historicalEvidence property removed)
- ✅ Copilot language (confidence, similar cases)
- ✅ Connected Demo text simplification

### To Monitor:
- ⚠️ Hero button opens role selector instead of demo modal (documented in Watch Demo Entry Audit)
- ⚠️ Reset button not disabled during operations (documented in Failure Test Audit)

---

## VERDICT

**Status:** READY FOR MANUAL VERIFICATION

**Next Steps:**
1. Run production build
2. Run TypeScript check
3. Open browser and test Connected Demo flow
4. Run 3x demo cycle
5. Test all portals
6. Check console for errors

**Expected Outcome:** All checks pass with no critical errors
