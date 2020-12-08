// const { Compiler } = require("webpack")
const fs = require('fs')
const cheerio = require('cheerio')

class HTMLPlugin{
    constructor(options){
        this.options = options
    }
    apply(Compiler){
        //  注册afterEmit 事件
        Compiler.hooks.afterEmit.tap('HTMLPlugin',(compilation)=> {
            // console.log("整个webpack打包结束")
           let result = fs.readFileSync(this.opions.template,'utf-8')
            // console.log(this.options)
            // console.log(result)
            let $ = cheerio.load(result)
            Object.keys(compilation.assets).forEach(item=>{
                $(`<script src="${item}"></script>`).appendTo('body')
            })
            // 生成html。输出
            // $.html()
            fs.writeFileSync('./dist/' + this.options.filename,$.html())


        })
        // console.log('hello world')
    }
}
module.exports = HTMLPlugin