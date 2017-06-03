// WASM constants

module.exports = {
    types: {
        i32:        0x7F,
        i64:        0x7E,
        f32:        0x7D,
        f64:        0x7C,
        func:       0x60,
    },
    i32: {
        const:      0x41,
        add:        0x6A,
        sub:        0x6B,
        mul:        0x6C,
        div_s:      0x6E,
        div_u:      0x6D,
    },
    get_local:      0x20,
    set_local:      0x21,
    tee_local:      0x22,
    get_global:     0x23,
    set_global:     0x24,
    end:            0x0B,
}
