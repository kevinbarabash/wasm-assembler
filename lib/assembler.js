const {encodeUInt32} = require('./leb128.js');

// sections must appear in this order in the output .wasm binary
const sectionTypes = {
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

const externalTypes = {
    func:       0x00,
    table:      0x01,
    memory:     0x02,
    global:     0x03,
}


// TODO: handle other types
const assembleFuncType = (type) => {
    return [
        0x60,   // types.func
        ...encodeUInt32(type.params.length),
        ...type.params,
        ...encodeUInt32(type.result.length),
        ...type.result,
    ];
}

const assembleCodeBody = (body) => [...encodeUInt32(body.length), ...body];

const assembleExport = (exp) => {
    return [
        ...encodeUInt32(exp.name.length),
        ...exp.name.split('').map(c => c.charCodeAt(0)),
        externalTypes[exp.type],
        ...encodeUInt32(exp.index),
    ];
}

const assembleTypeIndex = (funcIndex) => [...encodeUInt32(funcIndex)];

const assembleSection = (section) => {
    const assembleChild = {
        'functype': assembleFuncType,
        'typeidx': assembleTypeIndex,
        'code': assembleCodeBody,
        'export': assembleExport,
    }[section.type];

    const concatedChildren = section.children.reduce(
        (accum, child) => accum.concat(assembleChild(child)), []);

    const numberOfChildren = encodeUInt32(section.children.length);

    return [
        sectionTypes[section.type],
        ...encodeUInt32(numberOfChildren.length + concatedChildren.length),
        ...numberOfChildren,
        ...concatedChildren,
    ];
}

const assembleProgram = (program) => {
    const concatedSections = program.reduce(
        (accum, section) => accum.concat(assembleSection(section)), []);

    return [
        0x00, 0x61, 0x73, 0x6D,     // magic number
        0x01, 0x00, 0x00, 0x00,     // version = 1, little endian
        ...concatedSections,
    ];
}

module.exports = assembleProgram;
