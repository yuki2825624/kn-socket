import { World, RawMessage, PlayerQueryOptions } from "../world/world";
import { ScoreboardIdentity } from "../world/scoreboard";
import { CommandResponse } from "../world/command";
import { ScoreboardObjective } from "../world/scoreboard";
import { ScreenDisplay } from "./screenDisplay";

export class Player {
    constructor(world: World, name: string);
    readonly name: string;
    readonly nameTag: string | null;
    readonly id: string | null;
    readonly detail?: PlayerDetail;
    readonly scoreboardIdentity: ScoreboardIdentity;
    readonly onScreenDisplay: ScreenDisplay;
    matches(options: PlayerQueryOptions): boolean;
    runCommandAsync(commandLine: string, version?: number): Promise<CommandResponse>;
    sendMessage(message: string | RawMessage): Promise<void>;
    addTag(): Promise<boolean>;
    removeTag(): Promise<boolean>;
    hasTag(): Promise<boolean>;
    getTags(): Promise<string[]>;
    addScore(objective: ScoreboardObjective | string, score: number): Promise<number>;
    removeScore(objective: ScoreboardObjective | string, score: number): Promise<number>;
    getScore(objective: ScoreboardObjective | string): Promise<number | undefined>;
    setScore(objective: ScoreboardObjective | string, score: number): Promise<boolean>;
    resetScore(objective: ScoreboardObjective): Promise<boolean>;
}

export class PlayerDetail {
    private constructor();
    readonly activeSessionId: string;
    readonly clientId: string;
    readonly color: string;
    readonly deviceSessionId: string;
    readonly globalMultiplayerCorrelationId: string;
    readonly id: number;
    readonly name: string;
    readonly randomId: number;
    readonly uuid: string;
}