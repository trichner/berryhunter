import './less/index.less';
import * as Preloading from './ts/Preloading';
import * as Events from './ts/Events';

// Import shims for ES5, ES6, ES7
import 'core-js';

// Custom scrollbars for panels. CSS is included via index.less
import 'simplebar';

import {ModulesLoadedEvent} from "./ts/Events";

// Import all modules that listen for Events to ensure the listeners are actually registered
import './ts/AutoFeed';
import './ts/BrowserConsole';
import './ts/Controls';
import './ts/FullScreen';
import './ts/Game';
import './ts/tutorial/Tutorial';
import './ts/backend/Backend';
import './ts/develop/_Develop';
import './ts/develop/DebugCircle';
import './ts/gameObjects/Character';
import './ts/gameObjects/Mobs';
import './ts/gameObjects/Resources';
import './ts/groundTextures/_Panel';
import './ts/groundTextures/GroundTexture';
import './ts/items/Crafting';
import './ts/items/Inventory';
import './ts/items/InventoryShortcuts';
import './ts/items/InventorySlot';
import './ts/items/Items';
import './ts/scores/HighScores';
import './ts/userInterface/ClickableIcon';
import './ts/userInterface/screens/Changelog';
import './ts/userInterface/screens/EndScreen';
import './ts/userInterface/screens/StartScreen';
import './ts/juice/Juice';

Preloading.executePreload().then(function () {
    ModulesLoadedEvent.trigger();
});
