module.exports = function(source){
    console.log(this.query)
    return source.replace(/今天/g,this.query.name)
}