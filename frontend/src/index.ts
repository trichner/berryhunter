import './css/index.less';
import * as Preloading from './ts/Preloading';
import * as Events from './ts/Events';

// Import shims for ES5, ES6, ES7
import 'core-js';

Preloading.executePreload([]).then(function () {
    Events.triggerOneTime('modulesLoaded');
});