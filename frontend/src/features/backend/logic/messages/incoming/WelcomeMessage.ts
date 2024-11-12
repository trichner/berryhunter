import {BerryhunterApi} from '../../BerryhunterApi';

export class WelcomeMessage {

    serverName: string;
    mapRadius: number;
    totalDayCycleTicks: number;
    dayTimeTicks: number;

    /**
     *
     * @param {BerryhunterApi.Welcome} welcome
     */
    constructor(welcome) {
        this.serverName = welcome.serverName();
        this.mapRadius = welcome.mapRadius();
        this.totalDayCycleTicks = welcome.totalDaycycleTicks().toFloat64();
        this.dayTimeTicks = welcome.dayTimeTicks().toFloat64();
    }
}
