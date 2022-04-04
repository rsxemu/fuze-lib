export function uncomplement(val: number, bitwidth) {
    var isnegative = val & (1 << (bitwidth - 1));
    var boundary = (1 << bitwidth);
    var minval = -boundary;
    var mask = boundary - 1;
    return isnegative ? minval + (val & mask) : val;
}

export function uncomplementBigInt(val: bigint, bitwidth) {
    bitwidth = BigInt(bitwidth);
    var isnegative = (val >> ((bitwidth * 8n) - 1n) & 1n) == 1n;
    var boundary = (1n << bitwidth);
    var minval = -boundary;
    var mask = boundary - 1n;
    return isnegative ? minval + (val & mask) : val;
}

export function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O, excludes?: string[]): K[] {
    const retval = Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
    return retval.filter(k => !excludes || (typeof k === 'string' && excludes && excludes.indexOf(k) === -1));
}

export function getEnumKeyByEnumValue<
  TEnumKey extends string,
  TEnumVal extends string | number
>(myEnum: { [key in TEnumKey]: TEnumVal }, enumValue: TEnumVal): string {
  const keys = (Object.keys(myEnum) as TEnumKey[]).filter(
    (x) => myEnum[x] === enumValue,
  );
  return keys.length > 0 ? keys[0] : '';
}

export const toBinString = (bytes) => bytes.reduce((str, byte) => str + byte.toString(2).padStart(8, '0') + "  ", '');
export const toHexString = (bytes) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0') + "        ", '');
export const bytesToArray = (bytes, base: number = 2) => bytes.map(v => v.toString(base));

export function bufferToBigInt(buffer: Uint8Array): bigint {
    let encryptedHex = [];
    
    buffer.forEach(byte =>
        encryptedHex.push(byte.toString(16).padStart(2, '0'))
    );

    return BigInt('0x' + encryptedHex.join(''));
}

export function bigIntToBuffer(number: bigint) {
    var hex = BigInt(number).toString(16);

    if (hex.length % 2) { hex = '0' + hex; }

    var len = hex.length / 2;
    var u8 = new Uint8Array(len);
    var i = 0;
    var j = 0;

    while (i < len) {
        u8[i] = parseInt(hex.slice(j, j + 2), 16);
        i += 1;
        j += 2;
    }

    return u8;
}

export const VALID_CHARS = [
    '_', 'a', 'b', 'c', 'd', // 0-4
    'e', 'f', 'g', 'h', 'i', // 5-9
    'j', 'k', 'l', 'm', 'n', // 10-14
    'o', 'p', 'q', 'r', 's', // 15-19
    't', 'u', 'v', 'w', 'x', // 20-24
    'y', 'z', '0', '1', '2', // 25-29
    '3', '4', '5', '6', '7', // 30-35
    '8', '9',				 // 36-37
    // additional character support
    '!', '@', '#', '$', '%',
    '^', '&', '*', '(', ')',
    '-', '+', '=', ':', ';',
    '.', '>', '<', ',', '"',
    '[', ']', '|', '?', '/',
    '`',
];

// huffman coding
export const XLATE_TABLE = [
    ' ', 'e', 't', 'a', 'o',
    'i', 'h', 'n', 's', 'r',
    'd', 'l', 'u', 'm', 'w',
    'c', 'y', 'f', 'g', 'p',
    'b', 'v', 'k', 'x', 'j',
    'q', 'z', '0', '1', '2',
    '3', '4', '5', '6', '7',
    '8', '9', ' ', '!', '?',
    '.', ',', ':', ';', '(',
    ')', '-', '&', '*', '\\',
    '\'', '@', '#', '+', '=',
    'ó', '$', '%', '"', '[',
    ']',
];

export function nameToLong(name: string): bigint {
    let l = 0n;

    for (let i = 0; i < name.length && i < 12; i++) {
        const b = BigInt(name.charCodeAt(i));
        l *= 37n;

        // A-Z
        if(b >= 65n && b <= 90n)
            l += (1n + b) - 65n;
        // a-z
        else if(b >= 97n && b <= 122n)
            l += (1n + b) - 97n;
        // 0-9
        else if(b >= 48n && b <= 57n)
            l += (27n + b) - 48n;
    }

    while (l % 37n == 0n && l != 0n) {
        l /= 37n;
    }

    return l;
}

export function longToName(name: bigint): string {
    let output = [];

    while (name != 0n) {
        const n1 = name;
        name /= 37n;
        output.push(VALID_CHARS[Number(n1 - (name * 37n))]);
    }

    return output.reverse().join('');
}

export function formatName(name: string): string {
    if (name.length > 0) {
        let formatted = [];
        let nextCapital = true;

        for (let i = 0; i < name.length; i++) {
            let char = name.charCodeAt(i);

            if (nextCapital && char >= 97 && char <= 122) {
                char = char + 65 - 97;
                nextCapital = false;
            }

            if (name[i] == '_') {
                formatted.push(' ');
                nextCapital = true;
            }
            else {
                formatted.push(String.fromCharCode(char));
            }
        }

        return formatted.join('');
    }

    return name;
}

/*const initialInput = 'fuNkE_a_bC 01B';
const formatted = formatName(initialInput);
// formatted = Funke_A01
console.log(formatted);
const encoded = nameToLong(formatted);
console.log(encoded);
const decoded = longToName(encoded);
console.log(decoded);
const decodedFormatted = formatName(decoded);
console.log(decodedFormatted);*/

//console.log(new SquareArea(3200, 3200, 0));