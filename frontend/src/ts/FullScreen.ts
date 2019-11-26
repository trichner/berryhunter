import fscreen from 'fscreen';
import {GameJoinEvent, GameLateSetupEvent, screen, StartScreenDomReadyEvent} from "./Events";
import {Account} from "./Account";
import {IGame} from "./interfaces/IGame";

let fullscreenToggle: HTMLInputElement;
let resizeToWindow: () => void;

StartScreenDomReadyEvent.subscribe(() => {
    fullscreenToggle = document.getElementById('fullscreenToggle') as HTMLInputElement;
    fullscreenToggle.checked = Account.fullScreen;
});


GameLateSetupEvent.subscribe((game: IGame) => {
    resizeToWindow = game.resizeToWindow;
});

GameJoinEvent.subscribe((screen: screen) => {
    if (screen === 'start') {
        let fullScreenToggled = fullscreenToggle.checked;
        Account.fullScreen = fullScreenToggled;
        if (fullScreenToggled) {
            fscreen.requestFullscreen(document.body);
        }
    }
});

fscreen.addEventListener('fullscreenchange', () => {
    setTimeout(() => {
        resizeToWindow();
    });
});
