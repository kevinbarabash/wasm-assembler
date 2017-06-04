module.exports = {
    // control

    'unreachable':  0x00,
    'nop':          0x01,
    'block':        0x02,
    'loop':         0x03,
    'if':           0x04,
    'else':         0x05,
    'end':          0x0B,
    'br':           0x0C,
    'br_if':        0x0D,
    'br_table':     0x0E,
    'return':       0x0F,
    'call':         0x10,
    'call_indirect':0x11,

    // parametric

    'drop':         0x1A,
    'select':       0x1B,

    // variable

    'get_local':    0x20,
    'set_local':    0x21,
    'tee_local':    0x22,
    'get_global':   0x23,
    'set_global':   0x24,

    // TODO: memory instructions

    // numeric

    'i32.const':    0x41,
    'i64.const':    0x42,
    'f32.const':    0x43,
    'f64.const':    0x44,

    'i32.eqz':      0x45,
    'i32.eq':       0x46,
    'i32.ne':       0x47,
    'i32.lt_s':     0x48,
    'i32.lt_u':     0x49,
    'i32.gt_s':     0x4A,
    'i32.gt_u':     0x4B,
    'i32.le_s':     0x4C,
    'i32.le_u':     0x4D,
    'i32.ge_s':     0x4E,
    'i32.ge_u':     0x4F,

    // TODO: i64 comparison operators
    // TODO: f32 comparison operators
    // TODO: f64 comparison operators

    'i32.clz':      0x67,
    'i32.ctz':      0x68,
    'i32.popcnt':   0x69,
    'i32.add':      0x6A,
    'i32.sub':      0x6B,
    'i32.mul':      0x6C,
    'i32.div_s':    0x6D,
    'i32.div_u':    0x6E,
    'i32.rem_s':    0x6F,
    'i32.rem_u':    0x70,
    'i32.and':      0x71,
    'i32.or':       0x72,
    'i32.xor':      0x73,
    'i32.shl':      0x74,
    'i32.shl_s':    0x75,
    'i32.shl_u':    0x76,
    'i32.rotl':     0x77,
    'i32.rotr':     0x78,

    // TOOD: i64 arithmetic + logic operators
    // TOOD: f32 arithmetic + logic operators
    // TOOD: f64 arithmetic + logic operators

};
