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

 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
 })
 ({
     	
		"./src/index.js": 
		(function(module, exports, __webpack_require__) {eval(`let news = __webpack_require__("./src/news.js");

console.log(news.content);`)
	 }),
	 	
		"./src/news.js": 
		(function(module, exports, __webpack_require__) {eval(`let message = __webpack_require__("./src/message.js");

module.exports = {
  content: "今天111111111有个大新闻,爆炸新闻！！！！内容是" + message.content
};`)
	 }),
	 	
		"./src/message.js": 
		(function(module, exports, __webpack_require__) {eval(`module.exports = {
  content: "今天111111111要下雨啦"
};`)
	 }),
	 
	})
	
   

    



