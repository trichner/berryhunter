import onChange from 'on-change';
import {GameSettingChangedEvent} from '../../core/logic/Events';
import {Account} from '../../accounts/logic/Account';
import _merge = require('lodash/merge');
import _debounce = require('lodash/debounce');

export class GameSettings {
    private static instance: GameSettings = null;
    public readonly audio = new AudioSettings();

    public static get(): GameSettings {
        if (this.instance === null) {
            const gameSettings: GameSettings = _merge(new GameSettings(), JSON.parse(Account.rawGameSettings));

            this.instance = onChange(gameSettings, (path, value, previousValue) => {
                GameSettingChangedEvent.trigger({
                    path: path,
                    newValue: value,
                    oldValue: previousValue,
                });

                GameSettings.save(onChange.target(gameSettings));
            });

            // TODO replace with a migration system
            if (gameSettings.audio.masterVolume > 1 && gameSettings.audio.masterVolume <= 100) {
                gameSettings.audio.masterVolume /= 100.0;
            }
        }

        return this.instance;
    }

    /**
     * Debounced save function to ensure the settings are not saved more than once every 250ms into the account.
     */
    private static save = _debounce((gameSettings) => {
        Account.rawGameSettings = JSON.stringify(gameSettings);
    }, 250);
}

export class AudioSettings {
    public masterMuted: boolean = true;
    public masterVolume: number = 0.7;
    public enableBackgroundAudio: boolean = false;
    public musicVolume: number = 1.0;
}
