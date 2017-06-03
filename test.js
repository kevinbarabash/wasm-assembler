fetchAndInstantiate('build/manual.wasm').then(function(instance) {
    console.log(instance.exports.add(5, 10, 15));  // "30"
    console.log(instance.exports.mul(5, 10, 15));  // "750"
});

fetchAndInstantiate('build/test.wasm').then(function(instance) {
    console.log(instance.exports.add_or_sub(5, 10, 0));
    console.log(instance.exports.add_or_sub(5, 10, 1));
});

// fetchAndInstantiate() found in wasm-utils.js
function fetchAndInstantiate(url, importObject) {
    return fetch(url)
        .then(response => response.arrayBuffer())
        .then(bytes => WebAssembly.instantiate(bytes, importObject))
        .then(results => results.instance);
}
