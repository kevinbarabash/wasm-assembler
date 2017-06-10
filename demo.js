var importObject = {
    console: {
        log: function(arg) {
            console.log(arg);
        }
    }
};

fetchAndInstantiate('build/manual.wasm', importObject).then(function(instance) {
    console.log(instance.exports.add(5, 10));  // "30"
    console.log(instance.exports.mul(5, 10));  // "750"
});

fetchAndInstantiate('build/test.wasm', importObject).then(function(instance) {
    console.log(instance.exports.add_or_sub(5, 10, 0));
    console.log(instance.exports.add_or_sub(5, 10, 1));
    console.log(instance.exports.add(5, 10));
});

// fetchAndInstantiate() found in wasm-utils.js
function fetchAndInstantiate(url, importObject) {
    return fetch(url)
        .then(response => response.arrayBuffer())
        .then(bytes => WebAssembly.instantiate(bytes, importObject))
        .then(results => results.instance);
}