import { PlayOptions } from "@pixi/sound";

export interface SoundData {
    soundId: string;
    options?: PlayOptions;
    chanceToPlay?: number;
}