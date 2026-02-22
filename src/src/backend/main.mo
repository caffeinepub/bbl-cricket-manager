import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  // Roles
  public type UserRole = AccessControl.UserRole;

  // Combine authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile type
  public type UserProfile = {
    name : Text;
    email : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Team, Player, Match types
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

  // Player comparison modules
  module Player {
    public func compareByWickets(a : Player, b : Player) : Order.Order {
      Nat.compare(b.totalWickets, a.totalWickets);
    };

    public func compareByRuns(a : Player, b : Player) : Order.Order {
      Nat.compare(b.totalRuns, a.totalRuns);
    };
  };

  // State
  var nextPlayerId = 1;
  let players = Map.empty<Nat, Player>();
  var nextMatchId = 1;
  let matches = Map.empty<Nat, Match>();

  // Initialize teams with all 11 BBL teams
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

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Player Management
  public shared ({ caller }) func registerPlayer(
    name : Text,
    dob : Text,
    place : Text,
    localResidence : Text,
    photo : Storage.ExternalBlob,
    category : CategoryType,
    teamId : Nat,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register players");
    };

    let id = nextPlayerId;
    nextPlayerId += 1;

    if (not teams.containsKey(teamId)) {
      Runtime.trap("Team does not exist");
    };

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
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update player profiles");
    };

    let player = switch (players.get(id)) {
      case (null) { Runtime.trap("Player not found") };
      case (?player) { player };
    };

    if (not teams.containsKey(teamId)) {
      Runtime.trap("Team does not exist");
    };

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
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete players");
    };
    if (not players.containsKey(id)) {
      Runtime.trap("Player not found");
    };
    players.remove(id);
  };

  public shared ({ caller }) func createMatch(team1 : Nat, team2 : Nat, date : Time.Time) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create matches");
    };

    if (not teams.containsKey(team1) or not teams.containsKey(team2)) {
      Runtime.trap("Teams do not exist");
    };

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
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can record player performance");
    };

    let match = switch (matches.get(matchId)) {
      case (null) { Runtime.trap("Match not found") };
      case (?match) { match };
    };
    let _player = switch (players.get(playerId)) {
      case (null) { Runtime.trap("Player not found") };
      case (?player) { player };
    };

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

    // Update aggregate stats
    updatePlayerStats(playerId, runs, wickets);
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

  // Read-only queries - no authorization needed (anyone can view)
  public query ({ caller }) func getAllPlayers() : async [Player] {
    players.values().toArray();
  };

  public query ({ caller }) func getPlayersByTeam(teamId : Nat) : async [Player] {
    players.values().toArray().filter(func(player) { player.teamId == teamId });
  };

  public query ({ caller }) func getPlayersByCategory(category : CategoryType) : async [Player] {
    players.values().toArray().filter(func(player) { player.category == category });
  };

  public query ({ caller }) func getAllTeams() : async [Team] {
    teams.values().toArray();
  };

  public query ({ caller }) func getTeamById(id : Nat) : async ?Team {
    teams.get(id);
  };

  public query ({ caller }) func getAllMatches() : async [Match] {
    matches.values().toArray();
  };

  public query ({ caller }) func getMatchDetails(id : Nat) : async Match {
    switch (matches.get(id)) {
      case (null) { Runtime.trap("Match not found") };
      case (?match) { match };
    };
  };

  // Statistics queries - find best players by total runs/wickets
  public query ({ caller }) func getBestBatsman() : async Player {
    let allPlayers = players.values().toArray();
    if (allPlayers.size() == 0) {
      Runtime.trap("No players found");
    };

    func findBestPlayerByRuns(currentBest : Player, player : Player) : Player {
      if (player.totalRuns > currentBest.totalRuns) { player } else {
        currentBest;
      };
    };

    allPlayers.foldLeft<Player, Player>(
      allPlayers[0],
      findBestPlayerByRuns,
    );
  };

  public query ({ caller }) func getBestBowler() : async Player {
    let allPlayers = players.values().toArray();
    if (allPlayers.size() == 0) {
      Runtime.trap("No players found");
    };

    func findBestPayerByWickets(currentBest : Player, player : Player) : Player {
      if (player.totalWickets > currentBest.totalWickets) { player } else {
        currentBest;
      };
    };

    allPlayers.foldLeft<Player, Player>(
      allPlayers[0],
      findBestPayerByWickets,
    );
  };

  public query ({ caller }) func getBestSpinBowler() : async Player {
    let filtered = players.values().toArray().filter(func(player) { player.category == #spinBowling });
    if (filtered.size() == 0) {
      Runtime.trap("No spin bowlers found");
    };

    func findBestSpinBowler(currentBest : Player, player : Player) : Player {
      if (player.totalWickets > currentBest.totalWickets) { player } else {
        currentBest;
      };
    };

    filtered.foldLeft<Player, Player>(
      filtered[0],
      findBestSpinBowler,
    );
  };

  public query ({ caller }) func getBestAllRounder() : async Player {
    let filtered = players.values().toArray().filter(func(player) { player.category == #allRounder });
    if (filtered.size() == 0) {
      Runtime.trap("No all-rounders found");
    };

    func findBestAllRounder(currentBest : Player, player : Player) : Player {
      if ((player.totalRuns + player.totalWickets) > (currentBest.totalRuns + currentBest.totalWickets)) {
        player;
      } else {
        currentBest;
      };
    };

    filtered.foldLeft<Player, Player>(
      filtered[0],
      findBestAllRounder,
    );
  };

  func findTopPlayer(category : CategoryType) : Player {
    let filtered = players.values().toArray().filter(func(player) { player.category == category });
    switch (filtered.size()) {
      case (0) { Runtime.trap("No players found") };
      case (_) { filtered[0] };
    };
  };
};

