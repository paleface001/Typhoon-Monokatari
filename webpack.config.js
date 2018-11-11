const webpack = require('webpack');
const {
  resolve
} = require('path');

module.exports = {
  context: resolve('./src'),
  entry: {
      timeline:'./timeline.js',
      typhoon:'./typhoon.js'
  },
  output: {
    library: '[name]',
    libraryTarget: 'umd',
    filename: '[name].js',
    path: resolve(__dirname, 'build')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        // exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            plugins: [
              'transform-remove-strict-mode'
            ],
            presets: [
              [
                'es2015', {
                  loose: true,
                  modules: false
                }
              ],
              'stage-0'
            ]
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.AggressiveMergingPlugin()
  ]
};
