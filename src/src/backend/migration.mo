import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type Team = {
    id : Nat;
    name : Text;
  };

  type OldActor = {
    teams : Map.Map<Nat, Team>;
  };

  type NewActor = {
    teams : Map.Map<Nat, Team>;
  };

  // Build teams map with new names.
  func buildTeams() : Map.Map<Nat, Team> {
    let newTeams = Map.empty<Nat, Team>();
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
      newTeams.add(team.id, team);
    };
    newTeams;
  };

  // Migration function.
  public func run(_old : OldActor) : NewActor {
    { teams = buildTeams() };
  };
};
