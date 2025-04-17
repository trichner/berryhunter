import {GameSettingChangedEvent} from '../../core/logic/Events';
import {Sound} from '@pixi/sound';
import {GameSettings} from '../../game-settings/logic/GameSettings';

let currentMusic: Sound = null;

GameSettingChangedEvent.subscribe(payload => {
    if (!payload.path.startsWith('audio.music')) {
        // Not relevant for the Music sub-system
        return;
    }

    const setting = payload.path.substring('audio.'.length);
    switch (setting) {
        case 'musicVolume':
            currentMusic.volume = payload.newValue as number;
            break;
    }
});

function setup() {
    const settings = GameSettings.get().audio;
    currentMusic = Sound.from({
        url: require('../assets/derpy-berryhunter.mp3'),
        autoPlay: true,
        singleInstance: true,
        loop: true,
        volume: settings.musicVolume,
    });
}

setup();
