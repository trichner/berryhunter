import onChange from 'on-change';
import {GameSettingChangedEvent} from '../Events';
import {Account} from '../Account';
import _merge = require('lodash/merge');
import _debounce = require('lodash/debounce');

export class GameSettings {
    private static instance: GameSettings = null;
    public readonly audio = new AudioSettings();

    public static get(): GameSettings {
        if (this.instance === null) {
            const gameSettings = _merge(new GameSettings(), JSON.parse(Account.rawGameSettings));

            this.instance = onChange(gameSettings, (path, value, previousValue) => {
                GameSettingChangedEvent.trigger({
                    path: path,
                    newValue: value,
                    oldValue: previousValue,
                });

                GameSettings.save(onChange.target(gameSettings));
            });
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

class AudioSettings {
    public masterMuted: boolean = true;
    public masterVolume: number = 70;
}
