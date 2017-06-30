const assemble = module.exports.assemble;
const parse = module.exports.parse;
const print = module.exports.print;

window.addEventListener('load', function() {
    const assembleButton = document.getElementById('assemble');
    const sourceTextarea = document.getElementById('source');
    const outputTextarea = document.getElementById('output');

    assembleButton.addEventListener('click', function() {
        const source = sourceTextarea.value;

        const ast = parse(source);
        const output = assemble(ast);

        outputTextarea.value = print(output);
    });
});

// Allocate a single block of memory which is 64K
var memory = new WebAssembly.Memory({initial: 1});
var bytes = new Uint8Array(memory.buffer, 0, 13);
const str = "Hello, world!";
for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
}

var importObject = {
    console: {
        log: function(arg) {
            console.log(arg);
        },
        print_str: function(offset, length) {
            var bytes = new Uint8Array(memory.buffer, offset, length);
            var string = new TextDecoder('utf8').decode(bytes);
            console.log(string);
        },
    },
    js: { mem: memory },
};

fetchAndInstantiate('manual.wasm', importObject).then(function(instance) {
    console.log(instance.exports.add(5, 10));  // "30"
    console.log(instance.exports.mul(5, 10));  // "750"
    instance.exports.print_arr();
});

fetchAndInstantiate('test.wasm', importObject).then(function(instance) {
    console.log(instance.exports.add_or_sub(5, 10, 0));
    console.log(instance.exports.add_or_sub(5, 10, 1));
    console.log(instance.exports.add(5, 10));
    instance.exports.print_arr();
});

// fetchAndInstantiate() found in wasm-utils.js
function fetchAndInstantiate(url, importObject) {
    return fetch(url)
        .then(response => response.arrayBuffer())
        .then(bytes => WebAssembly.instantiate(bytes, importObject))
        .then(results => results.instance);
}