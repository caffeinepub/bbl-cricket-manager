import Time "mo:core/Time";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

(with migration = Migration.run)
actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type UserProfile = {
    name : Text;
    email : Text;
  };

  public type CategoryType = { #batting; #bowling; #spinBowling; #allRounder };

  public type Player = {
    id : Nat;
    name : Text;
    dob : Text;
    place : Text;
    localResidence : Text;
    photo : Storage.ExternalBlob;
    category : CategoryType;
    teamId : Nat;
    totalRuns : Nat;
    totalWickets : Nat;
  };

  public type Team = {
    id : Nat;
    name : Text;
  };

  public type MatchPerformance = {
    playerId : Nat;
    runs : Nat;
    wickets : Nat;
  };

  public type Match = {
    id : Nat;
    team1 : Nat;
    team2 : Nat;
    date : Time.Time;
    performances : [MatchPerformance];
  };

  // State
  var nextPlayerId = 1;
  let players = Map.empty<Nat, Player>();
  var nextMatchId = 1;
  let matches = Map.empty<Nat, Match>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Teams are pre-populated and read-only
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

  // --- User Profile Management ---
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    checkAuthenticatedUser(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    checkAuthenticatedUser(caller);
    userProfiles.add(caller, profile);
  };

  // --- Player Management ---

  // Self-registration for players (authenticated users)
  public shared ({ caller }) func registerPlayer(
    name : Text,
    dob : Text,
    place : Text,
    localResidence : Text,
    photo : Storage.ExternalBlob,
    category : CategoryType,
    teamId : Nat,
  ) : async Nat {
    checkAuthenticatedUser(caller);
    validateTeamExists(teamId);

    let id = nextPlayerId;
    nextPlayerId += 1;

    let player : Player = {
      id;
      name;
      dob;
      place;
      localResidence;
      photo;
      category;
      teamId;
      totalRuns = 0;
      totalWickets = 0;
    };

    players.add(id, player);
    id;
  };

  public shared ({ caller }) func updatePlayer(
    id : Nat,
    name : Text,
    dob : Text,
    place : Text,
    localResidence : Text,
    photo : Storage.ExternalBlob,
    category : CategoryType,
    teamId : Nat,
  ) : async () {
    checkAdminRights(caller);
    let player = getPlayerById(id);
    validateTeamExists(teamId);

    let updatedPlayer : Player = {
      id;
      name;
      dob;
      place;
      localResidence;
      photo;
      category;
      teamId;
      totalRuns = player.totalRuns;
      totalWickets = player.totalWickets;
    };

    players.add(id, updatedPlayer);
  };

  public shared ({ caller }) func deletePlayer(id : Nat) : async () {
    checkAdminRights(caller);
    validatePlayerExists(id);
    players.remove(id);
  };

  // --- Match Management ---

  public shared ({ caller }) func createMatch(team1 : Nat, team2 : Nat, date : Time.Time) : async Nat {
    checkAdminRights(caller);
    validateTeamExists(team1);
    validateTeamExists(team2);

    let id = nextMatchId;
    nextMatchId += 1;

    let match : Match = {
      id;
      team1;
      team2;
      date;
      performances = [];
    };

    matches.add(id, match);
    id;
  };

  public shared ({ caller }) func recordPlayerPerformance(
    matchId : Nat,
    playerId : Nat,
    runs : Nat,
    wickets : Nat,
  ) : async () {
    checkAdminRights(caller);

    let match = getMatchById(matchId);
    let _ = getPlayerById(playerId);

    let newPerformance : MatchPerformance = {
      playerId;
      runs;
      wickets;
    };

    let updatedMatch = {
      id = match.id;
      team1 = match.team1;
      team2 = match.team2;
      date = match.date;
      performances = match.performances.concat([newPerformance]);
    };

    matches.add(matchId, updatedMatch);
    updatePlayerStats(playerId, runs, wickets);
  };

  public shared ({ caller }) func deleteMatch(matchId : Nat) : async () {
    checkAdminRights(caller);
    validateMatchExists(matchId);
    matches.remove(matchId);
  };

  // --- Read-only Queries ---
  public query func getAllPlayers() : async [Player] {
    players.values().toArray();
  };

  public query func getPlayersByTeam(teamId : Nat) : async [Player] {
    players.values().toArray().filter(func(player) { player.teamId == teamId });
  };

  public query func getPlayersByCategory(category : CategoryType) : async [Player] {
    players.values().toArray().filter(func(player) { player.category == category });
  };

  public query func getAllTeams() : async [Team] {
    teams.values().toArray();
  };

  public query func getTeamById(id : Nat) : async ?Team {
    teams.get(id);
  };

  public query func getAllMatches() : async [Match] {
    matches.values().toArray();
  };

  public query func getMatchDetails(id : Nat) : async Match {
    switch (matches.get(id)) {
      case (null) { Runtime.trap("Match not found") };
      case (?match) { match };
    };
  };

  // --- Statistics Queries ---
  public query func getBestBatsman() : async Player {
    findTopPlayerByMetric(func(p) { p.totalRuns }, func() { #batting });
  };

  public query func getBestBowler() : async Player {
    findTopPlayerByMetric(func(p) { p.totalWickets }, func() { #bowling });
  };

  public query func getBestSpinBowler() : async Player {
    findTopPlayerByMetric(func(p) { p.totalWickets }, func() { #spinBowling });
  };

  public query func getBestAllRounder() : async Player {
    func allRounderScore(p : Player) : Nat {
      p.totalRuns + p.totalWickets;
    };
    findTopPlayerByMetric(allRounderScore, func() { #allRounder });
  };

  // --- Helper Functions ---

  func findTopPlayerByMetric(
    metric : (Player) -> Nat,
    categoryFilter : () -> CategoryType
  ) : Player {
    let filtered = players.values().toArray().filter(
      func(player) { player.category == categoryFilter() }
    );
    if (filtered.size() == 0) {
      Runtime.trap("No players found");
    };

    filtered.foldLeft<Player, Player>(
      filtered[0],
      func(currentBest, player) {
        if (metric(player) > metric(currentBest)) { player } else {
          currentBest;
        };
      },
    );
  };

  func updatePlayerStats(playerId : Nat, runs : Nat, wickets : Nat) {
    switch (players.get(playerId)) {
      case (null) {};
      case (?player) {
        let updatedPlayer = {
          id = player.id;
          name = player.name;
          dob = player.dob;
          place = player.place;
          localResidence = player.localResidence;
          photo = player.photo;
          category = player.category;
          teamId = player.teamId;
          totalRuns = player.totalRuns + runs;
          totalWickets = player.totalWickets + wickets;
        };
        players.add(playerId, updatedPlayer);
      };
    };
  };

  // --- Validation & Authorization ---
  func validateTeamExists(teamId : Nat) {
    if (not teams.containsKey(teamId)) {
      Runtime.trap("Team does not exist");
    };
  };

  func getPlayerById(playerId : Nat) : Player {
    switch (players.get(playerId)) {
      case (null) { Runtime.trap("Player not found") };
      case (?player) { player };
    };
  };

  func getMatchById(matchId : Nat) : Match {
    switch (matches.get(matchId)) {
      case (null) { Runtime.trap("Match not found") };
      case (?match) { match };
    };
  };

  func validatePlayerExists(playerId : Nat) {
    if (not players.containsKey(playerId)) {
      Runtime.trap("Player not found");
    };
  };

  func validateMatchExists(matchId : Nat) {
    if (not matches.containsKey(matchId)) {
      Runtime.trap("Match not found");
    };
  };

  func checkAuthenticatedUser(caller : Principal) {
    // Reject anonymous users
    if (Principal.fromText("2vxsx-fae") == caller) {
      Runtime.trap("Unauthorized: Anonymous users not allowed");
    };
    
    // All non-anonymous (authenticated) principals are allowed
    // This allows new users to register as players without requiring
    // admin initialization via the CAFFEINE_ADMIN_TOKEN
  };

  func checkAdminRights(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };
};
