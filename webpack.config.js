const env = require('./env');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const appName = 'PAVE';
let folderName;
const multiPartName = appName.match(/[A-Z][a-z]+/g);

if (multiPartName) {
  folderName = multiPartName.join('-').toLowerCase();
} else {
  folderName = appName.toLowerCase();
}

module.exports = {
  mode: 'production',
  entry: {
    app: `${__dirname}/jsx/${appName}.jsx`,
  },
  output: {
    path: `${__dirname}/bundles/${folderName}`,
    filename: '[name]-bundle.js',
    sourceMapFilename: '[name].js.map',
  },
  devtool: 'source-map',
  stats: {
    warnings: false,
  },
  watch: true,
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
              plugins: ['@babel/plugin-proposal-class-properties'],
            },
          },
        ],
      },
      {
        test: /\.s[ca]ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/bulma.css',
    }),
    new webpack.ProvidePlugin({
      React: 'react',
      ReactDOM: 'react-dom',
      _: 'lodash',
      axios: 'axios',
      ENDPOINTS: [`${__dirname}/utils/constants`, 'ENDPOINTS'],
      PropTypes: 'prop-types',
      $: 'jquery',
    }),
    new webpack.EnvironmentPlugin(env),
  ],
};
