// WASM constants

export const types = {
    i32:        0x7F,
    i64:        0x7E,
    f32:        0x7D,
    f64:        0x7C,
    func:       0x60,
}

// sections must appear in this order in the output .wasm binary
export const sectionTypes = {
    functype:   0x01,
    import:     0x02,
    typeidx:    0x03,
    table:      0x04,
    memory:     0x05,
    global:     0x06,
    export:     0x07,
    start:      0x08,
    element:    0x09,
    code:       0x0A,
    data:       0x0B,
}

export const externalTypes = {
    func:       0x00,
    table:      0x01,
    memory:     0x02,
    global:     0x03,
}
