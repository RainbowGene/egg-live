/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1605671439204_8109';

  // add your middleware config here
  config.middleware = ['errorHandle', 'adminAuth', 'adminSidebar', 'auth'];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  config.adminAuth = {
    ignore: [
      '/api',
      '/admin/login',
      '/admin/loginevent'
    ]
  };
  config.adminSidebar = {
    ignore: [
      '/api',
      '/admin/login',
      '/admin/loginevent',
      '/public'
    ]
  };

  // auth中间件针对的路由
  config.auth = {
    match: [
      '/api/logout',
      '/api/live/create',
      '/api/live/changestatus',
      '/api/gift/wxpay',
      '/api/user/info'
    ]
  };

  // 上传文件限制
  config.multipart = {
    fileSize: '50mb',
    mode: 'stream',
    fileExtensions: ['.xls', '.txt', '.jpg', '.JPG', '.png', '.PNG', '.gif', '.GIF', '.jpeg', '.JPEG'], // 扩展几种上传的文件格式
  };

  // 流媒体配置
  config.mediaServer = {
    rtmp: {
      port: 23482,
      chunk_size: 60000,
      gop_cache: true,
      ping: 30,
      ping_timeout: 60
    },
    http: {
      port: 23483,
      allow_origin: '*'
    },
    // https: {
    //   port: 8443,
    //   key:'./privatekey.pem',
    //   cert:'./certificate.pem',
    // },
    auth: {
      play: true,
      publish: true,
      secret: 'nodemedia2017privatekey',
      // api: true,
      // api_user: 'admin',
      // api_pass: 'admin',
    },
  };

  config.security = {
    // 关闭 csrf
    csrf: {
      headerName: 'x-csrf-token',
      ignore: ctx => {
        return ctx.request.url.startsWith('/api')
      },
    },
    // 跨域白名单
    // domainWhiteList: ['http://localhost:3000'],
  };
  // 允许跨域的方法
  config.cors = {
    origin: '*',
    allowMethods: 'GET, PUT, POST, DELETE, PATCH'
  };

  config.sequelize = {
    dialect: 'mysql',
    host: '127.0.0.1',
    username: "root",
    password: 'H9MvYSqY3JmAC4aj',
    port: 3306,
    database: "egg-live",
    // 中国时区
    timezone: '+08:00',
    define: {
      // 取消数据表名复数
      freezeTableName: true,
      // 自动写入时间戳 created_at updated_at
      timestamps: true,
      // 字段生成软删除时间戳 deleted_at
      // paranoid: true,
      createdAt: 'created_time',
      updatedAt: 'updated_time',
      // deletedAt: 'deleted_time',
      // 所有驼峰命名格式化
      underscored: true
    }
  };

  config.valparams = {
    locale: 'zh-cn',
    throwError: true
  };

  config.crypto = {
    secret: 'qhdgw@45ncashdaksh2!#@3nxjdas*_672'
  };

  config.jwt = {
    secret: 'qhdgw@45ncashdaksh2!#@3nxjdas*_672'
  };

  config.session = {
    renew: true,
    key: 'EGG_SESS',
    maxAge: 24 * 3600 * 1000 * 30,
    httpOnly: true,
    encrypt: true,
  };

  config.view = {
    mapping: {
      '.html': 'nunjucks',
    },
  };

  config.redis = {
    client: {
      port: 6379,          // Redis port
      host: '127.0.0.1',   // Redis host
      password: '',
      db: 5,
    },
  };

  // socket.io
  config.io = {
    init: {
      wsEngine: 'ws',
    },
    namespace: {
      '/': {
        connectionMiddleware: [
          'auth',
        ],
        packetMiddleware: [],
      }
    },
    redis: {
      host: '127.0.0.1',
      port: 6379,
    },
  };

  // 微信支付
  config.webUrl = 'http://127.0.0.1:7001'
  // 微信支付配置(营业执照)
  config.tenpay = {
    client: {
      appid: 'wxc569eadedd0a3bde',
      mchid: '1554109481',
      partnerKey: '8b07811ec791579f1c97793464c7049f',
      notify_url: config.webUrl + '/api/gift/notify',
      // sandbox: true
    }
  };

  return {
    ...config,
    ...userConfig,
  };
};
