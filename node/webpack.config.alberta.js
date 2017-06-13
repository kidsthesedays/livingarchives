const path = require('path')

const config = {
    entry: './finding-alberta/src/main.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'finding-alberta/static/js/')
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
