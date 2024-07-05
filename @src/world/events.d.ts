import { Player } from "../player/player";

export class WorldEvents {
    constructor();
    on<T extends keyof WorldEventTypes>(eventName: T, listener: (event: WorldEventTypes[T]) => void): (event: WorldEventTypes[T]) => void;
    off<T extends keyof WorldEventTypes>(eventName: T, listener: (event: WorldEventTypes[T]) => void): void;
    emit<T extends keyof WorldEventTypes>(eventName: T, eventData: WorldEventTypes[T]): void;
}

export interface WorldEventTypes {
    "connection": ConnectionEvent;
    "close": CloseEvent;
    "tick": TickEvent;
    "playerChat": PlayerChatEvent;
    "tellChat": TellChatEvent;
    "playerJoin": PlayerJoinEvent;
    "playerLeave": PlayerLeaveEvent;
    "error": ErrorEvent;
}

/**
 * @remarks
 * emit on websocket close
 */
export class CloseEvent {
    readonly constructor();
}

/**
 * @remarks
 * emit on websocket connection
 */
export class ConnectionEvent {
    readonly constructor();
}

/**
 * @remarks
 * emit on every tick
 */
export class TickEvent {
    private constructor();
    readonly currentTick: number;
    readonly deltaTime: number;
}

/**
 * @remarks
 * emit on player send message
 */
export class PlayerChatEvent {
    private constructor();
    readonly message: string;
    readonly sender: Player;
}

/**
 * @remarks
 * emit on tell message to player
 */
export class TellChatEvent {
    private constructor();
    /**
     * @remarks
     * the message content
     */
    readonly message: string;
    /**
     * @remarks
     * the name tag of message sender
     */
    readonly sender: string;
    readonly receiver: string; 
}

/**
 * @remarks
 * emit on player join to world
 */
export class PlayerJoinEvent {
    private constructor();
    readonly player: Player;
}

/**
 * @remarks
 * emit on player leave to world
 */
export class PlayerLeaveEvent {
    private constructor();
    readonly player: Player;
}

/**
 * @remarks
 * emit on throw some error
 */
export class ErrorEvent extends Error {
    readonly constructor();
}