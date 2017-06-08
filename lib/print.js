const instructions = require('./instructions.js');
const {types} = require('./constants.js');

const toHex = (byte) => `0x${byte.toString(16).padStart(2, '0')}`;

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

const sectionTypeNames = {};

for (const [key, value] of Object.entries(sectionTypes)) {
    sectionTypeNames[value] = key
}

const printBytes = (bytes) => {
    for (const byte of bytes) {
        console.log(toHex(byte))
    }
}

const reverseInstructionMap = {};
for (const [key, value] of Object.entries(instructions)) {
    reverseInstructionMap[value] = key
}

const reverseTypes = {};
for (const [key, value] of Object.entries(types)) {
    reverseTypes[value] = key
}

const externalTypes = {
    func:       0x00,
    table:      0x01,
    memory:     0x02,
    global:     0x03,
}

const reverseExternalTypes = {};
for (const [key, value] of Object.entries(externalTypes)) {
    reverseExternalTypes[value] = key
}

const printCodeBlock = (bytes) => {
    let i = 0;
    while (i < bytes.length) {
        const byte = bytes[i++]
        if (byte === 0x20 || byte === 0x21) {
            const arg = bytes[i++]
            console.log(`${toHex(byte)} ${toHex(arg)}`.padEnd(16) + `; ${reverseInstructionMap[byte]} ${arg}`);
        } else if (byte === 0x10 || byte === 0x41) {
            const arg = bytes[i++]
            console.log(`${toHex(byte)} ${toHex(arg)}`.padEnd(16) + `; ${reverseInstructionMap[byte]} ${arg}`);
        } else if (byte === 0x04) {
            if (bytes[i] in reverseTypes) {
                const type = bytes[i++];
                console.log(`${toHex(byte)} ${toHex(type)}`.padEnd(16) + `; ${reverseInstructionMap[byte]} ${reverseTypes[type]}`);
            } else {
                console.log(toHex(byte).padEnd(16) + `; ${reverseInstructionMap[byte]}`);
            }
        } else {
            console.log(toHex(byte).padEnd(16) + `; ${reverseInstructionMap[byte]}`);
        }
    }
}

const printCode = (bytes) => {
    console.log(toHex(bytes[0]) + '\t\tnumber of functions');
    let i = 1;
    let body = 0;
    while (i < bytes.length) {
        const size = bytes[i++];
        console.log(`; function body ${body++}`)
        console.log(toHex(size) + '\t\tfunc body size');
        const locals = bytes[i++];
        // TODO: handle non-zero local count
        console.log(toHex(locals) + '\t\tlocal count');
        if (locals > 0) {
            console.log(toHex(bytes[i++]).padEnd(16) + `type count`);
            const type = bytes[i++];
            console.log(toHex(type).padEnd(16) + `; local ${reverseTypes[type]}`);
        }
        printCodeBlock(bytes.slice(i, i + size - 1));
        i += size - 1;
    }
}

const bytesToString = (bytes) =>
    bytes.reduce((accum, byte) => accum + String.fromCharCode(byte), '');

const printImportExport = (bytes, sectionType) => {
    const importCount = bytes[0];
    console.log(toHex(importCount) + `\t\tnumber of ${sectionType}s`);
    console.log(`; ${sectionType} 0`)
    let i = 1;
    let len;
    let strBytes;

    for (let j = 0; j < importCount; j++) {
        len = bytes[i++];
        strBytes = bytes.slice(i, i + len)
        console.log(`${toHex(len)}`.padEnd(16) + '; string length');
        console.log(strBytes.map(toHex).join(' ').padEnd(16) + `; "${bytesToString(strBytes)}"`);
        i += len;
        if (sectionType === 'import') {
            len = bytes[i++];
            strBytes = bytes.slice(i, i + len)
            console.log(`${toHex(len)}`.padEnd(16) + '; string length');
            console.log(strBytes.map(toHex).join(' ').padEnd(16) + `; "${bytesToString(strBytes)}"`);
            i += len;
        }
        const kind = bytes[i++]
        console.log(`${toHex(kind)}`.padEnd(16) + `; ${sectionType} kind: ${reverseExternalTypes[kind]}`)
        const funcIdx = bytes[i++]
        console.log(`${toHex(funcIdx)}`.padEnd(16) + `; func index`)
    }
}

const printFuncTypes = (bytes) => {
    let i = 0;
    const funcTypeCount = bytes[i++];
    console.log(`${toHex(funcTypeCount)}`.padEnd(16) + '; functype count');
    for (let j = 0; j < funcTypeCount; j++) {
        console.log(`; functype ${j}`);
        // TODO: assert first byte is 0x60
        console.log(`${toHex(bytes[i++])}`.padEnd(16) + '; types.func');
        const paramTypeCount = bytes[i++];
        console.log(`${toHex(paramTypeCount)}`.padEnd(16) + '; param type count');
        for (let k = 0; k < paramTypeCount; k++) {
            const paramType = bytes[i++];
            console.log(`${toHex(paramType)}`.padEnd(16) + `; ${reverseTypes[paramType]}`);
        }
        const resultTypeCount = bytes[i++];
        console.log(`${toHex(resultTypeCount)}`.padEnd(16) + '; result type count');
        for (let k = 0; k < resultTypeCount; k++) {
            const paramType = bytes[i++];
            console.log(`${toHex(paramType)}`.padEnd(16) + `; ${reverseTypes[paramType]}`);
        }
    }
}

const printTypeIdx = (bytes) => {
    let i = 0;
    const count = bytes[i++];
    console.log(`${toHex(count)}`.padEnd(16) + '; typeidx count');
    for (let j = 0; j < count; j++) {
        console.log(`${toHex(bytes[i++])}`.padEnd(16) + '; function type index');
    }
}

const print = (output) => {
    for (let i = 0; i < output.length; i++) {
        if (i === 0) {
            console.log(
                output.slice(0, 4).map(toHex).join(' ') +
                '\t\tmagic number');
            i += 3;
        } else if (i === 4) {
            console.log(
                output.slice(4, 8).map(toHex).join(' ') +
                '\t\tversion number');
            i += 3;
        } else {
            const byte = output[i];
            if (byte in sectionTypeNames) {
                console.log(`\n; section "${sectionTypeNames[byte]}" (${byte})`)
                console.log(toHex(byte) + `\t\t${sectionTypeNames[byte]}`);
                i++;
                const length = output[i];
                i++;
                console.log(toHex(length) + '\t\tsection length');
                if (sectionTypeNames[byte] === 'code') {
                    printCode(output.slice(i, i + length));
                } else if (sectionTypeNames[byte] === 'import') {
                    printImportExport(output.slice(i, i + length), 'import');
                } else if (sectionTypeNames[byte] === 'export') {
                    printImportExport(output.slice(i, i + length), 'export');
                } else if (sectionTypeNames[byte] === 'functype') {
                    printFuncTypes(output.slice(i, i + length));
                } else if (sectionTypeNames[byte] === 'typeidx') {
                    printTypeIdx(output.slice(i, i + length));
                } else {
                    printBytes(output.slice(i, i + length));
                }
                i += length - 1;
            } else {
                console.log(toHex(byte));
            }
        }
    }
};

module.exports = print;
