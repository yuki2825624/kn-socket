import { WebSocket } from "ws";

export class SocketEvent {
    constructor(socket: WebSocket);
    subscribe(name: "commandResponse"): void;
    subscribe<T extends keyof EventTypes>(name: T, listener?: (packet: EventTypes[T]) => void): void;
    unsubscribe(name: "commandResponse"): void;
    unsubscribe(name: keyof EventTypes): void;
}

export interface EventTypes {
    PlayerMessage: EventType<PlayerMessageEvent>;
}

export class EventType<Event> {
    private constructor();
    readonly header: {
        readonly eventName: string,
        readonly messagePurpose: string;
        readonly version: number;
    };
    readonly body: Event;
}

export class PlayerMessageEvent {
    private constructor();
    readonly message: string;
    readonly receiver: string;
    readonly sender: string;
    readonly type: string;
}