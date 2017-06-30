require('babel-register');
require('babel-polyfill');
const fs = require('fs');
const {ArgumentParser} = require('argparse');

const {assemble, parse, print} = require('./lib/index.js');

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
const output = assemble(program);

if (args.verbose) {
    print(output);
}

fs.writeFileSync(args.output, output, {encoding: "binary"});
