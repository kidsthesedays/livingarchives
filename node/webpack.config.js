const path = require('path')
const webpack = require('webpack')

module.exports = {
    entry: __dirname + '/src/main.js',
    output: {
        filename: 'bundle.js',
        path: __dirname + '/static/js'
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
