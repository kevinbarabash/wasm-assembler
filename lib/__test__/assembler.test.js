import fs from 'fs'
import path from 'path'

import parse from '../parse'
import assemble from '../assembler'

describe('assembler', () => {
    const files = fs.readdirSync(path.join(__dirname, 'testfiles'));

    files.filter(name => /\.wast$/.test(name))
        .map(inName =>
            test(`${inName}`, () => {
                const outName = inName.replace(/\.wast$/, '.wasm')

                const code = fs.readFileSync(
                    path.join(__dirname, 'testfiles', inName)
                ).toString()

                const output = assemble(parse(code))

                const bytes = new Uint8Array(output);

                var buffer = new Buffer(bytes.length);
                    for (var i = 0; i < bytes.length; i++) {
                    buffer[i] = bytes[i];
                }

                const expected = fs.readFileSync(
                    path.join(__dirname, 'testfiles', outName)
                )
                expect(buffer).toEqual(expected)
            }
    ))
})
