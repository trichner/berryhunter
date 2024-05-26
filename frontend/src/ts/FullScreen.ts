import fscreen from 'fscreen';
import {GameJoinEvent, screen, StartScreenDomReadyEvent} from "./Events";
import {Account} from "./Account";

let fullscreenToggle: HTMLInputElement;

StartScreenDomReadyEvent.subscribe(() => {
    fullscreenToggle = document.getElementById('fullscreenToggle') as HTMLInputElement;
    fullscreenToggle.checked = Account.fullScreen;
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
