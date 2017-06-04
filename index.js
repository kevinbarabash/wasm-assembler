const fs = require('fs');
const parse = require('s-expression');

const assembleProgram = require('./lib/assembler.js');
const {types, i32, get_local, end} = require('./lib/constants.js');
const {encodeUInt32} = require('./lib/leb128.js');
const process = require('./lib/process.js');

const code = fs.readFileSync('test.wast').toString();
const ast = parse(code);
const program = process(ast);
const output = assembleProgram(program);

console.log(output.length);

const buffer = new Uint8Array(output);

fs.writeFileSync('build/manual.wasm', buffer, "binary");
