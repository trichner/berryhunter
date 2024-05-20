import * as Mustache from 'mustache';
import * as fs from 'fs';
import {promises as fsPromises} from 'fs';
import {ImageConverter} from "./imageConverter";

const outputPath = '/../output';

export function render(templateName: string, outputName: string, viewData: any, imageConverter: ImageConverter): Promise<void> {
    return fsPromises.readFile(__dirname + '/' + templateName, 'utf8')
        .then((template: string) => {
            return Mustache.render(
                template,
                viewData
            );
        })
        .then((rendered: string) => {
            if (!fs.existsSync(__dirname + outputPath)) {
                fs.mkdirSync(__dirname + outputPath);
            }

            return fsPromises.writeFile(__dirname + outputPath + '/' + outputName + '.wiki.html', rendered, 'utf8');
        })
        .then(() => {
            if (!fs.existsSync(__dirname + outputPath + '/images')) {
                fs.mkdirSync(__dirname + outputPath + '/images');
            }

           return imageConverter.render(__dirname + outputPath + '/images/');
        })
        .catch(err => {
            console.error(err);
        })
        .then(() => {
            console.info('Successfully written output to ' + __dirname + outputPath + '!');
        });

}
