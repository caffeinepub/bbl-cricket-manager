# Backend Bug: Teams Not Loading

## Issue
The Team dropdown in the RegisterPage opens but shows no team names because the backend's `teams` map is empty.

## Root Cause
In `src/backend/main.mo` line 77, teams is initialized as:
```motoko
let teams = Map.empty<Nat, Team>();
```

This creates an empty map. Although there is a migration file (`src/backend/migration.mo`) that is supposed to populate the teams during deployment, the migration data is never connected to the `teams` variable in the actor.

The migration pattern `(with migration = Migration.run) actor` expects the actor to have fields that match the `NewActor` type returned by migration, but the `teams` variable is a local `let` binding rather than a field that can be initialized by the migration.

## Required Fix (Backend)
The backend needs to be updated to initialize the teams. Here are two possible approaches:

### Option 1: Initialize teams directly in the actor
Replace line 77 in `src/backend/main.mo`:
```motoko
// OLD:
let teams = Map.empty<Nat, Team>();

// NEW:
let teams = Map.empty<Nat, Team>();
let teamData = [
  { id = 1; name = "Tilatand" },
  { id = 2; name = "Bhattmurna" },
  { id = 3; name = "Bhattdih" },
  { id = 4; name = "Jainagar" },
  { id = 5; name = "Yadavpur" },
  { id = 6; name = "Devghara" },
  { id = 7; name = "Chatrutand" },
  { id = 8; name = "Talgadiya" },
  { id = 9; name = "Madhuban" },
  { id = 10; name = "Daldali" },
  { id = 11; name = "Kapuriya" },
];
for (team in teamData.values()) {
  teams.add(team.id, team);
};
```

### Option 2: Make teams a stable variable compatible with migration
This would require restructuring how the actor state is managed to work with the migration pattern.

## Workaround Applied (Frontend)
I've added better error handling in the RegisterPage that will now show:
- "Loading teams..." while teams are being fetched
- "No teams available" if no teams are returned
- Console logging to help debug the issue

## Testing
After the backend fix is applied:
1. The Team dropdown should display all 11 teams
2. Users should be able to select a team when registering
3. The console logs should show: `Teams data: [Array of 11 teams]`
