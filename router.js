var fs = require('fs');
var path = require('path');
var joiRouter = require('koa-joi-router');

/**
 * 返回一个koa-joi-router，把指定目录下的文件(递归目录)作为koa-joi-router的配置文件，
 * 文件相对于根目录dir的路径本身会作为url的前置。prefix作为这个router的整体前置。
 * 注意，joiRouter的path是配置在配置对象的path里的，为了添加每个文件的前缀，
 * 每个文件require之后，会给对应的path添加前缀。
 * 每个文件里导出的是一个返回数组的函数(必须是数组，为了方便，没有做兼容)，这样一个文件可以定义多个路由。
 * 下面的参数没有做容错处理。
 * @param {string} dir - 目录路径，完整的
 * @param {object} [opts] - 传给上面所说的返回数组的函数，这样可以方便把一些通用的东西从这里传进去
 * @param {string} [prefix] - 放在这个router的匹配url前面
 */
module.exports = function(dir, opts, prefix){
    var router = joiRouter();
    var fileInfos = getAllJSFileInfos(dir);
    //处理一下prefix，让它变成/path/to/d的形式，就是开头有/，结尾没有/
    if(prefix) {
        if(prefix.indexOf('/') !== 0) prefix = '/' + prefix;
        if(prefix[prefix.length-1] === '/') prefix = prefix.substring(0, prefix.length-1);
    }
    for(var i=0; i<fileInfos.length; i++){
        var fileName = fileInfos[i].fileName;
        var filePath = fileInfos[i].filePath;
        var routes = require(filePath)(opts);
        for(var j=0; j<routes.length; j++){
            //如果配置的path里没有用/开头，补上
            if(routes[j].path.indexOf('/') !== 0) routes[j].path = '/' + routes[j].path;
            //把fileName作为前缀加到route的path前面
            routes[j].path = '/' + fileName + routes[j].path;
            //如果有prefix，放到前面
            if(prefix) {
                routes[j].path = prefix + routes[j].path;
            }
        }
        router.route(routes);
    }
    return router;
}

/**
 * 获取指定目录下所有js文件信息，此方法支持递归查找子目录
 * 但排除.svn等隐藏文件夹
 * @param {string} dir - 当前查找目录
 * @param {string} root - 遍历的根目录
 * @returns {array} 查找目录的所有文件信息数组{fileName, filePath}，
 * filePath是完整路径，
 * fileName是相对于根目录的js文件路径，并且去掉末尾的.js。
 */
function getAllJSFileInfos(dir, root) {
    if(!root) {
        // 未指定root根目录参数的,表示当前查找目录即为根目录
        root = dir;
    }
    var beginPos = root.length + 1;

    var fileInfos = [];
    var fileNames = fs.readdirSync(dir);
    fileNames.forEach(function(fileName) {
        if (!fileName || fileName.charAt(0) === ".") {
            // 以点开头的文件或目录多为软件自动生成的隐藏文件或目录(如.svn、.git、.idea),无需遍历,过滤掉
            return;
        }

        var sub = dir + '/' + fileName;
        var stat = fs.lstatSync(sub);

        if (stat.isDirectory()) {
            // 目录
            var subFileInfos = getAllJSFileInfos(sub, root);
            // 越深层的文件信息越靠前,所以这里是subFildInfos吞并fileInfos,而不是fileInfos吞并subFileInfos
            fileInfos = subFileInfos.concat(fileInfos);
        } else if (stat.isFile()) {
            // 文件
            var index = sub.lastIndexOf(".js");
            if(index != -1) {
                // js脚本文件
                var fileInfo = {};
                fileInfo.fileName = sub.substring(beginPos, index);
                fileInfo.filePath = path.join(dir, fileName);
                fileInfos.push(fileInfo);
            }
        }
    });
    return fileInfos;
};