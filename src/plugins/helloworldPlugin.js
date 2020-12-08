// const { Compiler } = require("webpack")

class HelloWorldPlugin{
    apply(Compiler){
        Compiler.hooks.done.tap('HelloWorldPlugin',(compilation)=> {
            console.log("整个webpack打包结束")
        })
        Compiler.hooks.emit.tap('HelloWorldPlugin',(compilation)=> {
            console.log("文件开始发射")
        })
        // console.log('hello world')
    }
}
module.exports = HelloWorldPlugin