var webpack = require('webpack');

module.exports = {
    entry: {
        'polyfills': './src/polyfills.ts',
        'live-coder': './src/index.ts'
    },
    output: {
        library: 'Live',
        filename: 'dist/[name].min.js'
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