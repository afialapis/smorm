const webpack = require('webpack')
const path = require('path')

const TerserPlugin = require('terser-webpack-plugin')

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'

const plugins = [
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.IgnorePlugin(/^pg-native$/) // https://github.com/brianc/node-postgres/issues/838
]

const filename = env === 'production'
  ? 'minorm.min.js'
  : 'minorm.js'

module.exports = {
  mode: env,
  context: path.join(__dirname, 'src'),
  entry: [
    './index.js'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: filename,
  },
  target: 'node',
  plugins: plugins,
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [
          path.join(__dirname, 'src')
        ],
        query: {
          cacheDirectory: false,
          presets: [
            ['@babel/preset-env', {targets: {esmodules: true}}],
          ],
          plugins: [
            // Stage 3
            '@babel/plugin-proposal-object-rest-spread',
          ]
        }
      }
    ]
  },
  optimization: {
    minimizer: [  new TerserPlugin({
      parallel: true,
      terserOptions: {
        ecma: 6,
      },
    }),]
  },  
}
