import {isFunction} from '../../../common/logic/Utils';
import {Items} from '../../../items/logic/Items';
import {SubIcon} from './SubIcon';
import {BasicConfig as Constants} from '../../../../client-data/BasicConfig';
import {IGame} from '../../../core/logic/IGame';
import {GameSetupEvent, InventoryChangedEvent} from '../../../core/logic/Events';

let Game: IGame = null;
GameSetupEvent.subscribe((game: IGame) => {
    Game = game;
});


export class ClickableIcon {
    private clickable: boolean = false;
    protected readonly domElement: Element;
    private _inProgress: boolean = false;
    private progress: { requiredTicks: number, remainingTicks: number } = null;

    public onPointerup: (event: PointerEvent) => void = null;
    public onPointerdown: (event: PointerEvent) => void = null;
    public onLeftClick: (event: PointerEvent) => void = null;
    public onRightClick: (event: PointerEvent) => void = null;

    private imageNode: Element;
    private readonly progressOverlay: HTMLElement;

    private subIcons: SubIcon[];

    constructor(node: Element) {
        this.domElement = node;

        this.domElement.addEventListener('pointerup', (event: PointerEvent) => {
            event.stopPropagation();
            event.preventDefault();

            if (this.clickable && isFunction(this.onPointerup)) {
                this.onPointerup(event);
            }
        });
        this.domElement.addEventListener('pointerdown', (event: PointerEvent) => {
            event.stopPropagation();
            event.preventDefault();

            if (this.clickable && isFunction(this.onPointerdown)) {
                this.onPointerdown(event);
            }
        });
        this.domElement.addEventListener('click', (event: PointerEvent) => {
            event.stopPropagation();
            event.preventDefault();

            if (this.clickable && isFunction(this.onLeftClick)) {
                this.onLeftClick(event);
            }
        });
        this.domElement.addEventListener('contextmenu', (event: PointerEvent) => {
            event.stopPropagation();
            event.preventDefault();

            if (this.clickable && isFunction(this.onRightClick)) {
                this.onRightClick(event);
            }
        });

        this.imageNode = this.domElement.querySelector('.itemIcon');
        this.progressOverlay = this.domElement.querySelector('.progressOverlay');
    }

    private set inProgress(value: boolean) {
        this._inProgress = value;
    }

    public get inProgress(): boolean {
        return this._inProgress;
    }

    appendTo(element: Element) {
        element.appendChild(this.domElement);
    }

    setIconGraphic(svgPath: string, clickable: boolean) {
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

    setClickable(clickable: boolean) {
        this.clickable = clickable;
        this.domElement.classList.toggle('clickable', clickable);
    }

    addSubIcons(materials: { [key: string]: number }) {
        this.subIcons = [];
        let hasPrimary = false;
        let iconIndex = 0;
        Object.entries(materials).forEach((material: [string, number]) => {
            const itemName = material[0];
            const count = material[1];
            const iconPath = Items[itemName].icon.file;

            let domElement: HTMLElement;
            if (!hasPrimary && count === 1) {
                domElement = this.domElement.querySelector('.subIcon.primary');
                hasPrimary = true;
            } else {
                domElement = this.domElement.querySelectorAll('.subIconRow > .subIcon').item(iconIndex) as HTMLElement;
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

    setHinted(flag: boolean) {
        if (flag) {
            this.domElement.classList.add('hinted');
        } else {
            this.domElement.classList.remove('hinted');
        }
    }

    startProgress(seconds: number) {
        if (this.progressOverlay === null) {
            console.warn('Tried to call startProgress on an ClickableIcon without progressOverlay.');
            return;
        }

        let requiredTicks = seconds * 1000 / Constants.SERVER_TICKRATE;
        this.progress = {
            requiredTicks: requiredTicks,
            remainingTicks: requiredTicks,
        };

        this.domElement.classList.add('inProgress');
        this.progressOverlay.classList.remove('hidden');
        this.inProgress = true;
    }

    updateProgress(ticksRemaining: number) {
        if (!this.inProgress) {
            console.error('Invalid State: Received progress update, but this icon is not in progress.');
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
