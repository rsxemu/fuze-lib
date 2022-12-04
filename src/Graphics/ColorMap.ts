const SIZE = 0x10000; // 65536
const IS = 512;
const I1S = 128;

const D1 = 0.0078125;
const D2 = 0.0625;

const A1 = 0.33333333333333331;
const A2 = 0.66666666666666663;

export function genColorMap(): number[] {
    const colorMap: number[] = new Array(SIZE);
    let colorIndex = 0;

    for (let i = 0; i < IS; i++) {
        const d1 = ((i / 8) / 64) + D1;
        const d2 = ((i & 7) / 8) + D2;

        for (let i1 = 0; i1 < I1S; i1++) {
            const d3 = i1 / I1S;
            let r = d3;
            let g = d3;
            let b = d3;
            
            // TODO do we need to round?
            if (d2 != 0.0) {
                const d7 = (d3 < 0.5) ? d3 * (1.0 + d2) : d3 + d2 - d3 * d2;
                const d8 = 2 * d3 - d7;

                let d9 = d1 + A1;
                if (d9 > 1.0)
                    d9--;
                
                let d10 = d1;

                let d11 = d1 - A1;
                if (d11 < 0.0)
                    d11++;
                
                if (6 * d9 < 1.0)
                    r = d8 + (d7 - d8) * 6 * d9;
                else if (2 * d9 < 1.0)
                    r = d7;
                else if (3 * d9 < 2)
                    r = d8 + (d7 - d8) * (A2 - d9) * 6;
                else
                    r = d8;
                
                if (6 * d10 < 1.0)
                    g = d8 + (d7 - d8) * 6 * d10;
                else if (2 * d10 < 1.0)
                    g = d7;
                else if (3 * d10 < 2)
                    g = d8 + (d7 - d8) * (A2 - d10) * 6;
                else
                    g = d8;
                
                if (6 * d11 < 1.0)
                    b = d8 + (d7 - d8) * 6 * d11;
                else if (2 * d11 < 1.0)
                    b = d7;
                else if (3 * d11 < 2)
                    b = d8 + (d7 - d8) * (A2 - d11) * 6;
                else
                    b = d8;
            }

            const rgb = (Math.trunc(r * 256) << 16) + (Math.trunc(g * 256) << 8) + Math.trunc(b * 256);
            colorMap[colorIndex++] = rgb == 0 ? 1 : rgb;
        }
    }

    return colorMap;
}

export const colors = genColorMap();
export default colors;