import assert from 'assert'
import parse from 's-expression'

import {types} from './constants.js'
import instructions from './instructions.js'
import {encodeUInt32} from './leb128.js'

const program = {
    functype: [],
    import: [],
    typeidx: [],
    export: [],
    start: [],
    code: [],
    // data: [],
}

const funcIdx = []

const processModule = (module) => {
    const [type, ...children] = module
    assert.equal(type, 'module')

    children.forEach(process)
}

const isIdentifier = (str) => /\$\w*/.test(str)

const processInsts = (insts) => {
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
            if (['i32', 'i64', 'f32', 'f64'].includes(insts[i])) {
                code.push(types[insts[i]])
                i++
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
    const funcName = func[1]
    const params = func.filter(child => Array.isArray(child) && child[0] === 'param')
    const results = func.filter(child => Array.isArray(child) && child[0] === 'result')
    const locals = func.filter(child => Array.isArray(child) && child[0] === 'local')
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
                const idx = funcIdx.indexOf(func)
                if (idx === -1) {
                    throw new Error(`funcIdx for ${func} not found`)
                }
                code.push(...encodeUInt32(funcIdx.indexOf(func)))
            } else {
                code.push(...encodeUInt32(func))
            }
        } else if (['if', 'block', 'loop'].includes(inst)) {
            code.push(instructions[inst])
            // skip result type if one exists
            if (['i32', 'i64', 'f32', 'f64'].includes(insts[i])) {
                code.push(types[insts[i]])
                i++
            }
        } else if (inst === 'br_if') {
            code.push(instructions[inst])
            const level = insts[i++]
            code.push(...encodeUInt32(level))
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

const isType = (str) => /i32|i64|f32|f64/.test(str)

const flatMap = (array, mapFn) =>
    array.reduce((accum, value) => accum.concat(value.map(mapFn)), [])

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
        funcIdx.push(funcName)
        program.import.push({
            type: kind,   // TODO: change these to 'kind'
            name1: exp[1],
            name2: exp[2],
            index: funcIdx.indexOf(funcName),
        })
    } else if (kind === 'memory') {
        program.import.push({
            type: kind,
            name1: exp[1],
            name2: exp[2],
            min: exp[1],
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
    program.data.push({
        index: 0,
        offset: processInsts(offset),
        data: expr[2]
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
