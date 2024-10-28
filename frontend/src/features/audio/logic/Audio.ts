import {GameSettingChangedEvent} from '../../core/logic/Events';
import {sound} from '@pixi/sound';
import {GameSettings} from '../../game-settings/logic/GameSettings';

GameSettingChangedEvent.subscribe(payload => {
    if (!payload.path.startsWith('audio.')) {
        // Not relevant for the Audio System
        return;
    }

    const setting = payload.path.substring('audio.'.length);
    switch (setting) {
        case 'masterMuted':
            if (payload.newValue) {
                sound.muteAll();
            } else {
                sound.unmuteAll();
            }
            break;
        case 'masterVolume':
            sound.volumeAll = (payload.newValue as number) / 100.0;
            break;
    }
});

function setup() {
    const settings = GameSettings.get().audio;
    if (settings.masterMuted) {
        sound.muteAll();
    } else {
        sound.unmuteAll();
    }

    sound.volumeAll = settings.masterVolume / 100.0;
}

setup();
