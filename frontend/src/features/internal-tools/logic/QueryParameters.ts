import {isUndefined} from '../../../old-structure/Utils';

export class QueryParameters {
    private static instance: QueryParameters = null;
    private urlSearchParams: URLSearchParams;

    public static get() {
        if (this.instance === null) {
            this.instance = new QueryParameters();
        }

        return this.instance;
    }

    constructor() {
        this.urlSearchParams = new URLSearchParams(location.search);
    }

    public has(name: string): boolean {
        return this.urlSearchParams.has(name);
    }

    /**
     * If the parameter is present but doesn't contain a value, this method is going to return an empty string.
     */
    public getString(name: string, defaultValue?: string): string {
        const value = this.urlSearchParams.get(name);
        if (value === null) {
            if (isUndefined(defaultValue)) {
                throw 'Couldn\'t find ' + name + ' in query parameters and no default value was provided.';
            }
            return defaultValue;
        }

        return value.trim();
    }

    public tryGetString(name: string, out: (value: string) => void): boolean {
        const value = this.urlSearchParams.get(name);
        if (value === null) {
            return false;
        }

        out(value.trim());
        return true;
    }

    public getStringArray(name: string, defaultValues?: string[]): string[] {
        const value = this.urlSearchParams.get(name);
        if (value === null) {
            if (isUndefined(defaultValues)) {
                throw 'Couldn\'t find ' + name + ' in query parameters and no default value was provided.';
            }
            return defaultValues;
        }

        return value
            .split(',')
            .filter(entry => !!entry)
            .map((entry) => entry.trim())
            .filter(entry => entry !== '');
    }

    public tryGetStringArray(name: string, out: (value: string[]) => void): boolean {
        const value = this.urlSearchParams.get(name);
        if (value === null) {
            return false;
        }

        out(value
            .split(',')
            .filter(entry => !!entry)
            .map((entry) => entry.trim())
            .filter(entry => entry !== ''));
    }
}
