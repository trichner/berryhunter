import '../assets/socialMedia.less';
import {PreloadingStartedEvent} from "../../../core/logic/Events";
import {htmlModuleToString} from "../../../common/logic/Utils";

const htmlFile = require('../assets/socialMedia.html');

let htmlContentResolve: (value: string | PromiseLike<string>) => void;
export const content = new Promise<string>((resolve) => {
    htmlContentResolve = resolve;
});
PreloadingStartedEvent.subscribe(() => {
    htmlContentResolve(htmlModuleToString(htmlFile));
});
