/**
 * INT24_RGB encoded color constants
 */
export enum Colors {
    WHITE = 0xFFFFFF,
    BLACK = 0x000000,
    RED = 0xFF0000,
    GREEN = 0x00FF00,
    BLUE = 0x0000FF,
    YELLOW = 0xFFFF00,
    PINK = 0xFF00FF,
    CYAN = 0x00FFFF,
    ORANGE = 0xFF7F00,
    PURPLE = 0x7F00FF,
    HOTPINK = 0xFF007F,
    SKYBLUE = 0x87CEEB,
}

/**
 * RGB-based color manipulation functions.
 */
export namespace Colors {
    /**
     * Converts RGB channels to INT24_RGB
     * @param r The red channel, 0-255.
     * @param g The green channel, 0-255.
     * @param b The blue channel, 0-255.
     * @returns The INT24_RGB
     */
    export function toInt(r: number, g: number, b: number) {
        return (r << 16) | (g << 8) | b;
    }

    /**
     * Converts INT24_HSL to INT16_HSL. A format usually used with the palette generated in RuneTek 3 engines. (Lossy)
     *
     * @param hsl The INT24_HSL
     * @return The INT16_HSL
     */
    export function hsl24To16(hsl: number) {
        const hue = (hsl >> 16) & 0xFF;
        const saturation = (hsl >> 8) & 0xFF;
        const lightness = hsl & 0xFF;
        return ((hue / 4) << 10) | ((saturation / 32) << 7) | (lightness >> 1);
    }

    /**
     * Converts INT24_RGB to HSL_16 using rgb24ToHSL24 then hsl24To16.
     * @param rgb The INT24_RGB
     * @returns The INT16_HSL
     */
    export function toHSL16(rgb: number) {
        return hsl24To16(encodedToHSL24(rgb));
    }

    /**
     * Converts an INT24_RGB value to INT24_HSL.
     *
     * @param rgb The INT24_RGB encoded value.
     * @return The INT24_HSL
     */
    export function encodedToHSL24(rgb: number): number {
        const r = ((rgb >> 16) & 0xFF) / 255.0;
        const g = ((rgb >> 8) & 0xFF) / 255.0;
        const b = (rgb & 0xFF) / 255.0;
        return toHSL24(r, g, b);
    }

    /**
     * Converts RGB values to INT24_HSL.
     *
     * @param r the red channel.
     * @param g the green channel.
     * @param b the blue channel.
     * @return The INT24_HSL.
     */
    export function toHSL24(r: number, g: number, b: number): number {
        const min = Math.min(Math.min(r, g), b);
        const max = Math.max(Math.max(r, g), b);

        let hue = 0.0;
        let saturation = 0.0;
        const lightness = (min + max) / 2.0;

        if (min !== max) {
            if (lightness < 0.5) {
                saturation = (max - min) / (max + min);
            }

            if (lightness >= 0.5) {
                saturation = (max - min) / (2.0 - max - min);
            }

            if (r === max) {
                hue = (g - b) / (max - min);
            }
            else if (g === max) {
                hue = 2.0 + (b - r) / (max - min);
            }
            else if (b === max) {
                hue = 4.0 + (r - g) / (max - min);
            }
        }

        hue /= 6.0;
        return ((hue * 255.0) << 16) | ((saturation * 255.0) << 8) | (lightness * 255.0);
    }
}