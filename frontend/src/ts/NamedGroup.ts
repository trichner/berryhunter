'use strict';

import * as PIXI from 'pixi.js';
import {BasicConfig as Constants} from '../config/Basic';


export class NamedGroup extends PIXI.Container {
    constructor(name) {
        super();


        if (!Constants.USE_NAMED_GROUPS) {
            NamedGroup.nameGroup(this, name);
        }
    }


    static nameGroup(group, name) {
        group['!name'] = name;
    };
}
