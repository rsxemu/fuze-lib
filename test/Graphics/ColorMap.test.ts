import { readFile, writeFile } from "fs/promises";
import colors from "../../src/Graphics/ColorMap"

test('Generates correct values', async () => {
    //await writeFile('./sample/colors.json', JSON.stringify(colors));
    const colorsSample: number[] = JSON.parse((await readFile('./sample/colors.json')).toString());

    for (let i = 0; i < colorsSample.length; i++) {
        expect(colors[i]).toEqual(colorsSample[i]);
    }
});