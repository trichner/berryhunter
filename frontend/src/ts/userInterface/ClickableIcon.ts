import {isFunction} from '../Utils';
import {Items} from '../items/Items';
import {SubIcon} from './SubIcon';
import {BasicConfig as Constants} from '../../game-data/BasicConfig';
import {IGame} from "../interfaces/IGame";
import {GameSetupEvent, InventoryChangedEvent} from "../Events";

let Game: IGame = null;
GameSetupEvent.subscribe((game: IGame) => {
    Game = game;
});


export class ClickableIcon {
    clickable = false;
    domElement;
    inProgress = false;
    progress = null;

    onPointerup = null;
    onPointerdown = null;
    onLeftClick = null;
    onRightClick = null;

    imageNode;
    progressOverlay;

    subIcons;

    /**
     * @param {Element} node
     */
    constructor(node) {
        this.domElement = node;


        this.domElement.addEventListener('pointerup', (event) => {
            event.stopPropagation();
            event.preventDefault();

            if (this.clickable && isFunction(this.onPointerup)) {
                this.onPointerup(event);
            }
        });
        this.domElement.addEventListener('pointerdown', (event) => {
            event.stopPropagation();
            event.preventDefault();

            if (this.clickable && isFunction(this.onPointerdown)) {
                this.onPointerdown(event);
            }
        });
        this.domElement.addEventListener('click', (event) => {
            event.stopPropagation();
            event.preventDefault();

            if (this.clickable && isFunction(this.onLeftClick)) {
                this.onLeftClick(event);
            }
        });
        this.domElement.addEventListener('contextmenu', (event) => {
            event.stopPropagation();
            event.preventDefault();

            if (this.clickable && isFunction(this.onRightClick)) {
                this.onRightClick(event);
            }
        });

        this.imageNode = this.domElement.querySelector('.itemIcon');
        this.progressOverlay = this.domElement.querySelector('.progressOverlay');
    }

    appendTo(element) {
        element.appendChild(this.domElement);
    }

    setIconGraphic(svgPath, clickable) {
        this.imageNode.setAttribute('src', svgPath);
        this.domElement.classList.remove('empty');
        this.domElement.classList.add('filled');
        this.setClickable(clickable);
    }

    removeIconGraphic() {
        this.imageNode.removeAttribute('src');
        this.domElement.classList.add('empty');
        this.domElement.classList.remove('filled');
        this.setClickable(false);
    }

    setClickable(clickable) {
        this.clickable = clickable;
        this.domElement.classList.toggle('clickable', clickable)
    }

    addSubIcons(materials) {
        this.subIcons = [];
        let hasPrimary = false;
        let iconIndex = 0;
        Object.entries(materials).forEach((material) => {
            let itemName = material[0];
            let count = material[1];
            let iconPath = Items[itemName].icon.file;

            let domElement;
            if (!hasPrimary && count === 1) {
                domElement = this.domElement.querySelector('.subIcon.primary');
                hasPrimary = true;
            } else {
                domElement = this.domElement.querySelectorAll('.subIconRow > .subIcon').item(iconIndex);
                iconIndex++;
            }

            this.subIcons.push(new SubIcon(domElement, itemName, iconPath, count, Game.player.inventory.getItemCount(itemName)));
        });

        if (hasPrimary) {
            this.domElement.classList.add('upgrade');
        }

        if (iconIndex > 0) {
            this.domElement.classList.add('withIngredients');
        }
    }

    activate() {
        this.domElement.classList.add('active');
    }

    deactivate() {
        this.domElement.classList.remove('active');
    }

    hasIcon() {
        return this.clickable;
    }

    setHinted(flag) {
        if (flag) {
            this.domElement.classList.add('hinted');
        } else {
            this.domElement.classList.remove('hinted');
        }
    }

    startProgress(seconds) {
        if (this.progressOverlay === null) {
            console.warn('Tried to call startProgress on an ClickableIcon without progressOverlay.');
            return;
        }

        this.progress = {
            requiredTicks: seconds * 1000 / Constants.SERVER_TICKRATE
        };
        this.progress.remainingTicks = this.progress.requiredTicks;

        this.domElement.classList.add('inProgress');
        this.progressOverlay.classList.remove('hidden');
        this.inProgress = true;
    }

    updateProgress(ticksRemaining) {
        if (!this.inProgress) {
            console.error("Invalid State: Received progress update, but this icon is not in progress.");
            return;
        }
        this.progress.remainingTicks = ticksRemaining;
        if (this.progress.remainingTicks <= 0) {
            this.progressOverlay.style.top = '100%';
            this.domElement.classList.remove('inProgress');
            this.progressOverlay.classList.add('hidden');
            this.inProgress = false;
            delete this.progress;
            InventoryChangedEvent.trigger();
        } else {
            let top = 100 * this.progress.remainingTicks / this.progress.requiredTicks;
            this.progressOverlay.style.top = top.toFixed(3) + '%';
        }
    }

    // TODO Display delayed click animation
}
