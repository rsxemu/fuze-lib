const jsonParse = JSON.parse;

/**
 * Converts a JavaScript Object Notation (JSON) string into an object.
 * @param text A valid JSON string.
 * @param reviver A function that transforms the results. This function is called for each member of the object.
 * If a member contains nested objects, the nested objects are transformed before the parent object is.
 */
export function parse(text: string, reviver?: (this: any, key: string, value: any) => any): any {
    return jsonParse(text, function(this: any, key: any, value: any) {
        if (typeof value === 'string') {
            const m = value.match(/(-?\d+)n/);
            if (m && m[0] === value) {
                value = BigInt(m[1]);
            }
        }

        return reviver ? reviver(key, value) : value;
    });
}

export function monkeyBigInt() {
    JSON.parse = parse;

    (BigInt.prototype as any).toJSON = function () {
        return `${this.toString()}n`;
    };
}
