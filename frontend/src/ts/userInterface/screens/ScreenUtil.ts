export function createStartScreenPanel(
    rootElement: HTMLElement,
    html: string,
    closeButtonId: string,
    bodyClass: string,
    href: string) {

    rootElement.innerHTML = html;

    let backgroundContainer: HTMLElement = rootElement.querySelector('.background');
    let closeButton = document.getElementById(closeButtonId);
    let visible = false;

    let setVisibility = (isVisible: boolean) => {
        document.body.classList.toggle(bodyClass, isVisible);

        rootElement.classList.toggle('hidden', !isVisible);
        closeButton.classList.toggle('hidden', !isVisible);
        if (isVisible) {
            closeButton.style.left = rootElement.getBoundingClientRect().right + 'px';

            if (backgroundContainer !== null) {
                backgroundContainer.style.height = rootElement.scrollHeight + "px";
            }
        }
        visible = isVisible;
    };

    document.querySelectorAll('a[href="' + href + '"]').forEach((link) => {
        link.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();

            setVisibility(true);
        });
    });

    document.getElementById('startScreen').addEventListener('click', (event: Event) => {
        if (!visible) {
            return;
        }

        // Hide the credits if a user clicks outside. This also works with
        // the close button, as it's not nested inside the credits
        if (!rootElement.contains(event.target as Node)) {
            event.preventDefault();
            setVisibility(false);
        }
    });
}

