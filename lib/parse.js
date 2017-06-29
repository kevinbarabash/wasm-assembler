import assert from 'assert'
import parse from 's-expression'

import {types} from './constants.js'
import instructions from './instructions.js'
import {encodeUInt32} from './leb128.js'

let program
let funcIdx

const processModule = (module) => {
    program = {
        functype: [],
        import: [],
        typeidx: [],
        export: [],
        start: [],
        code: [],
        data: [],
    }

    funcIdx = []

    const [type, ...children] = module
    assert.equal(type, 'module')

    children.forEach(process)

    Object.keys(program).forEach(key => {
        if (program[key].length === 0) {
            delete program[key]
        }
    })
}

const isIdentifier = (str) => /\$\w*/.test(str)

const processInsts = (insts, localIdx = []) => {
    const code = []

    let i = 0
    while (i < insts.length) {
        const inst = insts[i++]
        if (inst === 'i32.const') {
            code.push(instructions[inst])
            code.push(...encodeUInt32(insts[i++]))
        } else if (['get_local', 'set_local', 'tee_local'].includes(inst)) {
            code.push(instructions[inst])
            const local = insts[i++]
            if (local[0] === '$') {
                code.push(localIdx.indexOf(local))
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
        } else if (['if', 'block', 'loop'].includes(inst)) {
            code.push(instructions[inst])
            // skip result type if one exists
            if (Array.isArray(insts[i]) && insts[i][0] === 'result') {
                if (['i32', 'i64', 'f32', 'f64'].includes(insts[i][1])) {
                    code.push(types[insts[i][1]])
                    i++
                }
            }
        } else if (inst === 'br_if') {
            code.push(instructions[inst])
            const level = insts[i++]
            code.push(...encodeUInt32(level))
        } else {
            code.push(instructions[inst])
        }
    }

    return code
}

const processFunc = (func) => {
    // TODO: deal with functions that don't have an identifier
    const funcName = func[1]

    const params = []
    const results = []
    const locals = []

    let i = 2;
    while (true) {
        if (Array.isArray(func[i]) && func[i][0] === 'param') {
            params.push(func[i++])
        } else {
            break
        }
    }
    while (true) {
        if (Array.isArray(func[i]) && func[i][0] === 'result') {
            results.push(func[i++])
        } else {
            break
        }
    }
    while (true) {
        if (Array.isArray(func[i]) && func[i][0] === 'local') {
            locals.push(func[i++])
        } else {
            break
        }
    }
    assert(results.length < 2, "can return at most one result")

    // TODO: handle (param i32 i32 ...)
    // actually verify that the 2nd param is an identifier
    const localIdx = [
        ...params.map(param => isIdentifier(param[1]) ? param[1] : ""),
        ...locals.map(local => isIdentifier(local[1]) ? local[1] : ""),
    ]

    const signature = {
        params: params.map(param => types[param[param.length - 1]]),
        result: results.map(result => types[result[1]]),
    }

    const insts = func.slice(2 + params.length + results.length + locals.length)
    const code = [
        ...encodeUInt32(locals.length), // local decl count
    ]

    if (locals.length > 0) {
        code.push(...encodeUInt32(locals.length)) // local type count
        code.push(...locals.map(local => types[local[local.length - 1]]))
    }

    code.push(...processInsts(insts, localIdx))
    code.push(instructions.end)

    const idx = program.functype.findIndex(type =>
        JSON.stringify(type) === JSON.stringify(signature))

    if (idx !== -1) {
        // reuse the type
        program.typeidx.push(idx)
    } else {
        program.typeidx.push(program.functype.length)
        program.functype.push(signature)
    }

    program.code.push(code)
    funcIdx.push(funcName)
}

const isType = (str) => /i32|i64|f32|f64/.test(str)

const processImport = (exp) => {
    const kind = exp[3][0]

    if (kind === 'func') {
        const func = exp[3]
        const funcName = func[1]

        const params = func.filter(child => Array.isArray(child) && child[0] === 'param')
        const results = func.filter(child => Array.isArray(child) && child[0] === 'result')

        const signature = {
            params: params.reduce((accum, param) =>
                accum.concat(param.filter(isType)), []).map(type => types[type]),
            result: results.map(result => types[result[1]]),
        }

        program.functype.push(signature)
        // TODO: handle situations where no id has been specified
        funcIdx.push(funcName)
        program.import.push({
            type: kind,   // TODO: change these to 'kind'
            name1: exp[1],
            name2: exp[2],
            index: funcIdx.indexOf(funcName),
        })
    } else if (kind === 'memory') {
        const memory = exp[3]
        program.import.push({
            type: kind,
            name1: exp[1],
            name2: exp[2],
            // TODO: handle situation where max is also specified
            min: memory[1],
        })
    }
}

const processExport = (exp) => {
    program.export.push({
        name: exp[1],
        type: exp[2][0],
        index: funcIdx.indexOf(exp[2][1]),
    })
}

const processStart = (expr) => {
    const name = expr[1]
    program.start.push({
        name: name,
        index: funcIdx.indexOf(name)
    })
}

const processData = (expr) => {
    const offset = expr[1]
    const data = []
    for (var i = 0; i < expr[2].length; i++) {
        data[i] = expr[2].charCodeAt(i);
    }
    program.data.push({
        index: 0,   // current version of wasm only supports memidx of 0
        offset: processInsts(offset),
        data: data,
    })
}

const process = (expr) => {
    switch (expr[0]) {
        case 'module':
            processModule(expr)
            break
        case 'func':
            processFunc(expr)
            break
        case 'import':
            processImport(expr)
            break
        case 'export':
            processExport(expr)
            break
        case 'start':
            processStart(expr)
            break
        case 'data':
            processData(expr)
            break
        default:
            throw new Error(`can't process '${expr[0]}' expressions yet`)
    }

    return program
}

module.exports = (code) => {
    const codeWithoutComments = code.replace(/;;.*/g, '')
    return process(parse(codeWithoutComments))
}
