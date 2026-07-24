# Vendor Portal Authentication Implementation

## Overview
Added comprehensive Clerk authentication with role-based access control and multi-vendor support to the vendor portal (`app/vendor/page.tsx`).

## Files Modified

### 1. `lib/auth/authOnboarding.ts`
**Changes:**
- Extended `LinkUserResult` interface to include `'vendor'` role
- Updated JSDoc to reference vendors alongside other roles
- Added idempotent Clerk user ID check for vendors table
- Added email-based lookup and linking for vendors with:
  - Database update to store `clerk_user_id` in vendors table
  - Clerk metadata update with `role: 'vendor'`
  - Resilient error handling with database rollback on failure

**Key Functions:**
- `linkClerkUser(userId, email)`: Now supports 4 roles (teacher, parent, admin, vendor)

### 2. `app/vendor/page.tsx`
**Complete Rewrite with Authentication Flow**

**Implementation Details:**

#### 1. Clerk Authentication Check
- Verifies user is signed in via `auth()`
- Redirects to sign-in if not authenticated
- Skips for demo mode (centralized demo session check)

#### 2. User Linking via `linkClerkUser` Flow
- Calls idempotent `linkClerkUser(userId, email)` on first login
- Returns linked role and handles errors gracefully
- Validates that linked role is exactly `'vendor'`
- Redirects non-vendor users to `/unauthorized` with role info

#### 3. Multi-Vendor Support
**Fetches all vendors where:**
- `clerk_user_id` matches authenticated user
- `is_active` is true

**Handles three scenarios:**
- **Single vendor access**: Auto-selects vendor, renders dashboard
- **Multiple vendor access**: Shows vendor selection interface
- **No vendor access**: Displays "not available" message

#### 4. Vendor Selector UI
When user has multiple vendors:
- Displays grid of vendor cards
- Shows vendor name and type (canteen, library, sports, etc.)
- Links to `/vendor?vendorId={vendor.id}` for selection
- Styled with matching design system (deep-teal, white/backdrop)

#### 5. Multi-Mode Support
**Three operational modes:**
1. **Clerk enabled + not demo**: Full auth with role check and linking
2. **Demo mode active**: Bypasses auth, uses first active vendor
3. **No Clerk key**: Fallback to first active vendor (development)

#### 6. Redirect to Unauthorized
- Path: `/unauthorized?portal=vendor&currentRole={role}`
- Triggers when:
  - User has no vendor role
  - Clerk linking fails
  - No vendor access found in database

## Database Schema Used

**vendors table:**
```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  clerk_user_id TEXT UNIQUE,          -- Links to Clerk user
  vendor_type TEXT,                    -- 'canteen', 'library', 'sports', 'facility', 'general'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Authentication Flow Diagram

```
User visits /vendor
    ↓
[Clerk enabled & not demo?]
    ├─→ YES: Check Clerk session
    │    ├─→ Not signed in → Redirect to /sign-in
    │    ├─→ Signed in → linkClerkUser (email-based linking)
    │    │   ├─→ Link success & role='vendor' → Continue
    │    │   ├─→ Link success & role≠'vendor' → Redirect /unauthorized
    │    │   └─→ Link fail → Redirect /unauthorized
    │    └─→ Query vendors by clerk_user_id
    │        ├─→ Found 1 vendor → Set as active
    │        ├─→ Found N vendors → Show selector
    │        └─→ Found 0 vendors → Show "not available"
    └─→ NO (demo or dev): Fetch first active vendor
         └─→ Render dashboard or "not available"
```

## Security Considerations

1. **Idempotent Linking**: Multiple calls with same user won't duplicate entries
2. **Database Rollback**: If Clerk metadata update fails, vendor record is reverted
3. **Role Validation**: Non-vendor users are explicitly redirected
4. **RLS Bypass**: Uses `createAdminClient()` only for initial linking (justified by lack of RLS at that point)
5. **Demo Mode Separation**: Demo users bypass full auth flow

## Error Handling

**Graceful degradation:**
- Auth linking warnings logged but don't block navigation
- Missing vendors show user-friendly message
- Unauthorized access redirects with context (`currentRole` parameter)

## Testing Scenarios

1. **Vendor with single vendor**: Should auto-load dashboard
2. **Vendor with multiple vendors**: Should show selector, then dashboard
3. **Non-vendor user**: Should redirect to `/unauthorized?portal=vendor&currentRole={role}`
4. **Unlinked user**: Should trigger linking, then proceed or redirect
5. **Demo mode**: Should bypass auth and show demo vendor
6. **No Clerk key**: Should show first active vendor (dev fallback)

## Related Files (Not Modified)

- `app/vendor/layout.tsx`: Existing basic auth checks remain (secondary validation)
- `components/vendor/VendorDashboardClient.tsx`: No changes (receives validated data)
- `middleware.ts`: Global Clerk middleware ensures session exists before page

## References

**Similar implementations:**
- `app/teacher/page.tsx`: Single-role auth pattern
- `app/parent/page.tsx`: Multi-data auth pattern with role filtering

**Auth utilities:**
- `lib/auth/getUser.ts`: General auth helper
- `lib/auth/authOnboarding.ts`: Linking flow (extended)

## Future Enhancements

1. Add vendor role to `getAuthenticatedUser()` for consistency
2. Implement vendor-specific RLS policies in database
3. Add vendor selector as persistent UI component (not just page)
4. Support vendor team management (multiple people per vendor)
5. Add vendor deactivation/suspension flows
