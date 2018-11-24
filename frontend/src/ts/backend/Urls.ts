import {getUrlParameter} from "../Utils";
import {BasicConfig as Constants} from "../../config/Basic";

function getHostname() {
    let hostname = window.location.hostname;
    if (hostname === 'localhost') {
        return 'local.berryhunter.io';
    }

    return hostname;
}

const developmentPort = '2015';

/**
 *
 * @param protocol http or ws, the 's' for secure layer will be attached according to the current protocol
 * @param path
 */
function getUrl(protocol: string, path: string) {
    let security = '';
    if (window.location.protocol === 'https:') {
        security = 's';
    }

    let currentPort = window.location.port;
    let port = '';
    if (currentPort !== '' && currentPort !== '80') {
        port = ':' + developmentPort;
    }

    return protocol + security + '://' + getHostname() + port + '/' + path;
}

let _gameServer: string;
let _database: string;

if (getUrlParameter(Constants.MODE_PARAMETERS.NO_DOCKER)) {
    _gameServer = 'ws://localhost:2000/game';
    _database = '/chieftain';
} else {
    _gameServer = getUrl('ws', 'game');
    _database = getUrl('http', 'chieftain');
}

export const gameServer = _gameServer;
export const database = _database;
