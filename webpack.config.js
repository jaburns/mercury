const WebpackPreBuildPlugin = require('pre-build-webpack');
const shadersGenIndex = require('./src/shaders/index.gen.js');

module.exports = {
    mode: 'production',
    context: __dirname,
    devtool: 'source-map',
    entry: './src/index.ts',
    output: {
        path: __dirname+'/docs',
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.js', '.ts'],
        modules: [ __dirname+'/src', 'node_modules' ]
    },
    module: {
        rules: [
            { test: /\.ts$/, loader: 'awesome-typescript-loader' },
            { test: /\.glsl$/, loader: 'raw-loader' },
        ]
    },
    plugins: [
        new WebpackPreBuildPlugin(stats => {
            // TODO fix this causing a watch infinite loop from constantly updating the file. (dont write if not different)
            shadersGenIndex();
        })
    ],
    optimization: {
        minimize: true
    },
};
