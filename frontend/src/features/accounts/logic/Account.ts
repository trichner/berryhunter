/**
 * This module represents a player account. As long as accounts are not persisted
 * in the backend, the account is held in the local storage of the browser.
 */

export class Account {
    static reset(property: string) {
        resetValue(property);
    }

    static get playerName(): string | null {
        return getString('playerName', null);
    }

    static set playerName(playerName: string) {
        setValue('playerName', playerName);
    }

    static get tutorialActivated(): boolean | null {
        return getBoolean('tutorialActivated', null);
    }

    static set tutorialActivated(active: boolean) {
        setValue('tutorialActivated', String(active));
    }

    static get tutorialCompleted(): number | null {
        return getInt('tutorialCompleted', null);
    }

    static set tutorialCompleted(timeStamp: number) {
        setValue('tutorialCompleted', String(timeStamp));
    }

    static get fullScreen(): boolean {
        return getBoolean('fullScreen', false);
    }

    static set fullScreen(enabled: boolean) {
        setValue('fullScreen', String(enabled));
    }

    static get rawGameSettings(): string | null {
        return getString('gameSettings', null);
    }

    static set rawGameSettings(json: string) {
        setValue('gameSettings', json);
    }

    static get developPanelPositionX(): number | null {
        return getInt('developPanel.position.x', null);
    }

    static set developPanelPositionX(x: number) {
        setValue('developPanel.position.x', String(x));
    }

    static get developPanelPositionY(): number | null {
        return getInt('developPanel.position.y', null);
    }

    static set developPanelPositionY(y: number) {
        setValue('developPanel.position.y', String(y));
    }
}

function isSet(key: string) {
    return localStorage.getItem(key) !== null;
}

function getString(key: string, defaultValue: string | null = ''): string | null {
    const value = localStorage.getItem(key);
    if (value === null) return defaultValue;
    return value;
}

function getBoolean(key: string, defaultValue: boolean | null = false): boolean | null {
    const value = localStorage.getItem(key);
    if (value === null) return defaultValue;
    return (value === 'true');
}

function getInt(key: string, defaultValue: number | null = 0): number {
    const value = localStorage.getItem(key);
    if (value === null) return defaultValue;
    return parseInt(value, 10);
}

function setValue(key: string, value: string) {
    if (value) {
        localStorage.setItem(key, value);
    } else {
        localStorage.removeItem(key);
    }
}

function resetValue(key: string) {
    localStorage.removeItem(key);
}
