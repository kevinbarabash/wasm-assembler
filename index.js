const fs = require('fs');
const {ArgumentParser} = require('argparse');

const assembleProgram = require('./lib/assembler.js');
const parse = require('./lib/parse.js');


const parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'wasm-asm',
});

parser.addArgument('input');
parser.addArgument(['-o', '--output']);

const args = parser.parseArgs();

const code = fs.readFileSync(args.input).toString();
const program = parse(code);
const output = assembleProgram(program);

const buffer = new Uint8Array(output);
fs.writeFileSync(args.output, buffer, "binary");
