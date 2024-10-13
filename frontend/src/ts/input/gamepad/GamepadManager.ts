// GamepadManager.ts
export class GamepadManager {
    private gamepads: (Gamepad | null)[] = [];

    constructor() {
        window.addEventListener("gamepadconnected", (event) => this.onGamepadConnected(event));
        window.addEventListener("gamepaddisconnected", (event) => this.onGamepadDisconnected(event));
    }

    private onGamepadConnected(event: GamepadEvent) {
        const gamepad = event.gamepad;
        this.gamepads[gamepad.index] = gamepad;
        console.log(`Gamepad connected at index ${gamepad.index}: ${gamepad.id}`);
    }

    private onGamepadDisconnected(event: GamepadEvent) {
        const gamepad = event.gamepad;
        this.gamepads[gamepad.index] = null;
        console.log(`Gamepad disconnected from index ${gamepad.index}`);
    }

    public updateGamepadStates(): void {
        const connectedGamepads = navigator.getGamepads();
        for (let i = 0; i < connectedGamepads.length; i++) {
            const gp = connectedGamepads[i];
            if (gp) {
                this.gamepads[gp.index] = gp;
            }
        }
    }

    public isButtonPressed(gamepadIndex: number, buttonIndex: number): boolean {
        const gamepad = this.gamepads[gamepadIndex];
        if (gamepad && gamepad.buttons[buttonIndex]) {
            return gamepad.buttons[buttonIndex].pressed;
        }
        return false;
    }

    public logButtonsPressed() {
        const gamepad = this.gamepads[0];
        for (let i = 0; i < gamepad.buttons.length; i++) {
            const gp = gamepad.buttons[i];
            if (gp && gp.pressed) {
                console.log("Button on gamepad is pressed: " + i.toString());
            }
        }
    }

    public getAxisValue(gamepadIndex: number, axisIndex: number): number {
        const gamepad = this.gamepads[gamepadIndex];
        if (gamepad && gamepad.axes[axisIndex] !== undefined) {
            return gamepad.axes[axisIndex];
        }
        return 0;
    }

    public getGamepadCount(): number {
        return this.gamepads.filter(gp => gp !== null).length;
    }

    public pollGamepads(): void {
        this.updateGamepadStates();
        requestAnimationFrame(() => this.pollGamepads());
    }
}
