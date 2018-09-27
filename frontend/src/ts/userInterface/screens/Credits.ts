const html: string = require('./credits.html');

let startScreenElement: HTMLElement;
let rootElement: HTMLElement;
let headerElement: HTMLElement;
let startForm: HTMLElement;
let closeButton: HTMLElement;

let visible = false;

export function setup() {
    startScreenElement = document.getElementById('startScreen');
    rootElement = document.getElementById('credits');
    rootElement.innerHTML = html;

    headerElement = document.querySelector('#startScreen > header');
    startForm = document.getElementById('startForm');
    closeButton = document.getElementById('closeCredits');

    document.getElementById('showCredits').addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();

        setVisibility(true);
    });

    startScreenElement.addEventListener('click', event => {
        if (!visible) {
            return;
        }

        // Hide the credits if a user clicks outside
        if (!rootElement.contains(event.target as Node)) {
            setVisibility(false);
        }
    });
}


function setVisibility(isVisible: boolean) {
    headerElement.classList.toggle('hidden', isVisible);
    startForm.classList.toggle('hidden', isVisible);

    rootElement.classList.toggle('hidden', !isVisible);
    closeButton.classList.toggle('hidden', !isVisible);
    if (isVisible) {
        closeButton.style.left = rootElement.getBoundingClientRect().right + 'px';
    }
    visible = isVisible;
}