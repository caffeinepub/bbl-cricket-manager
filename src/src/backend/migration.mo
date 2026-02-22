import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type Player = {
    id : Nat;
    name : Text;
    dob : Text;
    place : Text;
    localResidence : Text;
    photo : Storage.ExternalBlob;
    category : { #batting; #bowling; #spinBowling; #allRounder };
    teamId : Nat;
    totalRuns : Nat;
    totalWickets : Nat;
  };

  type Team = {
    id : Nat;
    name : Text;
  };

  type MatchPerformance = {
    playerId : Nat;
    runs : Nat;
    wickets : Nat;
  };

  type Match = {
    id : Nat;
    team1 : Nat;
    team2 : Nat;
    date : Int;
    performances : [MatchPerformance];
  };

  type UserProfile = {
    name : Text;
    email : Text;
  };

  // Old actor type
  type OldActor = {
    nextPlayerId : Nat;
    players : Map.Map<Nat, Player>;
    nextMatchId : Nat;
    matches : Map.Map<Nat, Match>;
    userProfiles : Map.Map<Principal, UserProfile>;
    teams : Map.Map<Nat, Team>;
  };

  type NewActor = OldActor;

  public func run(old : OldActor) : NewActor {
    old;
  };
};
