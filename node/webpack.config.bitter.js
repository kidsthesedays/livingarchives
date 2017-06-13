const path = require('path')

const config = {
    entry: './bitter-and-sweet/src/main.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'bitter-and-sweet/static/js/')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            }
        ]
    }
}

module.exports = config

