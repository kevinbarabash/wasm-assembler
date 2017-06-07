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
                console.log(`; section "${sectionTypeNames[byte]}" (${byte})`)
                console.log(toHex(byte) + `\t\t${sectionTypeNames[byte]}`);
                i++;
                const length = output[i];
                i++;
                console.log(toHex(length) + '\t\tsection length');
                if (sectionTypeNames[byte] === 'code') {
                    printCode(output.slice(i, i + length));
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
