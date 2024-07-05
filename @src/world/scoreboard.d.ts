import { World } from "./world";
import { Player } from "../player/player";

export class Scoreboard {
    constructor(world: World);
    getParticipants(): Promise<ScoreboardIdentity[]>;
    addObjective(objectiveId: string, displayName?: string): Promise<ScoreboardObjective | undefined>;
    getObjective(objectiveId: string): Promise<ScoreboardObjective | undefined>;
    removeObjective(objectiveId: ScoreboardObjective | string): Promise<boolean>;
    getObjectives(): Promise<ScoreboardObjective[]>;
    setObjectiveAtDisplaySlot(displaySlotId: DisplaySlotId, objectiveDisplaySetting: ScoreboardObjectiveDisplayOptions): Promise<ScoreboardObjective | undefined>;
    clearObjectiveAtDisplaySlot(displaySlotId: DisplaySlotId): Promise<boolean>;
    getInfo(participant: Player | ScoreboardIdentity | string): Promise<ScoreboardIdentityInfo[]>;
}

export class ScoreboardIdentity {
    constructor(world: World, displayName?: string);
    readonly displayName: string;
    readonly type: ScoreboardIdentityType;
    getPlayer(): Player | undefined;    
}

export class ScoreboardIdentityInfo {
    private constructor();
    readonly objective: ScoreboardObjective;
    readonly score: number;
}

export class ScoreboardObjective {
    private constructor(world: World, objectiveId: string, displayName?: string);
    readonly id: string;
    readonly displayName: string;
    addScore(participant: Player | ScoreboardIdentity | string, score: number): Promise<number | undefined>;
    removeScore(participant: Player | ScoreboardIdentity | string, socre: number): Promise<number | undefined>;
    getScore(participant: Player | ScoreboardIdentity | string): Promise<number | undefined>;
    setScore(participant: Player | ScoreboardIdentity | string, score: number): Promise<boolean>;
    // getScores(participant: Player | ScoreboardIdentity | string): Record<string, number>;
    hasParticipant(participant: Player | ScoreboardIdentity | string): Promise<boolean>;
    removeParticipant(participant: Player | ScoreboardIdentity | string): Promise<boolean>;
}

export interface ScoreboardObjectiveDisplayOptions {
    objective: ScoreboardObjective | string;
    sortOrder?: ObjectiveSortOrder;
}

export enum ScoreboardIdentityType {
    Entity = "Entity",
    FakePlayer = "FakePlayer"
}

export enum DisplaySlotId {
    BelowName = "belowName",
    List = "list",
    Sidebar = "sidebar"
}

export enum ObjectiveSortOrder {
    Ascending = "ascending",
    Descending = "descending"
}