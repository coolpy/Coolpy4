module.exports = {
    mongoState: true,
    mongoPoolSize: 100,
    mongo : 'mongodb://localhost:27017',//使用mongodb数据库
    redisState: false,//是否启用Redis连接
    redis : 'redis://:jacle169@127.0.0.1:6379/2',//库0-15
    debug : true,//生产环境下需设置为false
    port: 8080,//本服务端口
    v : '0.1.0',
    formfileTyps : ['.jpg', '.png', '.zip', '.iso'],
    appName: 'CoolpyIV',
    whitelist: ['0.0.0.0/0', '::ffff:127.0.0.1']//ip白名单，'0.0.0.0/0'开头为禁用此功能
};