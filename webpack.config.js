const path = require('path')
const htmlPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  mode: 'production',
  entry: {
    index: './src/index.ts', //分开第三方模块 所以要给入口文件单独命名
    // 1080: './src/1080/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].js' //以key做为输出的名字
  },
  resolve: {
    extensions: ['.js','.ts']
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
      },
      {
        test: /\.styl$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'stylus-loader'
        ]
      },
      {
        test: /\.(htm|html)$/i,
        use: ['html-withimg-loader']
      }
    ]
  },
  plugins: [
    new htmlPlugin({
      minify: {
        removeAttributeQuotes: true
      },
      // filename: "256.html",
      // title: "256",
      // chunks: ['256'],  // 按需引入对应名字的js文件
      hash: true,
      template: 'src/index.html'
    })
    // new htmlPlugin({
    //   minify: {
    //     removeAttributeQuotes: true
    //   },
    //   filename: "1080.html",
    //   title: "1080",
    //   chunks: ['1080'], 
    //   hash: true,
    //   template: 'src/1080/index.html'
    // })
  ],
  performance: {
    hints: false
  }
}
