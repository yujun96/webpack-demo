# 手写简单的webpack

## 实现webpack打包功能
#### 简单分析webpack打包的结果
先建立三个文件
index.js
```
let news = require('./news.js')
console.log(news.content)
```
message.js
```
module.exports = {
    content: `今天要下雨啦`
}
```
news.js
```
let message = require('./message.js')
module.exports = {
  content: `今天有个大新闻,爆炸新闻！！！！内容是${message.content}`
}
```
然后我们利用webpack进行打包,来分析这个打包后的结果

对这个打包后的结果进行简化分析。抽离出来的核心代码如下
```
 (function(modules) { 
	var installedModules = {};
	function __webpack_require__(moduleId) {·       
	if(installedModules[moduleId]) {
        return installedModules[moduleId].exports;		
    }
    var module = installedModules[moduleId] = {
        i: moduleId,
		l: false,
     	exports: {}
	};
	modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
	module.l = true;

	return module.exports;
   }

 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
 })
 ({ "./src/index.js": (function(module, exports, __webpack_require__) {eval("let news = __webpack_require__(/*! ./news.js */ \"./src/news.js\")\nconsole.log(news.content)\n\n//# sourceURL=webpack:///./src/index.js?");}),
    "./src/message.js":(function(module, exports) {eval("\nmodule.exports = {\n    content: `今天要下雨啦`\n}\n\n//# sourceURL=webpack:///./src/message.js?")}),
    "./src/news.js":(function(module, exports, __webpack_require__) {eval("let message = __webpack_require__(/*! ./message.js */ \"./src/message.js\")\nmodule.exports = {\n    content: `今天有个大新闻,爆炸新闻！！！！内容是${message.content}`\n}\n\n//# sourceURL=webpack:///./src/news.js?");})
})  

//  对这段代码进行分析
// 首先是一个自调用函数  modules: 是一个对象  obj
//  执行了这个自调用函数，自调用函数。内部返回了一个__webpack_require__()  传参为entry  里面的值 
// 执行__webpack_require__(） 传入entry的值
//  开始执行函数  
// 函数内部  module = {
//    i: modulesId,
//    l: false
//    export: {}
// }
// 继续执行，调用了最外层传入的参数,改变this指向为空{}, 最后就是一个__webpack_require__的递归调用
```
所以其实我们要实现一个webpack.主要任务有两个
 1. 将所有的require替换成__webpack__require,
 2. 将模块中的所有依赖进行读取，拼接成一个对象，传入自调用函数里面去。
#### 搭建项目基础骨架
 1. 创建一个bin目录，在bin目录下创建yj-pack文件.这个文件的主要目的就是读取webpack.config.js配置目录(暂不支持webpack那种自定义配置名称),将读取的配置传入compiler模块，让compiler模块进行相应的处理。此模块不做其他操作
 ```
 #! /usr/bin/env node 
const path = require('path') 
//  1. 读取需要打包项目的配置文件
let config = require(path.resolve('webpack.config.js'))
// let config  = require(process.cwd(),'webpack.config.js')
const Compiler = require('../lib/compiler')
let a = new Compiler(config)
a.start()
 ```
