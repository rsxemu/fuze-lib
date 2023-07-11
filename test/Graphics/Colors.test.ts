import { expect, test } from '@jest/globals';
import { Colors } from "../../src/Graphics/Colors"

test('Generates correct values', async () => {
    expect(Colors.toInt(255, 255, 255)).toEqual(Colors.WHITE);
});