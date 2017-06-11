import instructions from './instructions.js'
import {externalTypes, sectionTypes, types} from './constants.js'

const toHex = (byte) => `0x${byte.toString(16).padStart(2, '0')}`

const sectionTypeNames = {}

for (const [key, value] of Object.entries(sectionTypes)) {
    sectionTypeNames[value] = key
}

const printBytes = (bytes) => {
    for (const byte of bytes) {
        console.log(toHex(byte))
    }
}

const reverse = (map) => {
    const result = {}
    for (const [key, value] of Object.entries(map)) {
        result[value] = key
    }
    return result
}

const reverseInstructionMap = reverse(instructions)
const reverseTypes = reverse(types)
const reverseExternalTypes = reverse(externalTypes)

const printLine = (bytes, comment) => {
    console.log(bytes.map(toHex).join(' ').padEnd(32) + `; ${comment}`)
}

const printCodeBlock = (bytes) => {
    let i = 0
    while (i < bytes.length) {
        const inst = bytes[i++]
        if ([0x10, 0x20, 0x21, 0x41].includes(inst)) {
            const arg = bytes[i++]
            printLine([inst, arg], `${reverseInstructionMap[inst]} ${arg}`)
        } else if ([0x02, 0x04].includes(inst) && bytes[i] in reverseTypes) {
            const type = bytes[i++]
            printLine([inst, type], `${reverseInstructionMap[inst]} ${reverseTypes[type]}`)
        } else {
            printLine([inst], `${reverseInstructionMap[inst]}`)
        }
    }
}

const printCodeSection = (bytes) => {
    printLine([bytes[0]], 'number of functions')
    let i = 1
    let body = 0
    while (i < bytes.length) {
        const size = bytes[i++]
        const localCount = bytes[i++]
        console.log(`; function body ${body++}`)
        printLine([size], 'func body size')
        printLine([localCount], 'local count')

        // TODO: handle non-zero local count
        if (localCount > 0) {
            const typeCount = bytes[i++]
            const type = bytes[i++]
            printLine([typeCount], 'type count')
            printLine([type], `local ${reverseTypes[type]}`)
        }
        printCodeBlock(bytes.slice(i, i + size - 1))
        i += size - 1
    }
}

const bytesToString = (bytes) =>
    bytes.reduce((accum, byte) => accum + String.fromCharCode(byte), '')

const printImportExport = (bytes, sectionType) => {
    const importCount = bytes[0]
    printLine([importCount], `number of ${sectionType}s`)
    console.log(`; ${sectionType} 0`)
    let i = 1
    let len
    let strBytes

    for (let j = 0; j < importCount; j++) {
        len = bytes[i++]
        strBytes = bytes.slice(i, i + len)
        printLine([len], 'string length')
        printLine(strBytes, `"${bytesToString(strBytes)}"`)
        i += len
        if (sectionType === 'import') {
            len = bytes[i++]
            strBytes = bytes.slice(i, i + len)
            printLine([len], 'string length')
            printLine(strBytes, `"${bytesToString(strBytes)}"`)
            i += len
        }
        const kind = bytes[i++]
        const funcIdx = bytes[i++]
        printLine([kind], `${sectionType} kind: ${reverseExternalTypes[kind]}`)
        printLine([funcIdx], 'func index')
    }
}

const printFuncTypes = (bytes) => {
    let i = 0
    const funcTypeCount = bytes[i++]
    printLine([funcTypeCount], 'functype count')

    for (let j = 0; j < funcTypeCount; j++) {
        console.log(`; functype ${j}`)
        // TODO: assert first byte is 0x60
        const type = bytes[i++]
        const paramTypeCount = bytes[i++]
        printLine([type], 'types.func')
        printLine([paramTypeCount], 'param type count')
        for (let k = 0; k < paramTypeCount; k++) {
            const paramType = bytes[i++]
            printLine([paramType], `${reverseTypes[paramType]}`)
        }
        const resultTypeCount = bytes[i++]
        printLine([resultTypeCount], 'result type count')
        for (let k = 0; k < resultTypeCount; k++) {
            const paramType = bytes[i++]
            printLine([paramType], `${reverseTypes[paramType]}`)
        }
    }
}

const printTypeIdx = (bytes) => {
    let i = 0
    const count = bytes[i++]
    printLine([count], 'typeidx count')
    for (let j = 0; j < count; j++) {
        const funcTypeIdx = bytes[i++]
        printLine([funcTypeIdx], 'function type index')
    }
}

const print = (output) => {
    for (let i = 0; i < output.length; i++) {
        if (i === 0) {
            printLine(output.slice(0, 4), 'magic number')
            i += 3
        } else if (i === 4) {
            printLine(output.slice(0, 4), 'version number')
            i += 3
        } else {
            const byte = output[i]
            if (byte in sectionTypeNames) {
                console.log(`\n; section "${sectionTypeNames[byte]}" (${byte})`)
                printLine([byte], `${sectionTypeNames[byte]}`)
                i++
                const length = output[i]
                i++
                printLine([length], 'section length')

                const sectionBytes = output.slice(i, i + length)

                if (sectionTypeNames[byte] === 'code') {
                    printCodeSection(sectionBytes)
                } else if (sectionTypeNames[byte] === 'import') {
                    printImportExport(sectionBytes, 'import')
                } else if (sectionTypeNames[byte] === 'export') {
                    printImportExport(sectionBytes, 'export')
                } else if (sectionTypeNames[byte] === 'functype') {
                    printFuncTypes(sectionBytes)
                } else if (sectionTypeNames[byte] === 'typeidx') {
                    printTypeIdx(sectionBytes)
                } else {
                    printBytes(sectionBytes)
                }
                i += length - 1
            } else {
                console.log(toHex(byte))
            }
        }
    }
}

module.exports = print
