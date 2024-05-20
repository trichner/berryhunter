import * as changeCase from "change-case";
import * as path from "path";

const sharp = require('sharp');

export class ImageConverter {
    imagesToConvert: { input: string, output: string }[] = [];

    convert(fileName: string): string {
        let output = this.getImageExportName(fileName);
        this.imagesToConvert.push({
            input: fileName,
            output: output
        });

        return output;
    }

    getImageExportName(fileName: string): string {
        return changeCase.pascalCase(path.parse(fileName).name) + '.png';
    }

    render(outputPath: string): Promise<unknown[]> {
        return Promise.all(this.imagesToConvert.map((imageToConvert) => {
            return sharp(imageToConvert.input)
                .resize({width: 128})
                .png({progressive: true})
                .toFile(outputPath + imageToConvert.output);
        }));
    }
}