2. 创建我们的compiler模块
```
class Compiler {
    constructor(config) {
       this.config = config   // 将配置初始化
	   this.entry = config.entry   // 入口的相对路径
       this.root = process.cwd()   // 执行命令的当前目录
    }
	start() {
      // 进行相应的文件操作
	}
}
module.exports = Compiler

```
#### 读取入口文件
1. 首先我们思考一下，我们需要做什么？
我们主要目的是读取入口文件，分析各个模块之间的依赖关系，将require替换成__webpack_require__
```
class Compiler {
    constructor(config) {
       this.config = config   // 将配置初始化
	   this.entry = config.entry   // 入口的相对路径
       this.root = process.cwd()   // 执行命令的当前目录
	   this.analyseObj = {}   // 这个就是我们最后需要的文件对象
    }
	// 工具函数--- 用来拼接路径
	getOriginPath(path1,path2) {
        return path.resolve(path1,path2)
    }
	// 工具函数--- 读取文件
	readFile(modulePath) {
		 return fs.readFileSync(modulePath,'utf-8')
	}
	// 入口函数
	start() {
      // 进行相应的文件操作
	  // 拿到入口文件的路径，进行分析
	  let originPath = this.getOriginPath(this.root,this.entry)
      this.depAnalyse(originPath)
	}
	// 核心函数
	depAnalyse(modulePath){
	  // 这样content，就是我们就可以读取webpack.config.js里面的入口文件
	  let content =  this.readFile(modulePath)
	}
}
```
#### 利用AST语法树替换require
这一步读取文件之后，将require替换成__webpack_require__ .主要是利用来babel插件
```
const fs = require('fs')
const path = require('path')
const traverse = require('@babel/traverse').default;
const parser = require('@babel/parser');
const generate = require('@babel/generator').default
class Compiler {
    constructor(config) {
       this.config = config   // 将配置初始化
	   this.entry = config.entry   // 入口的相对路径
       this.root = process.cwd()   // 执行命令的当前目录
	   this.analyseObj = {}   // 这个就是我们最后需要的文件对象
    }
	// 工具函数--- 用来拼接路径
	getOriginPath(path1,path2) {
        return path.resolve(path1,path2)
    }
	// 工具函数--- 读取文件
	readFile(modulePath) {
		 return fs.readFileSync(modulePath,'utf-8')
	}
	// 入口函数
	start() {
      // 进行相应的文件操作
	  // 拿到入口文件的路径，进行分析
	  let originPath = this.getOriginPath(this.root,this.entry)
      this.depAnalyse(originPath)
	}
	// 核心函数
	depAnalyse(modulePath){
	  // 这样content，就是我们就可以读取webpack.config.js里面的入口文件
	  let content =  this.readFile(modulePath)

	   // 将代码转化为ast语法树    
      const ast = parser.parse(content) 
	  // traverse是将AST里面的内容进行替换
      traverse(ast, {
          CallExpression(p) {
            if(p.node.callee.name === 'require') {
                p.node.callee.name = '__webpack_require__'
            }
          }
      })
	   // 最后将ast语法树转化为代码
      let sourceCode =  generate(ast).code
	}
}
这样我们就完成了第一步，读取了当前入口文件，然后将内容的require进行了替换
```
#### 递归实现模块依赖分析
其实上述步骤还有一定的问题。如果index.js里面有多个模块依赖怎么办？类似
index.js
```
let a = require('./news.js)
let b = require('./news1.js)
```
因为我们需要将每个模块的依赖放在一个数组中进行保存。然后在对每个模块进行递归遍历。
那么我们继续改进depAnalyse函数
```
depAnalyse(modulePath){
	  // 这样content，就是我们就可以读取webpack.config.js里面的入口文件
	  let content =  this.readFile(modulePath)
	   // 将代码转化为ast语法树    
      const ast = parser.parse(content) 

	  // 用于存取当前模块的所有依赖。便于后面遍历
      let dependencies = []

	  // traverse是将AST里面的内容进行替换
      traverse(ast, {
          CallExpression(p) {
            if(p.node.callee.name === 'require') {
                p.node.callee.name = '__webpack_require__'
				// 这里是对路径进行处理，因为在window下面文件路径\.而lunix下面是/ 。所以我们进行统一处理一下
                let oldValue = p.node.arguments[0].value
                p.node.arguments[0].value = './'+ path.join('src',oldValue).replace(/\\+/g,'/')
				// 将当前模块依赖的文件路径推送到数组里面，遍历我们后续进行递归遍历
                dependencies.push(p.node.arguments[0].value)
            }
          }
      })
	   // 最后将ast语法树转化为代码
      let sourceCode =  generate(ast).code
	  // 把当前的依赖，和文件内容推到对象里面去。
      let relavitePath = './'+ path.relative(this.root,modulePath).replace(/\\+/g,'/')
      this.analyseObj[relavitePath] = sourceCode
	  // 每个模块可能还有其他的依赖，所以我们需要递归遍历一下。
      dependencies.forEach(dep=>{
        //   递归一下
        this.depAnalyse(this.getOriginPath(this.root,dep))
      })
	}
```
这样你打印this.analyseObj就发现已经得到了我们想要的对象。接下来我们思考怎么生成webpack模版。
#### 生成webpack模版文件
1. 首先我们找到最开始简化后webpack的打包文件。我们利用ejs进行相应的改造，建立一个template文件夹，建立output.ejs模版。模版如下
```
 (function(modules) { 
	var installedModules = {};
	function __webpack_require__(moduleId) {
	if(installedModules[moduleId]) {
        return installedModules[moduleId].exports;		
    }
    var module = installedModules[moduleId] = {
        i: moduleId,
		l: false,
     	exports: {}
	};
	modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
	module.l = true;

	return module.exports;
   }

 	return __webpack_require__(__webpack_require__.s = "<%-entry%>");
 })
 ({
     <% for (let k in modules) { %>	
		"<%-k%>": 
		(function(module, exports, __webpack_require__) {eval(`<%-modules[k]%>`)
	 }),
	 <%}%>
})
```
#### 让webpack结合ejs,输出文件
1. 这一步主要是当我们分析完成文件之后。将模版和我们分析的this.analyseObj进行结合
```
start() {
  let originPath = this.getOriginPath(this.root,this.entry)
  this.depAnalyse(originPath)
  // 编译完成
  this.emitFile()
}
emitFile() {
  let template= this.readFile(path.join(__dirname,'../template/output.ejs'))
  let result =  ejs.render(template,{
    entry: this.entry,
    modules: this.analyseObj
  })
  let outputPath = path.join(this.config.output.path,this.config.output.filename)
  fs.writeFileSync(outputPath,result)
  // console.log(result)
}
```
这样我们就将文件输出到指定目录了。然后利用node执行，或者放在浏览器执行。就可以读取了。这样我们就实现了简单的webpack打包功能






## 实现webpack的loader功能
### 在webpack中怎么开发一个loader
### 怎么让我们写的webpack支持loader功能


## 实现webpack的plugins功能
### webpack中怎么使用plugins
### 怎么开发一个自定义的plugins
### 让我们手写的webpack支持plugins功能