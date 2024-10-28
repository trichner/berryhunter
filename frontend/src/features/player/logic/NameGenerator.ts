import {randomInt} from '../../../old-structure/Utils';

const maleFirstNames = [
    'Arnold',
    'Arthur',
    'Bamm-Bamm',
    'Barney',
    'Bert',
    'Bob',
    'Flinn',
    'Fred',
    'George',
    'Gim-Gim',
    'Henry',
    'Joe',
    'Nate',
    'Oscar',
    'Pebbles',
    'Philo',
    'Pilli',
    'Sam',
    'Stoney',
    'Stony',
    'Sylvester',
    'Tex',
];

const femaleFirstNames = [
    'Betty',
    'Doris',
    'Pearl',
    'Tanya',
    'Wilma',
    'Maggie',
];

const lastNames = [
    'Bone-Scaff',
    'Bull',
    'Cobble',
    'Flintstone',
    'Gypsum',
    'Hardrock',
    'Malachite',
    'Marble',
    'McMagma',
    'McMarble',
    'Pala',
    'Quartz',
    'Rockfeller',
    'Rockhead',
    'Rubble',
    'Slaghead',
    'Slaghoople',
    'Slate',
    'Snowy',
];

function randomElement(array) {
    return array[randomInt(0, array.length)];
}

export function generate() {
    return randomElement(maleFirstNames) + ' ' + randomElement(lastNames);
}
