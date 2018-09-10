'use strict';
import {BerryhunterApi} from './BerryhunterApi';

export default class Welcome {

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