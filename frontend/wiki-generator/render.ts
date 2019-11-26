import * as Mustache from 'mustache';
import * as fs from 'fs';
import {promises as fsPromises} from 'fs';
import {ImageConverter} from "./imageConverter";

export function render(templateName: string, outputName: string, viewData: any, imageConverter: ImageConverter): Promise<void> {
    return fsPromises.readFile(__dirname + '/' + templateName, 'utf8')
        .then((template: string) => {
            return Mustache.render(
                template,
                viewData
            );
        })
        .then((rendered: string) => {
            if (!fs.existsSync(__dirname + '/output')) {
                fs.mkdirSync(__dirname + '/output');
            }

            return fsPromises.writeFile(__dirname + '/output/' + outputName + '.wiki.html', rendered, 'utf8');
        })
        .then(() => {
            if (!fs.existsSync(__dirname + '/output/images')) {
                fs.mkdirSync(__dirname + '/output/images');
            }

           return imageConverter.render(__dirname + '/output/images/');
        })
        .catch(err => {
            console.error(err);
        })
        .then(() => {
            console.info('Successfully written output to ./output!');
        });

}