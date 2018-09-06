import './css/index.less';
import * as Preloading from './ts/Preloading';
import * as Events from './ts/Events';

Preloading.executePreload([]).then(function () {
    Events.triggerOneTime('modulesLoaded');
});