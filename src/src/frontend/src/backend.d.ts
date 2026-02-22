import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Player {
    id: bigint;
    dob: string;
    totalWickets: bigint;
    name: string;
    localResidence: string;
    totalRuns: bigint;
    category: CategoryType;
    photo: ExternalBlob;
    place: string;
    teamId: bigint;
}
export type Time = bigint;
export interface MatchPerformance {
    playerId: bigint;
    runs: bigint;
    wickets: bigint;
}
export interface Match {
    id: bigint;
    team1: bigint;
    team2: bigint;
    date: Time;
    performances: Array<MatchPerformance>;
}
export interface UserProfile {
    name: string;
    email: string;
}
export interface Team {
    id: bigint;
    name: string;
}
export enum CategoryType {
    spinBowling = "spinBowling",
    bowling = "bowling",
    allRounder = "allRounder",
    batting = "batting"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createMatch(team1: bigint, team2: bigint, date: Time): Promise<bigint>;
    deletePlayer(id: bigint): Promise<void>;
    getAllMatches(): Promise<Array<Match>>;
    getAllPlayers(): Promise<Array<Player>>;
    getAllTeams(): Promise<Array<Team>>;
    getBestAllRounder(): Promise<Player>;
    getBestBatsman(): Promise<Player>;
    getBestBowler(): Promise<Player>;
    getBestSpinBowler(): Promise<Player>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMatchDetails(id: bigint): Promise<Match>;
    getPlayersByCategory(category: CategoryType): Promise<Array<Player>>;
    getPlayersByTeam(teamId: bigint): Promise<Array<Player>>;
    getTeamById(id: bigint): Promise<Team | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    recordPlayerPerformance(matchId: bigint, playerId: bigint, runs: bigint, wickets: bigint): Promise<void>;
    registerPlayer(name: string, dob: string, place: string, localResidence: string, photo: ExternalBlob, category: CategoryType, teamId: bigint): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updatePlayer(id: bigint, name: string, dob: string, place: string, localResidence: string, photo: ExternalBlob, category: CategoryType, teamId: bigint): Promise<void>;
}
