import fs from 'fs'
import path from 'path'

import parse from '../parse'
import assemble from '../assemble'

const success_files = fs.readdirSync(path.join(__dirname, 'success_files'));
const error_files = fs.readdirSync(path.join(__dirname, 'error_files'))

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

    describe('error handling', () => {
        error_files.map(filename =>
            test(`${filename.replace('.wast', '')}`, () => {
                expect(() => {
                    const code = fs.readFileSync(
                        path.join(__dirname, 'error_files', filename)
                    ).toString()

                    assemble(parse(code))
                }).toThrowErrorMatchingSnapshot()
            })
        )

        // TODO: check for number functions that are out of bounds of funcIdx
        // TODO: add tests for missing types, arguments, etc.
    })
})
