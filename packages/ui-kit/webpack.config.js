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
        name: 'uiKit',
        filename: 'remoteEntry.js',
        exposes: {
          './Button': './src/components/Button',
          './Card': './src/components/Card',
          './Input': './src/components/Input',
          './Modal': './src/components/Modal',
          './Badge': './src/components/Badge',
          './Toast': './src/components/Toast',
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
      port: 3001,
      hot: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  };
};
