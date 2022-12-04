import { toBinString } from "../../src/Core/functions";
import BitBuffer from "../../src/IO/BitBuffer";

function assert(input: any, message?: string): asserts input {
    if (!input) throw new Error(message ?? 'FAILED ASSERTION');
}

function basicReadTest() {
    const b = new BitBuffer();
    b.put(true);
    b.flip();
    assert(b.get() == true, 'true bit not true');
}

function basicWriteTest() {
    const test: Array<[boolean | number | bigint, number]> = [
        [ true, 1 ],
        [ 3n, 2 ],
        [ 0n, 2 ],
        [ true, 1 ],
        [ true, 1 ],
        [ 0x20n, 7 ],
        [ 0x20n, 7 ],
        [ 0n, 8 ],
        [ 2047n, 11 ],
    ];
    const b = new BitBuffer();

    // write values
    for (let i = 0; i < test.length; i++) {
        b.put(test[i][0], test[i][1]);
    }

    //console.log(b.length);
    //console.log(b.toString());
    b.flip();
    console.log(toBinString(b.buffer()));

    // read values
    for (let i = 0; i < test.length; i++) {
        const retVal = b.get(test[i][1]);
        assert(test[i][0] == retVal, "FAILED[" + i + "] " + test[i][0] + ' == ' + retVal)
    }
}

test('oogabooga3', () => {
    console.log('basicReadTest');
    basicReadTest();

    console.log('basicWriteTest');
    basicWriteTest();
});
