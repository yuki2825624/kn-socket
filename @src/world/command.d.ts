export class Command {
    constructor(socket: WebSocket);
    run(commandLine: string, version?: number): Promise<CommandResponse & Record<string, any>>;
}

export class CommandResponse {
    private constructor();
    readonly statusCode: number;
    readonly statusMessage?: string;
}