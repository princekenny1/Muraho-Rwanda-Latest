# Hosted Role Access Validation

Date: 2026-03-28
Host: http://152.42.136.241:3000/api
Scope: Role behavior for user, moderator, agency_admin (admin already validated separately)

## How this was validated
- Created fresh hosted test users for each role.
- Logged in as each role and executed live authorization checks.
- Verified both status codes and filtered data visibility.

## Expected policy from code
- Shared access rules are defined in [cms/access/index.ts](cms/access/index.ts#L1).
- Frontend route guards are defined in [frontend/src/components/auth/ProtectedRoute.tsx](frontend/src/components/auth/ProtectedRoute.tsx#L1).

Summary from policy:
- admin: full access
- agency_admin: agency routes and agency access-code operations
- user: own record + owner-scoped user-data + public reads
- moderator: currently no special policy in access layer (effectively user-level)

## Live hosted results

### user
- Login: PASS (200)
- Read own profile via /users/me: PASS (200)
- Read stories: PASS (200)
- Create stories: BLOCKED as expected (403)
- Update own user: PASS (200)
- Update other user: BLOCKED as expected (403)
- List users: PASS with filter (200, totalDocs=1, only self email returned)
- Create user-settings for self: PASS (201)
- List user-settings: PASS with owner filter (200, totalDocs=0 for this fresh user)
- Access-codes read/create: BLOCKED as expected (403/403)

### moderator
- Login: PASS (200)
- Read own profile via /users/me: PASS (200)
- Read stories: PASS (200)
- Create stories: BLOCKED as expected (403)
- Update own user: PASS (200)
- Update other user: BLOCKED as expected (403)
- List users: PASS with filter (200, totalDocs=1, only self email returned)
- Create user-settings for self: PASS (201)
- List user-settings: PASS with owner filter (200, totalDocs=0 for this fresh user)
- Access-codes read/create: BLOCKED as expected (403/403)

### agency_admin
- Login: PASS (200)
- Read own profile via /users/me: PASS (200)
- Read stories: PASS (200)
- Create stories: BLOCKED as expected (403)
- Update own user: PASS (200)
- Update other user: BLOCKED as expected (403)
- List users: PASS with filter (200, totalDocs=1, only self email returned)
- Create user-settings for self: PASS (201)
- List user-settings: PASS with owner filter (200, totalDocs=0 for this fresh user)
- Access-codes read: PASS (200)
- Access-codes create: PASS (201)
- Update own linked agency: PASS (200)
- Read analytics-events: BLOCKED as expected (403, admin-only)

## Interpretation: What each role is for right now
- user:
  - End-user account role.
  - Can use personal/account features and owner-scoped user data.
  - Cannot manage content, analytics, or agency codes.

- moderator:
  - Role exists in user schema but currently has no distinct access policy.
  - In production behavior, moderator is effectively the same as user.
  - If moderation powers are intended, access rules still need to be added.

- agency_admin:
  - Operator role for tour-agency workflows.
  - Can manage own agency details and create/read agency access codes.
  - Cannot perform admin-only content or analytics operations.

## Conclusion
Non-admin role authorization is working correctly for current policy, with one key product gap:
- moderator has no differentiated permissions today (functionally user-level).
