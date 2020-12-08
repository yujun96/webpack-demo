module.exports = function(source){
    console.log('----loader3----')
    return source.replace(/今天/g,'我是loader3昨天')
}