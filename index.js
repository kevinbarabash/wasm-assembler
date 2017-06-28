require('babel-register');
require('babel-polyfill');
const fs = require('fs');
const {ArgumentParser} = require('argparse');

const assembleProgram = require('./lib/assembler.js');
const parse = require('./lib/parse.js');
const print = require('./lib/print.js');

const parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'wasm-asm',
});

parser.addArgument('input');
parser.addArgument(['-o', '--output']);
parser.addArgument(['--verbose'], {action: 'storeTrue', nargs: 0});

const args = parser.parseArgs();

const code = fs.readFileSync(args.input).toString();
const program = parse(code)
console.log(JSON.stringify(program, null, 4))
const output = assembleProgram(program);

if (args.verbose) {
    print(output);
}

const bytes = new Uint8Array(output);

var buffer = new Buffer(bytes.length);
for (var i = 0; i < bytes.length; i++) {
  buffer[i] = bytes[i];
}

fs.writeFileSync(args.output, buffer, {encoding: "binary"});
