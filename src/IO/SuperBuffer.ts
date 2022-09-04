import { bytesToArray, toBinString, toHexString, uncomplement } from "../Core/functions.js";

export class SuperBuffer {
    private buffer: Uint8Array;
    private idx: number;

    constructor(buffer: Uint8Array) {
        // you could use 16, 32, 64 etc but it would not be effective
        //   because the methods only will end up writing a maximum value
        //   of a byte per element (clamped)
        this.buffer = buffer;
        this.idx = 0;
    }

    public putByte(value: number): number {
        if (value > 0xFF) {
            console.error('Value ' + value + " > " + 0xFF);
        }

        return this.buffer[this.idx++] = (value & 0xFF);
    }

    public putString(value: string, terminator: number = 10) {
        for (let i = 0; i < value.length; i++) {
            this.putByte(value.charCodeAt(i));
        }
        
        this.putByte(terminator);
    }

    public byte(): number {
        return uncomplement(this.ubyte(), 8);
    }

    public ubyte(): number {
        return this.buffer[this.idx++];
    }

    public ubytebigint(): bigint {
        return BigInt(this.ubyte()) & 0xFFn;
    }

    public data(base: number = 2, onlyReadBytes: boolean = false): String[] {
        let fromBuffer = this.buffer;

        if (onlyReadBytes) {
            fromBuffer = fromBuffer.slice(0, this.index());
        }

        return bytesToArray(fromBuffer, base);
    }

    public toString(base: number = 2, onlyReadBytes: boolean = false): string {
        let fromBuffer = this.buffer;

        if (onlyReadBytes) {
            fromBuffer = fromBuffer.slice(0, this.index());
        }

        if (base == 16) {
            return toHexString(fromBuffer);
        }
        else if (base == 2) {
            return toBinString(fromBuffer);
        }

        return fromBuffer.toString();
    }

    public index(): number { 
        return this.idx;
    }

    public remaining(): number {
        return this.size() - this.index();
    }

    public seek(index: number) {
        this.idx = index;
    }

    public size(): number {
        return this.buffer.length;
    }

    public ubuffer(): Uint8Array {
        return this.buffer;
    }

    public copy(length: number, start: number = null, affectIndex: boolean = false) : Uint8Array {
        if (start === undefined || start === null) {
            start = this.index();
        }

        const temp = new Uint8Array(length);

        for (let i = start, d = 0; i < start + length; i++, d++) {
            temp[d] = this.buffer[i];
        }

        if (affectIndex) {
            this.seek(start + length);
        }

        return temp;
    }

    public copyFromIndex() {
        return this.copy(this.size() - this.index());
    }

    public copyToIndex() {
        return this.copy(this.index(), 0);
    }

    public write(temp: Uint8Array, reverse: boolean = false, transform: DataTransformation = DataTransformation.NONE) {
        if (reverse == false && transform == DataTransformation.NONE) {
            this.buffer.set(temp, this.idx);
            this.idx += temp.length;
            return temp;
        }

        for (let i = 0; i < temp.length; i++) {
            const srcIdx = reverse ? temp.length - 1 - i : i;
            this.put(temp[srcIdx], 1, DataOrder.BIG, transform);
        }
        
        return temp;
    }
    
    // put a byte (number) or bytes (bigint), return the inserted value (number or bigint)
    public put(value: number | bigint, size: number = 1, order: DataOrder = DataOrder.BIG, transform: DataTransformation = DataTransformation.NONE): bigint {
        value = BigInt(value);
        value = SuperBuffer.transform(value, transform);
        let count = BigInt(size);

        switch (order) {
            case DataOrder.BIG:
                for (let i = count - 1n; i >= 0n; i--) {
                    this.putByte(Number((value >> i * 8n) & 0xFFn));
                }
                break;
            case DataOrder.LITTLE:
                for (let i = 0n; i < count; i++) {
                    this.putByte(Number((value >> i * 8n) & 0xFFn));
                }
                break;
            // below only supports integers in this endian
            case DataOrder.MIDDLE_BIG:
                this.putByte(Number(value >> 8n) & 0xFF);
                this.putByte(Number(value) & 0xFF);
                this.putByte(Number(value >> 24n) & 0xFF);
                this.putByte(Number(value >> 16n) & 0xFF);
                break;
            case DataOrder.MIDDLE_LITTLE:
                this.putByte(Number(value >> 16n) & 0xFF);
                this.putByte(Number(value >> 24n) & 0xFF);
                this.putByte(Number(value) & 0xFF);
                this.putByte(Number(value >> 8n) & 0xFF);
                break;
        }

        return value;
    }

