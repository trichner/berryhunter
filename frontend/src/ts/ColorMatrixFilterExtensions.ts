/**
 * Adds presets to PIXI.filters.ColorMatrixFilter
 */
import {ColorMatrix} from '@pixi/filter-color-matrix';
import {ColorMatrixFilter} from 'pixi.js';

/**
 * @param colorMatrixFilter
 * @param greyscale 0 = full color, 1 = full grey
 * @param multiply if true, current matrix and matrix are multiplied. If false,
 *  just set the current matrix with @param matrix
 */
export function lumaGreyscale(colorMatrixFilter: ColorMatrixFilter, greyscale: number, multiply: boolean) {
    const lumR = 0.2126;
    const lumG = 0.7152;
    const lumB = 0.0722;

    let s = (1 - greyscale);
    let sr = greyscale * lumR;
    let sg = greyscale * lumG;
    let sb = greyscale * lumB;

    let matrix = [sr + s, sg, sb, 0, 0,
        sr, sg + s, sb, 0, 0,
        sr, sg, sb + s, 0, 0,
        0, 0, 0, 1, 0] as ColorMatrix;

    loadMatrix(colorMatrixFilter, matrix, multiply);
}

/**
 * Conforms svg feFlood filter.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFlood
 *
 * @param colorMatrixFilter
 * @param red
 * @param green
 * @param blue
 * @param floodOpacity
 * @param multiply if true, current matrix and matrix are multiplied. If false,
 *  just set the current matrix with @param matrix
 */
export function flood(colorMatrixFilter: ColorMatrixFilter, red: number, green: number, blue: number, floodOpacity: number, multiply?: boolean) {
    floodOpacity = floodOpacity || 0;
    let floodTransparency = (1 - floodOpacity);

    function colorOpacity(value: number) {
        return (value + (255 - value) * floodTransparency) / 255;
    }

    let matrix =
        [colorOpacity(red), 0, 0, 0, 0,
            0, colorOpacity(green), 0, 0, 0,
            0, 0, colorOpacity(blue), 0, 0,
            0, 0, 0, 1, 0] as ColorMatrix;

    loadMatrix(colorMatrixFilter, matrix, multiply);
}

// Copied private methods from ColorMatrixFilter

/**
 * Transforms current matrix and set the new one
 * @param colorMatrixFilter
 * @param {number[]} matrix - 5x4 matrix
 * @param multiply - if true, current matrix and matrix are multiplied. If false,
 *  just set the current matrix with @param matrix
 */
function loadMatrix(colorMatrixFilter: ColorMatrixFilter, matrix: ColorMatrix, multiply = false): void {
    let newMatrix = matrix;

    if (multiply) {
        multiplyMatrix(newMatrix, colorMatrixFilter.matrix, matrix);
        newMatrix = colorMatrix(newMatrix);
    }

    // set the new matrix
    colorMatrixFilter.matrix = newMatrix;
}


/**
 * Multiplies two mat5's
 * @private
 * @param out - 5x4 matrix the receiving matrix
 * @param a - 5x4 matrix the first operand
 * @param b - 5x4 matrix the second operand
 * @returns {number[]} 5x4 matrix
 */
function multiplyMatrix(out: ColorMatrix, a: ColorMatrix, b: ColorMatrix): ColorMatrix {
    // Red Channel
    out[0] = (a[0] * b[0]) + (a[1] * b[5]) + (a[2] * b[10]) + (a[3] * b[15]);
    out[1] = (a[0] * b[1]) + (a[1] * b[6]) + (a[2] * b[11]) + (a[3] * b[16]);
    out[2] = (a[0] * b[2]) + (a[1] * b[7]) + (a[2] * b[12]) + (a[3] * b[17]);
    out[3] = (a[0] * b[3]) + (a[1] * b[8]) + (a[2] * b[13]) + (a[3] * b[18]);
    out[4] = (a[0] * b[4]) + (a[1] * b[9]) + (a[2] * b[14]) + (a[3] * b[19]) + a[4];

    // Green Channel
    out[5] = (a[5] * b[0]) + (a[6] * b[5]) + (a[7] * b[10]) + (a[8] * b[15]);
    out[6] = (a[5] * b[1]) + (a[6] * b[6]) + (a[7] * b[11]) + (a[8] * b[16]);
    out[7] = (a[5] * b[2]) + (a[6] * b[7]) + (a[7] * b[12]) + (a[8] * b[17]);
    out[8] = (a[5] * b[3]) + (a[6] * b[8]) + (a[7] * b[13]) + (a[8] * b[18]);
    out[9] = (a[5] * b[4]) + (a[6] * b[9]) + (a[7] * b[14]) + (a[8] * b[19]) + a[9];

    // Blue Channel
    out[10] = (a[10] * b[0]) + (a[11] * b[5]) + (a[12] * b[10]) + (a[13] * b[15]);
    out[11] = (a[10] * b[1]) + (a[11] * b[6]) + (a[12] * b[11]) + (a[13] * b[16]);
    out[12] = (a[10] * b[2]) + (a[11] * b[7]) + (a[12] * b[12]) + (a[13] * b[17]);
    out[13] = (a[10] * b[3]) + (a[11] * b[8]) + (a[12] * b[13]) + (a[13] * b[18]);
    out[14] = (a[10] * b[4]) + (a[11] * b[9]) + (a[12] * b[14]) + (a[13] * b[19]) + a[14];

    // Alpha Channel
    out[15] = (a[15] * b[0]) + (a[16] * b[5]) + (a[17] * b[10]) + (a[18] * b[15]);
    out[16] = (a[15] * b[1]) + (a[16] * b[6]) + (a[17] * b[11]) + (a[18] * b[16]);
    out[17] = (a[15] * b[2]) + (a[16] * b[7]) + (a[17] * b[12]) + (a[18] * b[17]);
    out[18] = (a[15] * b[3]) + (a[16] * b[8]) + (a[17] * b[13]) + (a[18] * b[18]);
    out[19] = (a[15] * b[4]) + (a[16] * b[9]) + (a[17] * b[14]) + (a[18] * b[19]) + a[19];

    return out;
}

/**
 * Create a Float32 Array and normalize the offset component to 0-1
 * @param {number[]} matrix - 5x4 matrix
 * @returns {number[]} 5x4 matrix with all values between 0-1
 */
function colorMatrix(matrix: ColorMatrix): ColorMatrix {
    // Create a Float32 Array and normalize the offset component to 0-1
    const m = new Float32Array(matrix);

    m[4] /= 255;
    m[9] /= 255;
    m[14] /= 255;
    m[19] /= 255;

    return m as any;
}
