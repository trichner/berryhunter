'use strict';
import {BerryhunterApi} from './BerryhunterApi';

export class Welcome {

    serverName: string;
    mapRadius: number;

    /**
     *
     * @param {BerryhunterApi.Welcome} welcome
     */
    constructor(welcome) {
        this.serverName = welcome.serverName();
        this.mapRadius = welcome.mapRadius();
    }
}