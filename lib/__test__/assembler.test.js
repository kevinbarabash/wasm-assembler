import assert from 'assert'
import fs from 'fs'
import path from 'path'

import parse from '../parse'
import assemble from '../assembler'

describe('assembler', () => {
    it('should fail', () => {
        const code = fs.readFileSync(
            path.join(__dirname, 'testfiles', 'func.wast')
        ).toString()
        const ast = parse(code)
        const output = assemble(ast)

        const bytes = new Uint8Array(output);

        var buffer = new Buffer(bytes.length);
            for (var i = 0; i < bytes.length; i++) {
            buffer[i] = bytes[i];
        }

        const expected = fs.readFileSync(
            path.join(__dirname, 'testfiles', 'func.wasm')
        )
        assert.deepEqual(buffer, expected)
    })
})
