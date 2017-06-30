import fs from 'fs'
import path from 'path'

import parse from '../parse'
import assemble from '../assemble'

describe('assembler', () => {
    const files = fs.readdirSync(path.join(__dirname, 'testfiles'));

    files.filter(name => /\.wast$/.test(name))
        .map(inName =>
            test(`${inName}`, () => {

                const code = fs.readFileSync(
                    path.join(__dirname, 'testfiles', inName)
                ).toString()
                const output = assemble(parse(code))

                const outName = inName.replace(/\.wast$/, '.wasm')
                const expected = fs.readFileSync(
                    path.join(__dirname, 'testfiles', outName)
                )

                expect(output).toEqual(expected)
            }
    ))
})
