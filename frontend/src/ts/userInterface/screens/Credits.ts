import * as Events from "../../Events";

const html: string = require('./credits.html');

let startScreenElement: HTMLElement;
let rootElement: HTMLElement;
let closeButton: HTMLElement;

let visible = false;

export function setup() {
    startScreenElement = document.getElementById('startScreen');
    rootElement = document.getElementById('credits');
    rootElement.innerHTML = html;

    closeButton = document.getElementById('closeCredits');

    document.querySelector('a[href="#credits"]').addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();

        setVisibility(true);
    });

    startScreenElement.addEventListener('click', event => {
        if (!visible) {
            return;
        }

        // Hide the credits if a user clicks outside. This also works with
        // the close button, as it's not nested inside the credits
        if (!rootElement.contains(event.target as Node)) {
            setVisibility(false);
        }
    });
}


function setVisibility(isVisible: boolean) {
    document.body.classList.toggle('creditsVisible', isVisible);

    rootElement.classList.toggle('hidden', !isVisible);
    closeButton.classList.toggle('hidden', !isVisible);
    if (isVisible) {
        closeButton.style.left = rootElement.getBoundingClientRect().right + 'px';
    }
    visible = isVisible;
}