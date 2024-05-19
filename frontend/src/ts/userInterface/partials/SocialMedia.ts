import {PreloadingStartedEvent} from "../../Events";
import {htmlModuleToString} from "../../Utils";

const htmlFile = require('./socialMedia.html');

let htmlContentResolve: (value: string | PromiseLike<string>) => void;
export const content = new Promise<string>((resolve) => {
    htmlContentResolve = resolve;
});
PreloadingStartedEvent.subscribe(() => {
    htmlContentResolve(htmlModuleToString(htmlFile));
});
