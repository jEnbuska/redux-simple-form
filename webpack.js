const path = require('path');
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const SRC_PATH = path.join(__dirname, 'src');
const DIST_PATH = path.join(__dirname, 'dist');

const baseConfig = env => ({
    resolve: {
        extensions: ['.js', '.jsx', ],
        modules: [
            path.resolve(__dirname, 'node_modules'),
            path.join(__dirname, 'src'),
        ],
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
        ],

    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(env || 'development'),
        }),
        new webpack.NamedModulesPlugin(),
        new HtmlWebpackPlugin({
            template: `${SRC_PATH}/index.html`,
            path: DIST_PATH,
            filename: 'index.html',
        }),
    ],
});

module.exports = {
    bundle: ['babel-polyfill', 'whatwg-fetch', 'index.jsx', ],
    getPostCssPlugins: getPostCssPlugins(),
    vendorLibs: ['react', 'react-dom', 'react-router-dom', 'redux', 'react-redux', 'redux-thunk', 'jwt-decode', 'prop-types', ],
    outputFileNameTemplate: '[name].[hash].js',
    outputPublicPath: '/',
    base: baseConfig,
    sourcePath: SRC_PATH,
    distPath: DIST_PATH,
    modulesPath: path.join(__dirname, 'node_modules'),
};
