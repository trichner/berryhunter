/**
 * This module represents a player account. As long as accounts are not persisted
 * in the backend, the account is held in the local storage of the browser.
 */

export class Account {
    static get playerName(): string {
        return getString('playerName');
    }

    static set playerName(playerName: string) {
        setValue('playerName', playerName);
    }

    static get tutorialCompleted(): number {
        return getInt('tutorialCompleted');
    }

    static set tutorialCompleted(timeStamp: number) {
        setValue('tutorialCompleted', String(timeStamp));
    }

    static get fullScreen(): boolean {
        return getBoolean('fullScreen');
    }

    static set fullScreen(enabled: boolean) {
        setValue('fullScreen', enabled);
    }

    static get rawGameSettings(): string {
        return getString('gameSettings');
    }

    static set rawGameSettings(json: string) {
        setValue('gameSettings', json);
    }
}

function getString(key: string) {
    return localStorage.getItem(key);
}

function getBoolean(key: string): boolean {
    return (getString(key) === 'true');
}

function getInt(key: string): number {
    let value = getString(key);
    return value === null ? null : parseInt(value, 10);
}

function setValue(key: string, value: any) {
    if (value) {
        localStorage.setItem(key, value);
    } else {
        localStorage.removeItem(key);
    }
}
