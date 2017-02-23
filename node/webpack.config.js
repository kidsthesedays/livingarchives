const path = require('path')
const webpack = require('webpack')

module.exports = {
    entry: __dirname + '/src/main.js',
    output: {
        path: __dirname + '/static/js',
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    // { loader: 'eslint-loader' }
                    { loader: 'babel-loader' }
                ]
            }
        ]
    }
}
