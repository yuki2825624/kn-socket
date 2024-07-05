import { RawMessage } from "../world/world";
import { Player } from "./player";

export class ScreenDisplay {
    constructor(player: Player);
    setActionBar(text: RawMessage | string): Promise<boolean>;
    setTitle(title: RawMessage | string, options?: TitleDisplayOptions): Promise<boolean>;
    updateSubtitle(subtitle: RawMessage | string): Promise<boolean>;
    clear(): Promise<boolean>;
}

export interface TitleDisplayOptions {
    fadeInDuration: number;
    fadeOutDuration: number;
    stayDuration: number;
    subtitle?: RawMessage | string;
}