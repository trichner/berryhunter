import fscreen from 'fscreen';
import * as Events from "./Events";
import {Account} from "./Account";

let fullscreenToggle: HTMLInputElement;
let gameDomElement: HTMLCanvasElement;
let resizeToWindow: () => void;

Events.on('startScreen.domReady', () => {
    fullscreenToggle = document.getElementById('fullscreenToggle') as HTMLInputElement;
    fullscreenToggle.checked = Account.fullScreen;
});


Events.on('game.afterSetup', (Game) => {
    gameDomElement = Game.domElement;
    resizeToWindow = Game.resizeToWindow;
});

Events.on('game.join', (screen) => {
    if (screen === 'start') {
        let fullScreenToggled = fullscreenToggle.checked;
        Account.fullScreen = fullScreenToggled;
        if (fullScreenToggled) {
            fscreen.requestFullscreen(gameDomElement);
        }
    }
});

fscreen.addEventListener('fullscreenchange', () => {
    setTimeout(() => {
        resizeToWindow();
    });
});