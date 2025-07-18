import { decodeFromStr, encodeToStr, decode, encode } from "../src/coder"

const TestDatas = [
    null,
    undefined,
    true,
    false,
    1234,
    1.23e12,
    18446744073709552000n,
    "hello world",
    new Uint8Array([1, 2, 3, 4, 5, 6]),
    {
        number: 0,
        array: [1, 2, true, new Uint8Array([1, 2, 3, 4, 5, 6]), { bool: false }],
        undefined: undefined,
        null: null,
        false: false,
        true: true,
        bigint: 18446744073709552000n,
        object: { array: [1, 2, true, {}] }
    }
];

test("encode/decode", () => {
    for (const testdata of TestDatas) {
        const enc = encode(testdata);
        const de = decode(enc);
        expect(de).toEqual(testdata);
    }
    const enc = encode(TestDatas);
    const de = decode(enc);
    expect(de).toEqual(TestDatas);
});


test("encodeToStr/decodeFromStr", () => {
    for (const testdata of TestDatas) {
        const enc = encodeToStr(testdata);
        const de = decodeFromStr(enc);
        expect(de).toEqual(testdata);
    }
    const enc = encodeToStr(TestDatas);
    const de = decodeFromStr(enc);
    expect(de).toEqual(TestDatas);
});