    public peek(size: number = 1, signed: boolean = true, order: DataOrder = DataOrder.BIG, transform: DataTransformation = DataTransformation.NONE): bigint {
        const index = this.index();
        const val = this.get(size, signed, order, transform);
        this.seek(index);
        return val;
    }

    // returns a signed integer
    public get(size: number = 1, signed: boolean = true, order: DataOrder = DataOrder.BIG, transform: DataTransformation = DataTransformation.NONE): bigint {
        let count = BigInt(size);
        let value = 0n;
        let clear = 0n;

        switch (order) {
            case DataOrder.BIG:
                for (let i = count - 1n; i >= 0n; i--) {
                    value |= this.ubytebigint() << i * 8n;
                    clear |= 0xFFn << i * 8n;
                }
                break;
            case DataOrder.LITTLE:
                for (let i = 0n; i < count; i++) {
                    value |= this.ubytebigint() << i * 8n;
                    clear |= 0xFFn << i * 8n;
                }
                break;
            // below only supports integers in this endian
            case DataOrder.MIDDLE_BIG:
                value |= this.ubytebigint() << 8n;
                value |= this.ubytebigint();
                value |= this.ubytebigint() << 24n;
                value |= this.ubytebigint() << 16n;
                clear |= 0xFFFFFFFFn;
                break;
            case DataOrder.MIDDLE_LITTLE:
                value |= this.ubytebigint() << 16n;
                value |= this.ubytebigint() << 24n;
                value |= this.ubytebigint();
                value |= this.ubytebigint() << 8n;
                clear |= 0xFFFFFFFFn;
                break;
        }

        value = SuperBuffer.transform(value, transform);

        // if signed flag is set to true
        // if sign bit is present at the least most bit according to data length
		if (signed && (value >> ((count * 8n) - 1n) & 1n) == 1n) {
			// set all values to 1 to bits outside our data size
			// or them to the sign bits
			value = (~clear) | value;
		}

        return value;
    }

    public read(length: number, reverse: boolean = false, signed: boolean = true, transform: DataTransformation = DataTransformation.NONE): Uint8Array {
        const temp = new Uint8Array(length);
        const test = 0n;

        for (let i = 0; i < temp.length; i++) {
            const dstIdx = reverse ? temp.length - 1 - i : i;
            temp[dstIdx] = Number(this.get(1, true, DataOrder.BIG, transform));
        }
        
        return temp;
    }

    public bool(): boolean {
        return this.ubyte() > 0;
    }

    public string(terminator: number = 10): string {
        let off = this.idx;
        while (this.ubyte() !== terminator);
        const strData = this.copy(this.idx - off - 1, off);
        return String.fromCharCode.apply(null, strData);
    }

    public static transform(value: bigint, transform: DataTransformation): bigint {
        let newValue = value;
        let byteIndex = 0n; // index to apply byte transformation
        let v = (newValue >> byteIndex * 8n) & 0xFFn; // byte value
        newValue &= ~(0xFFn << byteIndex * 8n); // clear bits of extracted byte
        
        // apply transformation to value
        switch (transform) {
            case DataTransformation.ADD:
                v += 128n;
                break;
            case DataTransformation.SUBTRACT:
                v = 128n - v;
                break;
            case DataTransformation.NEGATE:
                v = -v;
                break;
            case DataTransformation.NONE:
                break;
        }

        newValue |= v & 0xFFn << byteIndex * 8n; // copy back
        return newValue;
    }
}

export enum DataTransformation {
    NONE,
    ADD,
    NEGATE,
    SUBTRACT
}

export enum DataOrder {
    BIG,
    LITTLE,
    MIDDLE_BIG,
    MIDDLE_LITTLE
}

export enum DataSize {
    BYTE = 1,
    SHORT = 2,
    TRIPLE = 3,
    INT = 4,
    LONG = 8
}