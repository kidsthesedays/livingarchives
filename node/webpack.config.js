const path = require('path')
const webpack = require('webpack')

module.exports = {
    entry: __dirname + '/src/main.js',
    output: {
        path: __dirname + '/static/js',
        filename: 'bundle.js'
    },
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint-loader'
            }
        ],
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    }
}
