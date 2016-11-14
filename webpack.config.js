module.exports = {
    entry: './src/index.ts',
    output: {
        library: 'Live',
        filename: 'dist/live-coder.js'
    },
    resolve: {
        extensions: ['', '.ts', '.js']
    },
    module: {
        loaders: [
            {test: /\.ts/, loader: 'ts-loader'}
        ]
    }
};