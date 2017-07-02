const assemble = module.exports.assemble;
const parse = module.exports.parse;
const print = module.exports.print;

const memory = new WebAssembly.Memory({initial: 1});

window.addEventListener('load', function() {
    const runButton = document.getElementById('run');
    const sourceTextarea = document.getElementById('source');
    const binaryTextarea = document.getElementById('binary');
    const jsTextarea = document.getElementById('js');
    const outputTextarea = document.getElementById('output');

    const _console = {
        log(value) {
            outputTextarea.value += value + '\n';
        }
    }

    const importObject = {
        console: {
            log: function(arg) {
                _console.log(arg);
            },
            print_str: function(offset, length) {
                const bytes = new Uint8Array(memory.buffer, offset, length);
                const string = new TextDecoder('utf8').decode(bytes);
                _console.log(string);
            },
        },
        js: { mem: memory },
    };

    let bin;

    const assembleSource = function() {
        const source = sourceTextarea.value;

        // TODO: combine these steps
        const ast = parse(source);
        bin = assemble(ast);

        // TODO: output error messages if something goes wrong when assembling
        // the source.
        binaryTextarea.value = print(bin);
    }

    assembleSource();

    sourceTextarea.addEventListener('keyup', function() {
        assembleSource();
    });

    runButton.addEventListener('click', function() {
        // clear output
        outputTextarea.value = '';

        // TODO: regex all require statements and compile them before running
        // the code
        WebAssembly.instantiate(bin, importObject).then(function(result) {
            const instance = result.instance;
            const modules = {};

            modules['test.wasm'] = instance.exports;

            const _module = {
                exports: {},
            };
            const _require = path => modules[path];
            const code = jsTextarea.value;

            const func = new Function("require", "console", "module", "exports", code);
            func(_require, _console, _module, _module.exports);
        });
    });
});
