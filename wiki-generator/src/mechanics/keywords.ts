import {chance, meter, percentage, perSecond, seconds} from "../format";
import {BasicConfig} from "../../../frontend/src/config/BasicConfig";

// See berryhunterd/items/itemdefinition.go type itemDefinition
export const KEYWORD_DATA: { [key: string]: { name?: string, formatter?: (number) => string, link?: string, ignore?: boolean } } = {
    'food': {
        formatter: percentage,
        link: 'Mechanics#Food_.26_Starvation'
    },
    'damage': {
        formatter: percentage,
        link: 'Mechanics#Health_.26_Damage'
    },
    'damageFraction': {
        formatter: value => perSecond(percentage(value * BasicConfig.SERVER_TICKRATE)),
        link: 'Mechanics#Health_.26_Damage'
    },
    'structureDamage': {
        formatter: percentage,
        link: 'Mechanics#Placeables'
    },
    'vulnerability': {
        formatter: percentage,
        link: 'Mechanics#Health_.26_Damage'
    },
    'minimumYield': {
        'name': 'Yield Resistance',
        link: 'Mechanics#Resource_Gathering_.26_Regrow'
    },
    'durationInSeconds': {
        'name': 'Lifespan',
        formatter: seconds,
        link: 'Mechanics#Placeables'
    },
    'heatPerSecond': {
        'name': 'Heat',
        formatter: (value) => perSecond(percentage(value)),
        link: 'Mechanics#Heat_.26_Coldness'
    },
    'heatRadius': {
        formatter: meter,
        link: 'Mechanics#Heat_.26_Coldness'
    },
    'replenishProbabilityPerSecond': {
        'name': 'Replenishment Rate',
        formatter: (value) => perSecond(chance(value)),
        link: 'Mechanics#Resource_Gathering_.26_Regrow'
    },
    'yield': {
        link: 'Mechanics#Resource_Gathering_.26_Regrow'
    },
    'capacity': {
        link: 'Mechanics#Resource_Gathering_.26_Regrow'
    },
    'deltaPhi': {
        ignore: true
    },
    'turnRate': {
        ignore: true
    },
    'speed': {
        formatter: value => percentage(value) + ' of character speed'
    }
};
