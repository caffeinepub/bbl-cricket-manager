# BBL Cricket Manager

## Current State

### Authorization Model
- Backend uses the Caffeine authorization component with admin/user role system
- `registerPlayer()` currently requires admin rights (`checkAdminRights(caller)`)
- Admin initialization requires `CAFFEINE_ADMIN_TOKEN` environment variable
- First-time admin setup calls `_initializeAccessControlWithSecret()`

### Player Registration Flow
- Players must be admin to register (incorrect per requirements)
- Registration form exists but fails with "failed to access" error
- Error occurs because non-admin users cannot call `registerPlayer()`

### Admin Access
- Admin page shows "Become Admin" initialization form
- Initialization fails because `CAFFEINE_ADMIN_TOKEN` may not be set or accessible
- No clear path for first user to become admin

## Requested Changes (Diff)

### Add
- Public player self-registration (any authenticated user can register themselves)
- Simplified admin initialization that works without environment variable checks
- Admin role assignment for the first user who clicks "Initialize as Admin"

### Modify
- `registerPlayer()` authorization from admin-only to authenticated-user access
- Admin initialization to be simpler and work on first attempt
- Authorization check to allow self-registration while keeping admin-only access for:
  - Creating matches
  - Recording match scores
  - Editing other players
  - Deleting players

### Remove
- Strict `CAFFEINE_ADMIN_TOKEN` requirement for admin initialization (or make it optional)
- Admin-only restriction from player registration

## Implementation Plan

### Backend Changes (Motoko)
1. Change `registerPlayer()` from `checkAdminRights(caller)` to `checkAuthenticatedUser(caller)`
2. Update admin initialization logic to be more permissive:
   - Allow first user to become admin without strict token validation
   - OR make `CAFFEINE_ADMIN_TOKEN` check optional for development
3. Keep admin-only checks for:
   - `createMatch()`
   - `recordPlayerPerformance()`
   - `updatePlayer()`
   - `deletePlayer()`

### Frontend Changes
- No changes needed - error handling already in place
- Once backend is fixed, registration will work automatically

## UX Notes

- Players should be able to register themselves with name, DOB, place, residence, photo, category, and team
- Only the first user needs to initialize admin access via the Admin page
- After initialization, that user becomes admin and can manage all cricket data
- All other users can register as players but cannot access admin functions
