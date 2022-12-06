import setGamma from "./AdjustBrightness";

const HUE_RANGE = 64;
const SATURATION_RANGE = 8;
const HEIGHT = HUE_RANGE * SATURATION_RANGE;
const WIDTH = 128;
const SIZE = HEIGHT * WIDTH;

const HUE_OFFSET = 0.0078125;
const SATURATION_OFFSET = 0.0625;

const A1 = 1.0 / 3.0;
const A2 = 2.0 / 3.0;

export function calculateHue(p: number, q: number, t: number): number {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    
    // mul faster than div
    // but functionally equivalent
    // t < 1/6
    if (6 * t < 1.0)
        return p + (q - p) * 6 * t;
    // t < 1/2
    else if (2 * t < 1.0)
        return q;
    // t < 2/3
    else if (3 * t < 2)
        return p + (q - p) * (A2 - t) * 6;

    return p;
}

export interface PaletteOptions {
    brightness: number;
    randomFactor?: number;
}

export function generateHSLPalette(opts?: PaletteOptions): number[] {
    const options: PaletteOptions = opts ?? {
        brightness: 1,
        randomFactor: 0,
    };

    const brightness = (options.brightness ?? 1) + (options.randomFactor ? (options.randomFactor * 0.03) - 0.015 : 0);
    const colorMap: number[] = new Array(SIZE);
    let offset = 0;

    for (let y = 0; y < HEIGHT; y++) {
        const hue = ((y / 8) / HUE_RANGE) + HUE_OFFSET;
        const saturation = ((y & 7) / SATURATION_RANGE) + SATURATION_OFFSET;

        for (let x = 0; x < WIDTH; x++) {
            const lightness = x / WIDTH;
            let r = lightness;
            let g = lightness;
            let b = lightness;
            
            // TODO do we need to round?
            if (saturation != 0.0) {
                const q = lightness < 0.5 ? lightness * (1.0 + saturation) : lightness + saturation - lightness * saturation;
                const p = 2 * lightness - q;

                r = calculateHue(p, q, hue + A1);
                g = calculateHue(p, q, hue);
                b = calculateHue(p, q, hue - A1);
            }

            // convert to integer
            // Math.trunc?
            const rgb = (Math.max(0, Math.min(Math.round(r * 255), 255)) << 16)
                + (Math.max(0, Math.min(Math.round(g * 255), 255)) << 8)
                + Math.max(0, Math.min(Math.round(b * 255), 255));
            // adjust lightness
            const rgbLight = setGamma(rgb, brightness);
            // prevent true black (indistinguishable) by setting rgb to 1 which is 0, 0, 1
            // NOTE: brightness at 1.0 will set rgb to 16843008 which is 1, 1, 1 (same)
            colorMap[offset++] = rgbLight == 0 ? 1 : rgbLight;
        }
    }

    return colorMap;
}

export const colors = generateHSLPalette();
export default colors;