export const encodeUInt32 = (value) => {
    const result = []
    do {
        let byte = value & 0b01111111
        value = value >> 7
        if (value !== 0) {
            byte = byte | 0b10000000
        }
        result.push(byte)
    } while (value !== 0)

    return result
}

// TODO: add decodeUInt32 function
