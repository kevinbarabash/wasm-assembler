const fs = require('fs');

const assembleProgram = require('./lib/assembler.js');
const parse = require('./lib/parse.js');

const code = fs.readFileSync('test.wast').toString();
const program = parse(code);
const output = assembleProgram(program);

const buffer = new Uint8Array(output);
fs.writeFileSync('build/manual.wasm', buffer, "binary");
