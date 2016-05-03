var path = require('path')
var webpack = require('webpack')

module.exports = {
    entry: ['font-awesome-webpack!./font-awesome.config.js','./app/main.js'],
    output: {
        path: './dist',
        publicPath: '/dist/',
        filename: 'build.js'
    },
    target: 'electron',
    module: {
        loaders: [{
            test: /\.vue$/,
            loader: 'vue'
        }, {
            test: /\.js$/,
            loader: 'babel',
            exclude: /node_modules/
        }, {
            test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: "url-loader?limit=10000&minetype=application/font-woff"
        }, {
            test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: "file-loader"
        }]
    },
    babel: {
        "presets": ["es2015"],
        "plugins": ["transform-runtime"]
    },
    plugins: [
        new webpack.ExternalsPlugin('commonjs', [
            'electron'
        ])
    ]
}
