import * as changeCase from "change-case";
import {KEYWORD_DATA} from "./mechanics/keywords";
import {isDefined} from "../../frontend/src/features/common/logic/Utils";

export interface MappedFactor {
    name: string;
    rawName: string;
    value: string | number;
    link: string;
}

export function mapFactors(factors): MappedFactor[] {
    let mapped: MappedFactor[] = [];
    for (let key in factors) {
        let value = factors[key];
        let mappedFactor = mapFactor(key, value);
        if (mappedFactor !== null){
            mapped.push(mappedFactor);
        }
    }

    return mapped;
}

export function mapFactor(factor: string, value: string | number): MappedFactor {
    let name = changeCase.capitalCase(factor);
    let mappedValue: string | number = value;
    let link: string = undefined;

    let keyword = KEYWORD_DATA[factor];
    if (isDefined(keyword)) {
        if (keyword.ignore) {
            return null;
        }

        if (isDefined(keyword.name)) {
            name = keyword.name;
        }

        if (isDefined(keyword.formatter)) {
            mappedValue = keyword.formatter(value);
        }

        link = keyword.link;
    } else {
        console.error('Unexpected factor "' + factor + '"');
    }

    return {
        name: name,
        rawName: factor,
        value: mappedValue,
        link: link
    };
}
