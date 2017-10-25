const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const vendor = [ 'react', 'prop-types', 'react-dom', 'react-router', 'uuid', 'redux', 'react-redux', ];
const distPath = path.join(__dirname, 'dist');
const context = path.join(__dirname, 'src');
const getPostCssPlugins = () => [
    autoprefixer({ browsers: [
        '>1%',
        'last 4 versions',
        'Firefox ESR',
        'not ie < 9', // React doesn't support IE8 anyway
    ], }),
];
module.exports = ({
    devtool: 'source-map',
    context,
    entry: {
        bundle: 'index.jsx',
        vendor,
    },
    resolve: {
        extensions: [ '.js', '.jsx', ],
        modules: [
            path.resolve(__dirname, 'node_modules'),
            context,
        ],
    },
    output: {
        path: distPath,
        filename: '[name].[hash].js',
        publicPath: '/',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: [ /\.scss$/, /\.css$/, ],
                exclude: /node_modules/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        { loader: 'css-loader', options: { sourceMap: true, }, },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: true,
                                plugins: getPostCssPlugins(),
                            },
                        },
                        { loader: 'sass-loader', options: { sourceMap: true, }, },
                    ], }),
            },
        ],
    },
    plugins: [
        new ExtractTextPlugin({ filename: getPath => getPath('css/[name][hash].css').replace('css/js', 'css'),
            allChunks: true, }),
        new HtmlWebpackPlugin({
            template: `${context}/index.html`,
            path: distPath,
            filename: 'index.html',
        }),
        new webpack.NamedModulesPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            names: [ 'vendor', 'manifest', 'index', ],
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development'),
            },
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
    devServer: {
        port: 3000,
        contentBase: context,
        historyApiFallback: true,
        watchOptions: {
            aggregateTimeout: 100,
            poll: 200,
        },
    },
});