const path = require('path')
const htmlPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  mode: 'production',
  entry: {
    index: './src/index.ts' //分开第三方模块 所以要给入口文件单独命名
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].js' //以key做为输出的名字
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    host: 'localhost',
    compress: true,
    port: 1717
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }, {
      test: /\.(png|jpg|gif)/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 5000,
          outputPath: 'images/'
        }
      }]
    }, {
      test: /\.ts$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }, {
      test: /\.styl$/,
      use: [
        'style-loader',
        'css-loader',
        'postcss-loader',
        'stylus-loader'
      ]
    }]
  },
  plugins: [
    new htmlPlugin({
      minify: {
        removeAttributeQuotes: true
      },
      hash: true,
      template: 'src/index.html'
    })
  ],
  performance: {
    hints: false
  }
}