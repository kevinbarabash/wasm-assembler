import instructions from './instructions.js'
import {externalTypes, sectionTypes, types} from './constants.js'

const toHex = (byte) => `0x${byte.toString(16).padStart(2, '0')}`

const sectionTypeNames = {}

for (const [key, value] of Object.entries(sectionTypes)) {
    sectionTypeNames[value] = key
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

const bytesToString = (bytes) =>
    bytes.reduce((accum, byte) => accum + String.fromCharCode(byte), '')

class Printer {
    constructor() {
        this.output = ''
    }

    print(bytes) {
        for (let i = 0; i < bytes.length; i++) {
            if (i === 0) {
                // convert buffer to array so we can map properly
                this.printLine([...bytes.slice(0, 4)], 'magic number')
                i += 3
            } else if (i === 4) {
                // convert buffer to array so we can map properly
                this.printLine([...bytes.slice(i, i + 4)], 'version number')
                i += 3
            } else {
                const byte = bytes[i]
                if (byte in sectionTypeNames) {
                    this.output +=
                        `\n; section "${sectionTypeNames[byte]}" (${byte})\n`

                    this.printLine([byte], `${sectionTypeNames[byte]}`)
                    i++
                    const length = bytes[i]
                    i++
                    this.printLine([length], 'section length')

                    const sectionBytes = bytes.slice(i, i + length)

                    if (sectionTypeNames[byte] === 'code') {
                        this.printCodeSection(sectionBytes)
                    } else if (sectionTypeNames[byte] === 'import') {
                        this.printImportExport(sectionBytes, 'import')
                    } else if (sectionTypeNames[byte] === 'export') {
                        this.printImportExport(sectionBytes, 'export')
                    } else if (sectionTypeNames[byte] === 'functype') {
                        this.printFuncTypes(sectionBytes)
                    } else if (sectionTypeNames[byte] === 'typeidx') {
                        this.printTypeIdx(sectionBytes)
                    } else {
                        this.printBytes(sectionBytes)
                    }
                    i += length - 1
                } else {
                    this.output += toHex(byte) + '\n'
                }
            }
        }

        return this.output
    }

    printLine(bytes, comment) {
        this.output +=
            bytes.map(toHex).join(' ').padEnd(32) + `; ${comment}\n`
    }

    printBytes(bytes) {
        for (const byte of bytes) {
            this.output += toHex(byte) + '\n'
        }
    }

    printCodeBlock(bytes) {
        let i = 0
        while (i < bytes.length) {
            const inst = bytes[i++]
            if ([0x0D, 0x10, 0x20, 0x21, 0x22, 0x41].includes(inst)) {
                const arg = bytes[i++]
                this.printLine([inst, arg], `${reverseInstructionMap[inst]} ${arg}`)
            } else if ([0x02, 0x04].includes(inst) && bytes[i] in reverseTypes) {
                const type = bytes[i++]
                this.printLine([inst, type], `${reverseInstructionMap[inst]} ${reverseTypes[type]}`)
            } else {
                this.printLine([inst], `${reverseInstructionMap[inst]}`)
            }
        }
    }

    printCodeSection(bytes) {
        this.printLine([bytes[0]], 'number of functions')
        let i = 1
        let body = 0
        while (i < bytes.length) {
            const size = bytes[i++]
            const localCount = bytes[i++]
            this.output += `; function body ${body++}\n`
            this.printLine([size], 'func body size')
            this.printLine([localCount], 'local count')

            // TODO: handle non-zero local count
            if (localCount > 0) {
                const typeCount = bytes[i++]
                const type = bytes[i++]
                this.printLine([typeCount], 'type count')
                this.printLine([type], `local ${reverseTypes[type]}`)
            }
            this.printCodeBlock(bytes.slice(i, i + size - 1))
            i += size - 1
        }
    }

    bytesToString(bytes) {
        bytes.reduce((accum, byte) => accum + String.fromCharCode(byte), '')
    }

    printImportExport(bytes, sectionType) {
        const importCount = bytes[0]
        this.printLine([importCount], `number of ${sectionType}s`)
        this.output += `; ${sectionType} 0\n`
        let i = 1
        let len
        let strBytes

        for (let j = 0; j < importCount; j++) {
            len = bytes[i++]
            strBytes = bytes.slice(i, i + len)
            this.printLine([len], 'string length')
            this.printLine(strBytes, `"${bytesToString(strBytes)}"`)
            i += len
            if (sectionType === 'import') {
                len = bytes[i++]
                strBytes = bytes.slice(i, i + len)
                this.printLine([len], 'string length')
                this.printLine(strBytes, `"${bytesToString(strBytes)}"`)
                i += len
            }
            const kind = bytes[i++]
            const funcIdx = bytes[i++]
            this.printLine([kind], `${sectionType} kind: ${reverseExternalTypes[kind]}`)
            this.printLine([funcIdx], 'func index')
        }
    }

    printFuncTypes(bytes) {
        let i = 0
        const funcTypeCount = bytes[i++]
        this.printLine([funcTypeCount], 'functype count')

        for (let j = 0; j < funcTypeCount; j++) {
            this.output += `; functype ${j}\n`
            // TODO: assert first byte is 0x60
            const type = bytes[i++]
            const paramTypeCount = bytes[i++]
            this.printLine([type], 'types.func')
            this.printLine([paramTypeCount], 'param type count')
            for (let k = 0; k < paramTypeCount; k++) {
                const paramType = bytes[i++]
                this.printLine([paramType], `${reverseTypes[paramType]}`)
            }
            const resultTypeCount = bytes[i++]
            this.printLine([resultTypeCount], 'result type count')
            for (let k = 0; k < resultTypeCount; k++) {
                const paramType = bytes[i++]
                this.printLine([paramType], `${reverseTypes[paramType]}`)
            }
        }
    }

    printTypeIdx(bytes) {
        let i = 0
        const count = bytes[i++]
        this.printLine([count], 'typeidx count')
        for (let j = 0; j < count; j++) {
            const funcTypeIdx = bytes[i++]
            this.printLine([funcTypeIdx], 'function type index')
        }
    }
}

const print = (bytes) => {
    const printer = new Printer()
    return printer.print(bytes)
}

module.exports = print
