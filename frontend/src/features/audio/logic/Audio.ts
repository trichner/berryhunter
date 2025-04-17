import {GameSettingChangedEvent} from '../../core/logic/Events';
import {sound} from '@pixi/sound';
import {AudioSettings, GameSettings} from '../../game-settings/logic/GameSettings';

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
            sound.volumeAll = payload.newValue as number;
            break;
    }
});

function setupBackgroundAudio() {
    sound.disableAutoPause = true;
    document.addEventListener('visibilitychange', () => {
        updateMuting(GameSettings.get().audio);
    });
}

function setup() {
    const settings = GameSettings.get().audio;
    updateMuting(settings);

    sound.volumeAll = settings.masterVolume;

    setupBackgroundAudio();
}

function updateMuting(settings: AudioSettings) {
    if (settings.masterMuted) {
        sound.muteAll();
        return;
    }

    if (document.visibilityState === 'hidden' && !settings.enableBackgroundAudio) {
        sound.muteAll();
        return;
    }

    sound.unmuteAll();
}

setup();
