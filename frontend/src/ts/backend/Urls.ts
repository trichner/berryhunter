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
    if (window.location.protocol === 'https') {
        security = 's';
    }

    let currentPort = window.location.port;
    let port = '';
    if (currentPort !== '' && currentPort !== '80') {
        port = ':' + developmentPort;
    }

    return protocol + security + '://' + getHostname() + port + '/' + path;
}

export const gameServer: string = getUrl('ws', 'game');
export const database: string = getUrl('http', 'chieftain');
