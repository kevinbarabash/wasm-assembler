export const encodeUInt32 = (value) => {
    const bytes = []
    do {
        let byte = value & 0b01111111
        value = value >> 7
        if (value !== 0) {
            byte = byte | 0b10000000
        }
        bytes.push(byte)
    } while (value !== 0)

    return bytes
}

export const decodeUInt32 = (bytes) => {
    let result = 0
    let shift = 0

    for (let i = 0; i < bytes.length; i++) {
        const byte = bytes[i]

        result |= (byte & 0b01111111) << shift
        if (byte & 0b10000000 == 0) {
            break
        }
        shift += 7
    }

    return result
}
