const path = require('path')
const HelloWorldPlugin = require('./src/plugins/helloworldPlugin.js')
const HTMLPlugin = require('./src/plugins/HTMLPlugin')

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    mode: 'development',
    module:{
        rules: [
            // {
            //   test: /\.js$/,
            //   use: ['./src/loaders/loader1.js','./src/loaders/loader2.js','./src/loaders/loader3.js' ]     
            // }
            // {
            //     test: /\.js$/,
            //     use: './src/loaders/loader2.js'
            // },
            {
            test: /\.js$/,
            use: {
              loader: './src/loaders/loader1.js',
              options: {
                  name: '今天111111111'
              }
            }
           }
        ]
    },
    plugins:[
        new HelloWorldPlugin()
        // new HTMLPlugin({
        //   filename: 'index.html',
        //   template: './src/index.html'  
        // })
    ]
}