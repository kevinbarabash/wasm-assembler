const assembleProgram = require('./lib/assembler.js');
const {types, i32, get_local, end} = require('./lib/constants.js');

const program = [
    {
        type: 'functype',
        children: [
            {
                type: types.func,
                params: [types.i32, types.i32, types.i32],
                result: [types.i32],    // for no return this would be []
            },
        ]
    },
    {
        type: 'typeidx',
        children: [
            0,  // index of type
            0,  // index of type
        ],
    },
    {
        type: 'export',
        children: [
            {
                name: 'add',
                type: 'func',
                index: 0,
            },
            {
                name: 'mul',
                type: 'func',
                index: 1,
            }
        ]
    },
    {
        type: 'code',
        children: [
            [
                0,              // number of locals
                get_local, 0,
                get_local, 1,
                i32.add,
                get_local, 2,
                i32.add,
                end,
            ],
            [
                0,              // number of locals
                get_local, 0,
                get_local, 1,
                i32.mul,
                get_local, 2,
                i32.mul,
                end,
            ]
        ]
    },
];


const output = assembleProgram(program);

console.log(output.length);

const buffer = new Uint8Array(output);
const fs = require('fs');

fs.writeFileSync('build/manual.wasm', buffer, "binary");
