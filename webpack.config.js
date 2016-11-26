var webpack = require('webpack');

module.exports = {
    entry: './src/index.ts',
    output: {
        library: 'Live',
        filename: 'dist/live-coder.min.js'
    },
    resolve: {
        extensions: ['', '.ts', '.js']
    },
    module: {
        loaders: [
            {test: /\.ts/, loader: 'ts-loader'}
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ],
    devtool: 'source-map'
};