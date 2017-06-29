import {encodeUInt32, decodeUInt32} from '../leb128';

describe('encodeUInt32', () => {
    test('100 -> [100]', () => {
        expect(encodeUInt32(100)).toEqual([100])
    })
    test('128 -> [128, 1]', () => {
        expect(encodeUInt32(128)).toEqual([128, 1])
    })
    test('256 -> [128, 2]', () => {
        expect(encodeUInt32(256)).toEqual([128, 2])
    })
    test('16384 -> [128, 128, 1]', () => {
        expect(encodeUInt32(16384)).toEqual([128, 128, 1])
    })
    test('32768 -> [128, 128, 2]', () => {
        expect(encodeUInt32(32768)).toEqual([128, 128, 2])
    })
    test('1000000 -> [128, 128, 2]', () => {
        expect(encodeUInt32(1000000)).toEqual([192, 132, 61])
    })
})

describe('decodeUInt32', () => {
    test('[100] -> 100', () => {
        expect(decodeUInt32([100])).toEqual(100)
    })
    test('[128, 1] -> 128', () => {
        expect(decodeUInt32([128, 1])).toEqual(128)
    })
    test('[128, 2] -> 256', () => {
        expect(decodeUInt32([128, 2])).toEqual(256)
    })
    test('[128, 128, 1] -> 16384', () => {
        expect(decodeUInt32([128, 128, 1])).toEqual(16384)
    })
    test('[128, 128, 2] -> 32768', () => {
        expect(decodeUInt32([128, 128, 2])).toEqual(32768)
    })
    test('[128, 128, 2] -> 1000000', () => {
        expect(decodeUInt32([192, 132, 61])).toEqual(1000000)
    })
})
