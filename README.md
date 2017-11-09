# koa框架下的基本路由
包含404和错误处理中间件，路由用了koa-joi-router

## 用例

这个例子是从实际应用中抽取的

```js
//app.js
var app = new Koa();
var midware = require('./lib/midware');

function mountMidWare(){
    app.use(midware.errorHandler(logger));
    app.use(midware.notFoundHandler(logger));
    app.use(require('kcors')());
    var api = midware.router(config.app.apiPath, gobj, 'api');
    app.use(api.middleware());
}
```

路由的写法示范

```js
//example.js
module.exports = (opts) => {
    var config = opts.config;
    var photoScanTasksRoot = config.work.photoScanTasksRoot;
    var photoscanTaskMySqlConfig = config.work.mysqlDescription.PhotoscanTask;

    var common = opts.common;

    var mysqlDB = common.sql.getSqlStore('db1');
    var tableName = photoscanTaskMySqlConfig.tableName;

    var sqlMaker = common.sql.sqlMaker;

    function SqlQuery(sql, cb){
        function q(resolve, reject, cb){
            mysqlDB.query(sql, function(err, rows, fields){
                if(cb) return cb(err, rows, fields);
                if(err) return reject(err);
                resolve(rows);
            });
        }
        if(cb){
            q(null, null, cb)
        } else {
            return new Promise(function(resolve, reject){
                q(resolve, reject);
            });
        }
    }

    return [
        {
            method: 'post',
            path: '/send',
            handler: [bodyParser(), async function (ctx) {
                ctx.response.body = 'ok';
            }]
        },
        {
            method: 'get',
            path: '/query',
            handler: [
                async function (ctx) {
                    var findTaskSql = sqlMaker.sqlSelect(tableName);
                    var results = await SqlQuery(findTaskSql);
                    ctx.response.body = {
                        msg: 'success',
                        results: results
                    };
                }
            ]
        }
    ];
}
```

关于`var api = midware.router(config.app.apiPath, gobj, 'api');`。

1. apiPath就是包含路由文件的一个目录，目录会递归
2. gobj就是传入路由文件的opts，它是什么并无所谓，这取决于怎么使用，比如example传入的opts就是包装了config和common工具的一个对象
3. 'api'，路由路径前缀
4. 比如，example.js的路径是/lib/api/example.js，然后设置的apiPath为'/lib/api'，那么example.js里面所设置的两个路由的路径分别为'/api/example/send'和'/api/example/query'。这里路由的开头的api就是第三个参数设置的，也就是说apiPath本身不会包含到路由中。
