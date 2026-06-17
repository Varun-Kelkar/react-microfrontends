require('dotenv').config();
const path = require('path');
const webpack = require('webpack');
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
        name: 'shell',
        remotes: {
          uiKit: `uiKit@${process.env.UI_KIT_URL || 'http://localhost:3001'}/remoteEntry.js`,
          productCatalog: `productCatalog@${process.env.PRODUCT_CATALOG_URL || 'http://localhost:3002'}/remoteEntry.js`,
          cart: `cart@${process.env.CART_URL || 'http://localhost:3003'}/remoteEntry.js`,
          checkout: `checkout@${process.env.CHECKOUT_URL || 'http://localhost:3004'}/remoteEntry.js`,
        },
        shared: {
          react: { singleton: true, strictVersion: true, requiredVersion: '^18.3.1' },
          'react-dom': { singleton: true, strictVersion: true, requiredVersion: '^18.3.1' },
          'react-router-dom': { singleton: true, strictVersion: true, requiredVersion: '^6.23.1' },
        },
      }),
      new webpack.DefinePlugin({
        __UI_KIT_URL__: JSON.stringify(process.env.UI_KIT_URL || 'http://localhost:3001'),
        __PRODUCT_CATALOG_URL__: JSON.stringify(process.env.PRODUCT_CATALOG_URL || 'http://localhost:3002'),
        __CART_URL__: JSON.stringify(process.env.CART_URL || 'http://localhost:3003'),
        __CHECKOUT_URL__: JSON.stringify(process.env.CHECKOUT_URL || 'http://localhost:3004'),
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
      ...(isProduction ? [new MiniCssExtractPlugin()] : []),
    ],
    devServer: {
      port: 3000,
      hot: true,
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  };
};
