const assemble = module.exports.assemble;
const parse = module.exports.parse;
const print = module.exports.print;

// Allocate a single block of memory which is 64K
var memory = new WebAssembly.Memory({initial: 1});
var bytes = new Uint8Array(memory.buffer, 0, 13);
const str = "Hello, world!";
for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
}

window.addEventListener('load', function() {
    const assembleButton = document.getElementById('assemble');
    const sourceTextarea = document.getElementById('source');
    const binaryTextarea = document.getElementById('binary');
    const jsTextarea = document.getElementById('js');
    const outputTextarea = document.getElementById('output');

    const _console = {
        log(value) {
            outputTextarea.value += value + '\n';
        }
    }

    var importObject = {
        console: {
            log: function(arg) {
                _console.log(arg);
            },
            print_str: function(offset, length) {
                var bytes = new Uint8Array(memory.buffer, offset, length);
                var string = new TextDecoder('utf8').decode(bytes);
                _console.log(string);
            },
        },
        js: { mem: memory },
    };

    assembleButton.addEventListener('click', function() {
        const source = sourceTextarea.value;

        const ast = parse(source);
        const bin = assemble(ast);

        binaryTextarea.value = print(bin);

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
