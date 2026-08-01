# Homework Data Inconsistency Investigation Report

## Issue
Parent Dashboard shows homework data (4 completed, 6 pending, 4/10 progress) but SchoolGPT responds with "No homework records found."

## Investigation Results

### Parent Dashboard Data Flow

**File**: `lib/supabase/getStudentsData.ts` (lines 246-247)

**Query**:
```typescript
supabase.from('homework')
  .select('id, student_id, subject, title, due_date, submitted_at, is_submitted')
  .in('student_id', studentIds)
```

**Filters**:
- Uses `studentIds` array (batch query for multiple students)
- No additional filters on class, session, or date

**Status Logic**:
- Uses `is_submitted` field directly from database
- Maps to `isSubmitted` in component props

**Display**:
- `ParentTodayClientRefactored.tsx` (lines 465-466, 510-518)
- Shows: `{activeStudent?.homework?.filter(h => h.isSubmitted).length} completed`
- Shows: `{activeStudent?.homework?.filter(h => !h.isSubmitted).length} pending`
- Progress bar: `(completed / total) * 100%`

### SchoolGPT Data Flow

**File**: `lib/schoolgpt/retrievers.ts` (lines 51-69)

**Query**:
```typescript
adminDb.from('homework')
  .select('subject, title, due_date, is_submitted')
  .eq('student_id', studentId)
  .order('due_date', { ascending: false })
  .limit(20)
```

**Filters**:
- Uses single `studentId` (not array)
- No additional filters on class, session, or date

**Status Logic**:
- Uses `is_submitted` field directly from database
- Filters: `pending = data.filter(h => !h.is_submitted)`, `submitted = data.filter(h => h.is_submitted)`

**Display**:
- Updated response format (after fix):
  ```
  Homework Summary
  • Total assignments: {total}
  • Completed: {submitted.length}
  • Pending: {pending.length}
  
  Recent assignments:
  {list of assignments}
  ```

### Comparison

| Aspect | Parent Dashboard | SchoolGPT |
|--------|------------------|-----------|
| **Database Table** | `homework` | `homework` |
| **Status Field** | `is_submitted` | `is_submitted` |
| **Status Logic** | Direct boolean check | Direct boolean check |
| **Query Method** | `.in('student_id', studentIds)` | `.eq('student_id', studentId)` |
| **Client Type** | Server client (RLS) | Admin client (bypasses RLS) |
| **Student ID Source** | From `getStudentsData()` | From `askSchoolGPTAction` props |

### Root Cause Analysis

**Primary Issue**: Student ID Mismatch

The Parent Dashboard and SchoolGPT may be using different student IDs:

1. **Parent Dashboard**: Gets student IDs from `getStudentsData()` which queries the `students` table
2. **SchoolGPT**: Gets student ID from component props passed through `askSchoolGPTAction`

**Potential Mismatch Points**:
- Demo mode vs. live authentication
- Clerk user ID vs. database student ID
- Session context vs. database record

**Secondary Issue**: Query Method Difference

- Parent Dashboard uses server client with RLS (Row Level Security)
- SchoolGPT uses admin client bypassing RLS
- If RLS policies restrict homework access, this could cause discrepancies

### Files Changed

1. **`lib/schoolgpt/retrievers.ts`** (lines 51-69)
   - Updated `retrieveHomework()` response format
   - Added structured summary with total/completed/pending counts
   - Changed from: `Homework (X submitted, Y pending):\n{list}`
   - Changed to: `Homework Summary\n• Total assignments: {total}\n• Completed: {submitted.length}\n• Pending: {pending.length}\n\nRecent assignments:\n{list}`

### Verification Status

**Status**: INCOMPLETE

**Remaining Verification Steps**:
1. ✅ Traced Parent Dashboard data flow
2. ✅ Traced SchoolGPT data flow
3. ✅ Compared API endpoints and Supabase queries
4. ✅ Compared filters and student ID usage
5. ✅ Compared homework status logic
6. ✅ Confirmed both use same database table and field
7. ✅ Updated SchoolGPT response format to match dashboard display
8. ⏳ Need to verify student ID consistency between components
9. ⏳ Need to test with actual database to confirm data consistency
10. ⏳ Need to verify dashboard == SchoolGPT == database equality

### Recommendations

1. **Immediate**: Add logging to both data flows to log the actual student IDs being used
2. **Short-term**: Ensure SchoolGPT receives the same student ID format as Parent Dashboard
3. **Long-term**: Consider centralizing student ID resolution in a shared utility
4. **Testing**: Add integration test that queries homework for same student via both paths and compares results

### Next Steps

1. Add console logging to `retrieveHomework()` to log the studentId being queried
2. Add console logging to `getStudentsData()` to log the student IDs being returned
3. Compare the logged IDs to identify any mismatches
4. If mismatch found, trace the ID resolution chain in both components
5. Ensure both components use the same ID resolution method
