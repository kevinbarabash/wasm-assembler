const assert = require('assert');
const parse = require('s-expression');

const {types, i32, get_local, end} = require('./constants.js');
const instructions = require('./instructions.js');
const {encodeUInt32} = require('./leb128.js');

const program = {
    functype: [],
    import: [],
    typeidx: [],
    export: [],
    code: [],
};

const funcIdx = [];

const processModule = (module) => {
    const [type, ...children] = module;
    assert.equal(type, 'module');

    children.forEach(process);
}

const processFunc = (func) => {
    const funcName = func[1]
    const params = func.filter(child => Array.isArray(child) && child[0] === 'param')
    const results = func.filter(child => Array.isArray(child) && child[0] === 'result')
    const locals = func.filter(child => Array.isArray(child) && child[0] === 'local')
    assert(results.length < 2, "can return at most one result")

    const localIdx = [
        ...params.map(param => param.length === 3 ? param[1] : ""),
        ...locals.map(local => local.length === 3 ? local[1] : ""),
    ]

    const signature = {
        params: params.map(param => types[param[param.length - 1]]),
        result: results.map(result => types[result[1]]),
    }

    const insts = func.slice(2 + params.length + results.length + locals.length);
    const code = [
        ...encodeUInt32(locals.length), // local decl count
    ];

    if (locals.length > 0) {
        code.push(...encodeUInt32(locals.length)) // local type count
        code.push(...locals.map(local => types[local[local.length - 1]]))
    }

    let i = 0;
    while (i < insts.length) {
        const inst = insts[i++];
        if (inst === 'i32.const') {
            code.push(instructions[inst])
            code.push(...encodeUInt32(insts[i++]))
        } else if (inst === 'get_local') {
            code.push(instructions[inst])
            const local = insts[i++]
            if (local[0] === '$') {
                code.push(localIdx.indexOf(local))
            } else {
                code.push(...encodeUInt32(local))
            }
        } else if (inst === 'set_local') {
            code.push(instructions[inst])
            const local = insts[i++]
            if (local[0] === '$') {
                code.push(...encodeUInt32(localIdx.indexOf(local)))
            } else {
                code.push(...encodeUInt32(local))
            }
        } else if (inst === 'call') {
            code.push(instructions[inst])
            const func = insts[i++]
            if (func[0] === '$') {
                code.push(...encodeUInt32(funcIdx.indexOf(func)))
            } else {
                code.push(...encodeUInt32(func))
            }
        } else if (inst === 'if') {
            code.push(instructions[inst])
            // skip result type if one exists
            if (['i32', 'i64', 'f32', 'f64'].includes(insts[i])) {
                code.push(types[insts[i]]);
                i++;
            }
        } else {
            code.push(instructions[inst])
        }
    }
    code.push(instructions.end)

    // TODO: figure out how to reuse types
    // Right now we take advantage of the fact that each function has its own
    // type.
    program.typeidx.push(program.functype.length)
    program.functype.push(signature)
    program.code.push(code)
    funcIdx.push(funcName)
}

const processImport = (exp) => {
    const func = exp[3]
    const funcName = func[1]

    const params = func.filter(child => Array.isArray(child) && child[0] === 'param')
    const results = func.filter(child => Array.isArray(child) && child[0] === 'result')

    const signature = {
        params: params.map(param => types[param[param.length - 1]]),
        result: results.map(result => types[result[1]]),
    }

    program.functype.push(signature)
    funcIdx.push(funcName)
    program.import.push({
        name1: exp[1],
        name2: exp[2],
        type: 'func',   // TODO: change these to 'kind'
        index: funcIdx.indexOf(funcName),
    })
}

const processExport = (exp) => {
    program.export.push({
        name: exp[1],
        type: exp[2][0],
        index: funcIdx.indexOf(exp[2][1]),
    })
}

const process = (expr) => {
    switch (expr[0]) {
        case 'module':
            processModule(expr);
            break;
        case 'func':
            processFunc(expr);
            break;
        case 'import':
            processImport(expr);
            break;
        case 'export':
            processExport(expr);
            break;
        default:
            throw new Error(`can't process '${expr[0]}' expressions yet`);
    }

    return program;
}

module.exports = (code) => {
    const codeWithoutComments = code.replace(/;;.*/g, '')
    return process(parse(codeWithoutComments))
}
