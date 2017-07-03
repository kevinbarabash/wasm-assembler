import fs from 'fs'
import path from 'path'

import parse from '../parse'
import assemble from '../assemble'

const success_files = fs.readdirSync(path.join(__dirname, 'success_files'));

describe('assemble', () => {
    describe('success', () => {
        success_files.filter(name => /\.wast$/.test(name))
            .map(inName =>
                test(`${inName}`, () => {

                    const code = fs.readFileSync(
                        path.join(__dirname, 'success_files', inName)
                    ).toString()
                    const output = assemble(parse(code))

                    const outName = inName.replace(/\.wast$/, '.wasm')
                    const expected = fs.readFileSync(
                        path.join(__dirname, 'success_files', outName)
                    )

                    expect(output).toEqual(expected)
                }
        ))
    })

    describe.only('error handling', () => {
        it('should handle undefined function name in export', () => {
            const code = fs.readFileSync(
                path.join(__dirname, 'error_files', 'export-undefined-function.wast')
            ).toString()

            expect(() => {
                assemble(parse(code))
            }).toThrow(new Error('export: function $add not defined'));
        })

        it('should handle undefined function name in start', () => {
            const code = fs.readFileSync(
                path.join(__dirname, 'error_files', 'start-undefined-function.wast')
            ).toString()

            expect(() => {
                assemble(parse(code))
            }).toThrow(new Error('start: function $add not defined'));
        })

        it('should handle func collisions', () => {
            const code = fs.readFileSync(
                path.join(__dirname, 'error_files', 'func-collision.wast')
            ).toString()

            expect(() => {
                assemble(parse(code))
            }).toThrow(new Error('func $f1 already defined'));
        })

        // TODO: check for number functions that are out of bounds of funcIdx
    })
})
