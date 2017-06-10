import {encodeUInt32} from './leb128'
import {sectionTypes, externalTypes} from './constants'


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
    return [
        ...encodeUInt32(exp.name1.length),
        ...exp.name1.split('').map(c => c.charCodeAt(0)),
        ...encodeUInt32(exp.name2.length),
        ...exp.name2.split('').map(c => c.charCodeAt(0)),
        externalTypes[exp.type],
        ...encodeUInt32(exp.index),
    ]
}

const assembleTypeIndex = (funcIndex) => [...encodeUInt32(funcIndex)]

const assembleSection = (section, type) => {
    const assembleChild = {
        'functype': assembleFuncType,
        'typeidx': assembleTypeIndex,
        'code': assembleCodeBody,
        'export': assembleExport,
        'import': assembleImport,
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

    return [
        0x00, 0x61, 0x73, 0x6D,     // magic number
        0x01, 0x00, 0x00, 0x00,     // version = 1, little endian
        ...concatedSections,
    ]
}

module.exports = assembleProgram
