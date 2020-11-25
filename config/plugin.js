'use strict';

/** @type Egg.EggPlugin */
module.exports = {

  // 关闭csrf 开启跨域
  cors: {
    enable: true,
    package: 'egg-cors'
  },

  // 数据库管理
  sequelize: {
    enable: true,
    package: 'egg-sequelize'
  },

  // 参数验证
  valparams: {
    enable: true,
    package: 'egg-valparams'
  },

  // 加密鉴权
  jwt: {
    enable: true,
    package: "egg-jwt"
  },

  // redis缓存
  redis: {
    enable: true,
    package: 'egg-redis',
  },

  // 模板渲染
  nunjucks: {
    enable: true,
    package: 'egg-view-nunjucks',
  },

  // socket.io
  io: {
    enable: true,
    package: 'egg-socket.io',
  },

  // 支付
  tenpay: {
    enable: true,
    package: 'egg-tenpay'
  }
};
