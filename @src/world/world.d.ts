import { ServerOptions, WebSocket } from "ws";
import { WorldEvents } from "./events";
import { Scoreboard } from "./scoreboard";
import { CommandResponse } from "./command";
import { Player } from "../player/player";

export interface RawMessage {
    rawtext?: RawMessage[];
    score?: RawMessageScore;
    text?: string;
    translate?: string;
    with?: string[] | RawMessage;
}

export interface RawMessageScore {
    name?: string;
    objective?: string;
}

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface PlayerQueryOptions {
    name?: string;
    nameTag?: string;
}

export class World {
    constructor(options: ServerOptions);
    readonly socket: WebSocket;
    readonly events: WorldEvents;
    readonly scoreboard: Scoreboard;
    readonly currentPlayerCount: number;
    readonly maxPlayerCount: number;
    readonly ping: number;
    readonly owner: Player | null;
    close(): Promise<void>;
    getPlayerDetails(): Map<string, any>;
    getPlayers(options?: PlayerQueryOptions): Player[];
    runCommandAsync(commandLine: string, version?: string | number | number[]): Promise<CommandResponse>; 
    sendMessage(message: string | RawMessage): Promise<void>;
    getDynamicProperty(identifier: string): any;
    setDynamicProperty(identifier: string, value: any): void;
    hasDynamicProperty(identifier: string): boolean;
    clearDynamicProperty(): void;
    getDynamicPropertyIds(): string[];
}

export { DisplaySlotId, ObjectiveSortOrder, ScoreboardIdentityType } from "./scoreboard";