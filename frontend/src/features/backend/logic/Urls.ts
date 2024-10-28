import {BasicConfig as Constants} from "../../../client-data/BasicConfig";
import {QueryParameters} from '../../internal-tools/logic/QueryParameters';

function isLocalhost(hostname: string) {
    switch (hostname) {
        case 'localhost':
        case '127.0.0.1':
            return true;
    }

    return false;
}

function getHostname() {
    let hostname = window.location.hostname;
    if (isLocalhost(hostname)) {
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

if (QueryParameters.get().has(Constants.MODE_PARAMETERS.NO_DOCKER)) {
    _gameServer = 'ws://localhost:2000/game';
    _database = '/chieftain';
} else {
    _gameServer = getUrl('ws', 'game');
    _database = getUrl('http', 'chieftain');
}
QueryParameters.get().tryGetString(Constants.VALUE_PARAMETERS.DATABASE_URL, (dbUrl) => {
    _database = dbUrl;
});
QueryParameters.get().tryGetString(Constants.VALUE_PARAMETERS.WEBSOCKET_URL, (wsUrl) => {
    _gameServer = wsUrl;
});

export const gameServer = _gameServer;
export const database = _database;
