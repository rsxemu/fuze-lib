export default class BitBuffer {
    // TODO: bigger than 32 bit width
    private static BITMASKS = [
		0n, 0x1n, 0x3n, 0x7n, 0xfn,
		0x1fn, 0x3fn, 0x7fn, 0xffn,
		0x1ffn, 0x3ffn, 0x7ffn, 0xfffn,
		0x1fffn, 0x3fffn, 0x7fffn, 0xffffn,
		0x1ffffn, 0x3ffffn, 0x7ffffn, 0xfffffn,
		0x1fffffn, 0x3fffffn, 0x7fffffn, 0xffffffn,
		0x1ffffffn, 0x3ffffffn, 0x7ffffffn, 0xfffffffn,
		0x1fffffffn, 0x3fffffffn, 0x7fffffffn, 0xffffffffn
    ];

    private bigEndian: boolean = false;
    private data: Uint8Array = new Uint8Array(1);
    private bitPosition: number = 0;
    private bitTotal: number = 0;
    private _mark: number = 0;
    
    constructor(data: Uint8Array = null, bigEndian: boolean = false) {
        this.bigEndian = bigEndian;

        if (data) {
            this.data = data;
            this.skip(this.data.length * 8);
        }
    }

    public toString(): string {
        let position = 0;
        let output = '';

        for (let d = 0; d < this.dataLength; d++) {
            for (let i = 7; i >= 0; i--) {
                if (this.bitPosition > position) {
                    output += (this.data[d] & (1 << i)) > 0 ? 1 : 0;
                    position++;
                    continue;
                }

                break;
            }
        }

        return output;
    }

    public get(width: number = 1): bigint | boolean {
        let bytePos = this.bitPosition >> 3;
		let bitOffset = 8 - (this.bitPosition & 7);
		let value = 0n;

		this.bitPosition += width;

        let bigWid = BigInt(width);
        let bigOff = BigInt(bitOffset);
		
		for (; width > bitOffset; bitOffset = 8) {
			value += (BigInt(this.data[bytePos++]) & BitBuffer.BITMASKS[bitOffset]) << bigWid - BigInt(bitOffset);
			width -= bitOffset;
            bigWid -= bigOff;
		}
		
		if (width == bitOffset) {
			value += BigInt(this.data[bytePos]) & BitBuffer.BITMASKS[bitOffset];
		}
		else {
			value += BigInt(this.data[bytePos]) >> BigInt(bitOffset) - bigWid & BitBuffer.BITMASKS[width];
		}

        // if it is 1 bit wide, we are looking for a boolean value
        //  if value (1n) === 1n then it is true, otherwise false
        // if it is larger than 1 bit then just return the value
        return width === 1 ? value === 1n : value;
    }

    public put(value: number | bigint | boolean, width: number = 1): BitBuffer {
        if (value === true || value === false) {
            width = 1;
            value = value === true ? 1 : 0;
        }
        
        const bigVal = BigInt(value);
        
        // store offsets
        let bytePos = this.bitPosition >> 3;
        let bitOffset = 8 - (this.bitPosition & 7);
        let bigOff = BigInt(bitOffset);
        let bigWid = BigInt(width);
        
        // ensure there are available bits (bytes) ahead for the successful write
        // skip(width) calls ensure(minimum) which calls expand(amount) as necessary
        this.skip(width);

        for (; width > bitOffset; bitOffset = 8, bigOff = 8n) {
            this.data[bytePos] &= ~Number(BitBuffer.BITMASKS[bitOffset]) & 0xFF;
            const p = bigVal >> (bigWid - bigOff);
            this.data[bytePos++] |= Number(p & BitBuffer.BITMASKS[bitOffset]) & 0xFF;
            width -= bitOffset;
            bigWid -= bigOff;
        }

        if (width == bitOffset) {
            this.data[bytePos] &= ~Number(BitBuffer.BITMASKS[bitOffset]);
			this.data[bytePos] |= Number(bigVal & BitBuffer.BITMASKS[bitOffset]);
        }
        else {
            const p = bigOff - bigWid;
			this.data[bytePos] &= ~Number(BitBuffer.BITMASKS[width] << p);
			this.data[bytePos] |= Number((bigVal & BitBuffer.BITMASKS[width]) << p);
        }

        return this;
    }

    public rewind(): BitBuffer {
        this._mark = 0;
        this.bitPosition = 0;
        return this;
    }

    public makeMark(): BitBuffer {
        this._mark = this.bitPosition;
        return this;
    }

    public get mark(): number {
        return this.mark;
    }

    public reset(): BitBuffer {
        this.bitPosition = this._mark;
        return this;
    }

    public clear(): BitBuffer {
        this.data = new Uint8Array(1);
        this.bitPosition = 0;
        this.bitTotal = 0;
        this._mark = 0;
        return this;
    }

    public flip(): BitBuffer {
        this.bitTotal = this.bitPosition;
        this.bitPosition = 0;
        return this;
    }

    public skip(width: number): BitBuffer {
        this.bitPosition += width;
        this.bitTotal = this.bitPosition;
        this.ensure(this.dataLength);
        return this;
    }

    public buffer(): Uint8Array {
        return this.data;
    }

    public bytes(): Uint8Array {
        let output = new Uint8Array(this.dataLength);
        output.set(this.data.slice(0, output.length));
        return output;
    }

    public get dataLength(): number {
        return (this.bitPosition + 7) / 8;
    }

    public get remaining(): number {
        return this.bitTotal - this.bitPosition;
    }

    public get length(): number {
        return this.bitTotal;
    }

    private ensure(minimum: number) {
        if (minimum >= this.data.length) {
            this.expand(minimum);
        }
    }

    private expand(amount: number) {
        let capacity = (this.data.length + 1) * 2;
		
		if (amount > capacity) {
			capacity = amount;
		}
		
        let load = new Uint8Array(capacity);
        load.set(this.data);
		this.data = load;
    }
}