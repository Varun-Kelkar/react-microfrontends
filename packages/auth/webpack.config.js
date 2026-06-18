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
        name: 'auth',
        filename: 'remoteEntry.js',
        exposes: {
          './SignInPage': './src/SignInPage',
          './SignUpPage': './src/SignUpPage',
          './UserMenu': './src/UserMenu',
          './AuthGuard': './src/AuthGuard',
          './ProfilePage': './src/ProfilePage',
        },
        remotes: {
          uiKit: `uiKit@${process.env.UI_KIT_URL || 'http://localhost:3001'}/remoteEntry.js`,
        },
        shared: {
          react: { singleton: true, strictVersion: true, requiredVersion: '^18.3.1' },
          'react-dom': { singleton: true, strictVersion: true, requiredVersion: '^18.3.1' },
          'react-router-dom': { singleton: true, strictVersion: true, requiredVersion: '^6.23.1' },
          '@clerk/clerk-react': { singleton: true, strictVersion: true, requiredVersion: '^5.22.0' },
        },
      }),
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(!isProduction),
        'process.env.CLERK_PUBLISHABLE_KEY': JSON.stringify(process.env.CLERK_PUBLISHABLE_KEY || ''),
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
      ...(isProduction ? [new MiniCssExtractPlugin()] : []),
    ],
    devServer: {
      port: 3005,
      hot: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  };
};
