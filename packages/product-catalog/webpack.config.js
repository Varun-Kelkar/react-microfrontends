require('dotenv').config();
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    context: __dirname,
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      publicPath: 'auto',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@mfe-demo/shared': path.resolve(__dirname, '../shared/src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'productCatalog',
        filename: 'remoteEntry.js',
        exposes: {
          './ProductCatalog': './src/ProductCatalog',
        },
        remotes: {
          uiKit: `uiKit@${process.env.UI_KIT_URL || 'http://localhost:3001'}/remoteEntry.js`,
        },
        shared: {
          react: { singleton: true, strictVersion: true, requiredVersion: '^18.3.1' },
          'react-dom': { singleton: true, strictVersion: true, requiredVersion: '^18.3.1' },
        },
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
      ...(isProduction ? [new MiniCssExtractPlugin()] : []),
    ],
    devServer: {
      port: 3002,
      hot: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  };
};
