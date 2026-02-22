# BBL Cricket Manager

## Current State
The BBL Cricket Manager app has been deployed with:
- Player registration form with fields: name, DOB, place, local residential name, photo upload, category selection, and team selection
- Player Category dropdown works correctly with 4 options (Batting, Bowling, Spin Bowling, All Rounder)
- Team dropdown component exists but displays no team names
- Backend has `getAllTeams()` and `initializeTeams()` methods
- Frontend queries teams using `useGetAllTeams()` hook

**Problem:** Team dropdown opens but shows no teams because the backend teams are not being fetched/displayed properly.

## Requested Changes (Diff)

### Add
- Nothing to add

### Modify
- Fix the Team dropdown in RegisterPage to properly display all 11 teams:
  - Tilatand
  - Bhattmurna
  - Bhattdih
  - Jainagar
  - Yadavpur
  - Devghara
  - Chatrutand
  - Talgadiya
  - Madhuban
  - Daldali
  - Kapuriya

### Remove
- Nothing to remove

## Implementation Plan

1. **Investigate backend team initialization**: Check if teams are being properly created/stored in the backend
2. **Verify frontend query**: Ensure `useGetAllTeams()` is correctly fetching and returning team data
3. **Fix team list display**: Update RegisterPage to properly map and display team options in the Select dropdown
4. **Test the fix**: Verify that all 11 team names appear in the dropdown when clicked

## UX Notes
- Team dropdown should work exactly like the Player Category dropdown
- All 11 teams should be visible when the dropdown is opened
- Team names should be displayed in their original spelling
- Users should be able to select any of the 11 teams
