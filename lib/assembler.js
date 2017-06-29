import {encodeUInt32} from './leb128'
import {sectionTypes, externalTypes} from './constants'
import instructions from './instructions'

// TODO: handle other types
const assembleFuncType = (type) => {
    return [
        0x60,   // types.func
        ...encodeUInt32(type.params.length),
        ...type.params,
        ...encodeUInt32(type.result.length),
        ...type.result,
    ]
}

const assembleCodeBody = (body) => [...encodeUInt32(body.length), ...body]

const assembleExport = (exp) => {
    return [
        ...encodeUInt32(exp.name.length),
        ...exp.name.split('').map(c => c.charCodeAt(0)),
        externalTypes[exp.type],
        ...encodeUInt32(exp.index),
    ]
}

const assembleImport = (exp) => {
    if (exp.type === 'func') {
        return [
            ...encodeUInt32(exp.name1.length),
            ...exp.name1.split('').map(c => c.charCodeAt(0)),
            ...encodeUInt32(exp.name2.length),
            ...exp.name2.split('').map(c => c.charCodeAt(0)),
            externalTypes[exp.type],
            ...encodeUInt32(exp.index),
        ]
    } else if (exp.type === 'memory') {
        return [
            ...encodeUInt32(exp.name1.length),
            ...exp.name1.split('').map(c => c.charCodeAt(0)),
            ...encodeUInt32(exp.name2.length),
            ...exp.name2.split('').map(c => c.charCodeAt(0)),
            externalTypes[exp.type],
            0,   // limits: flags
            ...encodeUInt32(exp.min),
        ]
    } else {

    }
}

const assembleTypeIndex = (funcIndex) => [...encodeUInt32(funcIndex)]

const assembleData = (exp) => {
    return [
        ...encodeUInt32(exp.index),
        ...exp.offset,
        instructions.end,
        ...encodeUInt32(exp.data.length),
        ...exp.data,
    ]
}

const assembleSection = (section, type) => {
    if (type === 'start') {
        const name = section[0].name;
        const funcIndex = encodeUInt32(section[0].index)
        return [
            sectionTypes.start,
            ...encodeUInt32(funcIndex.length),
            ...funcIndex,
        ]
    }

    const assembleChild = {
        'functype': assembleFuncType,
        'typeidx': assembleTypeIndex,
        'code': assembleCodeBody,
        'export': assembleExport,
        'import': assembleImport,
        'data': assembleData,
    }[type]

    const concatedChildren = section.reduce(
        (accum, child) => accum.concat(assembleChild(child)), [])

    const numberOfChildren = encodeUInt32(section.length)

    return [
        sectionTypes[type],
        ...encodeUInt32(numberOfChildren.length + concatedChildren.length),
        ...numberOfChildren,
        ...concatedChildren,
    ]
}

const assembleProgram = (program) => {
    const concatedSections = Object.entries(program).reduce(
        (accum, [type, section]) =>
            accum.concat(assembleSection(section, type)), [])

    const bytes = new Uint8Array([
        0x00, 0x61, 0x73, 0x6D,     // magic number
        0x01, 0x00, 0x00, 0x00,     // version = 1, little endian
        ...concatedSections,
    ])

    var buffer = new Buffer(bytes.length);
    for (var i = 0; i < bytes.length; i++) {
        buffer[i] = bytes[i];
    }

    return buffer
}

module.exports = assembleProgram
