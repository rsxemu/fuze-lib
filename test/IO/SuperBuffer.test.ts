import SuperBuffer, { DataOrder, DataTransformation, LineTerminator } from "../../src/IO/SuperBuffer"

function assert(input: any, message?: string): asserts input {
    if (!input) throw new Error(message ?? 'FAILED ASSERTION');
}

function basicReadTest() {
    let test = new Uint8Array([ 14, 0 ]);
    let buff = new SuperBuffer(test);
    
    assert(buff.get() === 14n, '14n');
    assert(buff.get() == 0n, '0n');
}

function basicWriteTest() {
    let buff = new SuperBuffer(new Uint8Array(16));
    const orders = [
        DataOrder.BIG,
        DataOrder.LITTLE,
        // the mid-endians need to just be size 4, separate test case.
        // DataOrder.MIDDLE_BIG,
        // DataOrder.MIDDLE_LITTLE
    ];
    const transforms = [
        DataTransformation.NONE,
        DataTransformation.ADD,
        DataTransformation.SUBTRACT,
        DataTransformation.NEGATE
    ];

    for (const order of orders) {
        for (const transform of transforms) {
            for (let octet = 1n, val = 0xFFn; octet < 16n; val |= 0xFFn << octet++ * 8n) {
                // test 0
                testSuccessfulWrite(buff, 0, Number(octet), true, order, transform);
                buff.seek(0);

                // test -1
                testSuccessfulWrite(buff, -1, Number(octet), true, order, transform);
                buff.seek(0);

                // test unsigned
                testSuccessfulWrite(buff, val, Number(octet), false, order, transform);
                buff.seek(0);

                // test signed max value for width of type
                // (2 ^ 31) - 1
                let maxSignedValue = val & ~(1n << (octet * 8n) - 1n);
                testSuccessfulWrite(buff, maxSignedValue, Number(octet), true, order, transform);
                buff.seek(0);

                // test minimum signed value for width of type
                let minSignedValue = -(1n << (octet * 8n) - 1n);
                testSuccessfulWrite(buff, minSignedValue, Number(octet), true, order, transform);
                buff.seek(0);
            }
        }
    }

    // testSuccessfulWrite(buff, 0xFFFF, 2);
    // testSuccessfulWrite(buff, 0xFFFFFF, 3);
    // testSuccessfulWrite(buff, 0xFFFFFFFF, 4);
    // testSuccessfulWrite(buff, 0xFFFFFFFFFF, 5);
    // testSuccessfulWrite(buff, 0xFFFFFFFFFFFF, 6);
    //console.log(buff.toString());
    //console.log(buff.toString(16));
}

// validation that the put succeeded in the same type being read
function testSuccessfulWrite(sb: SuperBuffer, value: number | bigint, size: number = 1, signed: boolean = false, order: DataOrder = DataOrder.BIG, transform: DataTransformation = DataTransformation.NONE) {
    let indexWriteStart = sb.index(); // get the position we start writing to
    let putRetVal = sb.put(value, size, order, transform); // write the value
    let indexWriteEnd = sb.index(); // get the position we stopped writing
    sb.seek(indexWriteStart); // go to the point at which we started writing
    
    let readTransform = transform;

    let readRetVal = sb.get(size, signed, order, readTransform); // attempt to read the written value
    
    //console.log(DataOrder[order], DataTransformation[transform], indexWriteStart, '->', indexWriteEnd, "\t", value, "\t", putRetVal, "\t", readRetVal);

    assert(readRetVal == value, 'loose value inequality');
    assert(indexWriteEnd - indexWriteStart == size, 'width of data type mismatched');
}

function testTransforms() {
    const value = 180n;

    const afterAdd = SuperBuffer.transform(value, DataTransformation.ADD);
    const validateSubtract = SuperBuffer.transform(afterAdd, DataTransformation.ADD);
    assert(value === 180n, 'Value is 180n');
    assert(afterAdd === 52n, 'After is 52n');
    assert(validateSubtract === 180n, 'Reverse is 180n');

    const afterSubtract = SuperBuffer.transform(value, DataTransformation.SUBTRACT);
    const validateAdd = SuperBuffer.transform(afterSubtract, DataTransformation.SUBTRACT);
    assert(value === 180n, 'Value is 180n');
    assert(afterSubtract === 204n, 'After is 204n');
    assert(validateAdd === 180n, 'Reverse is 180n');

    const afterNegate = SuperBuffer.transform(value, DataTransformation.NEGATE);
    const validateNegate = SuperBuffer.transform(afterNegate, DataTransformation.NEGATE);
    assert(value === 180n, 'Value is 180n');
    assert(afterNegate === 76n, 'After is 76n');
    assert(validateNegate === 180n, 'Reverse is 180n');
}

test('Transforms', testTransforms);
test('Basic Read', basicReadTest);
test('Basic Write', basicWriteTest);

test('String LF', () => {
    const test = 'oogabooga';
    const sb = new SuperBuffer(new Uint8Array(64));
    sb.putString(test);
    sb.seek(0);
    const testAgainst = sb.string();
    assert(test == testAgainst, 'Test strings match');
})

test('Strings NULL', () => {
    const strs = ['hello', 'world'];
    const sb = new SuperBuffer(new Uint8Array(64));
    strs.forEach(str => sb.putString(str, LineTerminator.NULL));
    sb.seek(0);
    strs.forEach(str => assert(str == sb.string(LineTerminator.NULL), 'Test ' + str + ' matches'));
})

test('Strings LF No Terminator', () => {
    const strs = ['hello', 'world'];
    const sb = new SuperBuffer(new Uint8Array(16));
    strs.forEach(str => sb.putString(str));
    sb.seek(0);
    strs.forEach(str => assert(str == sb.string(), 'Test ' + str + ' matches'));

    sb.seek(sb.index() - 1);
    sb.put(0); // bad terminator
    sb.seek(0);
    
    const sm = sb.strings(2);
    strs.forEach(str => {
        const n = sm.next();
        const cmp = n.value;
        assert(str == cmp || (str == strs[strs.length - 1] && cmp === undefined), 'Test ' + str + ' matches')
    });
})

test('Strings LF Parsed with Safe Terminator', () => {
    const strs = ['hello', 'world'];
    const sb = new SuperBuffer(new Uint8Array(16));
    strs.forEach(str => sb.putString(str));
    sb.seek(0);
    strs.forEach(str => assert(str == sb.string(), 'Test ' + str + ' matches'));

    sb.seek(sb.index() - 1);
    sb.put(0); // bad terminator
    sb.seek(0);
    
    const sm = sb.strings(2, LineTerminator.LF, true);
    strs.forEach(str => {
        const n = sm.next();
        const cmp: string = (<string>n.value ?? '').trim();
        assert(str == cmp, 'Test ' + str + ' matches');
    });
})