import {meter, percentage, perSecond, seconds} from "../format";

// See berryhunterd/items/itemdefinition.go type itemDefinition
export const KEYWORD_DATA: { [key: string]: { name?: string, formatter?: (number) => string, link?: string, } } = {
    'food': {
        formatter: percentage,
        link: 'Mechanics#Food_.26_Starvation'
    },
    'damage': {
        formatter: percentage,
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
        link: 'Mechanics#Gathering_Resources'
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
        formatter: perSecond,
        link: 'Mechanics#Resource_Replenishment'
    },
    'yield': {
        link: 'Mechanics#Gathering_Resources'
    },
    'capacity': {
        link: 'Mechanics#Resource_Replenishment'
    }
};