module.exports = function(source){
    console.log('---loader2----')
    return source.replace(/今天/g,'我是loader2昨天')
}