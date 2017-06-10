import assert from 'assert'

import {encodeUInt32, decodeUInt32} from '../leb128';

describe('encodeUInt32', () => {
    it('100 -> [100]', () => {
        assert.deepEqual(encodeUInt32(100), [100])
    })
    it('128 -> [128, 1]', () => {
        assert.deepEqual(encodeUInt32(128), [128, 1])
    })
    it('256 -> [128, 2]', () => {
        assert.deepEqual(encodeUInt32(256), [128, 2])
    })
    it('16384 -> [128, 128, 1]', () => {
        assert.deepEqual(encodeUInt32(16384), [128, 128, 1])
    })
    it('32768 -> [128, 128, 2]', () => {
        assert.deepEqual(encodeUInt32(32768), [128, 128, 2])
    })
    it('1000000 -> [128, 128, 2]', () => {
        assert.deepEqual(encodeUInt32(1000000), [192, 132, 61])
    })
})

describe('decodeUInt32', () => {
    it('[100] -> 100', () => {
        assert.equal(decodeUInt32([100]), 100)
    })
    it('[128, 1] -> 128', () => {
        assert.equal(decodeUInt32([128, 1]), 128)
    })
    it('[128, 2] -> 256', () => {
        assert.equal(decodeUInt32([128, 2]), 256)
    })
    it('[128, 128, 1] -> 16384', () => {
        assert.equal(decodeUInt32([128, 128, 1]), 16384)
    })
    it('[128, 128, 2] -> 32768', () => {
        assert.equal(decodeUInt32([128, 128, 2]), 32768)
    })
    it('[128, 128, 2] -> 1000000', () => {
        assert.equal(decodeUInt32([192, 132, 61]), 1000000)
    })
})
