const path = require('path')

module.exports = {
    entry: './lib/index.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'wasm-asm.js',
        libraryTarget: 'commonjs2'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            }
        ]
    }
}
