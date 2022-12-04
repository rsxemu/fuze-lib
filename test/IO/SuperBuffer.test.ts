import SuperBuffer, { DataOrder, DataTransformation } from "../../src/IO/SuperBuffer"

function assert(input: any, message?: string): asserts input {
    if (!input) throw new Error(message ?? 'FAILED ASSERTION');
}

function basicReadTest() {
    let test = new Uint8Array([ 14, 0 ]);
    let buff = new SuperBuffer(test);
    
    console.log(buff.get());
    console.log(buff.get());
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
    
    console.log(DataOrder[order], DataTransformation[transform], indexWriteStart, '->', indexWriteEnd, "\t", value, "\t", putRetVal, "\t", readRetVal);

    assert(readRetVal == value, 'loose value inequality');
    assert(indexWriteEnd - indexWriteStart == size, 'width of data type mismatched');
}

function testTransforms() {
    const value = 180n;

    const afterAdd = SuperBuffer.transform(value, DataTransformation.ADD);
    const validateSubtract = SuperBuffer.transform(afterAdd, DataTransformation.ADD);
    console.log('value:', value, 'after:', afterAdd, 'reverse:', validateSubtract);

    const afterSubtract = SuperBuffer.transform(value, DataTransformation.SUBTRACT);
    const validateAdd = SuperBuffer.transform(afterSubtract, DataTransformation.SUBTRACT);
    console.log('value:', value, 'after:', afterSubtract, 'reverse:', validateAdd);

    const afterNegate = SuperBuffer.transform(value, DataTransformation.NEGATE);
    const validateNegate = SuperBuffer.transform(afterNegate, DataTransformation.NEGATE);
    console.log('value:', value, 'after:', afterNegate, 'reverse:', validateNegate);
}

test('oogabooga', () => {
    console.log('testTransforms');
    testTransforms();

    console.log('basicReadTest');
    basicReadTest();

    console.log('basicWriteTest');
    basicWriteTest();
});
