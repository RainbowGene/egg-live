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
  
  // 模板渲染
  nunjucks: {
    enable: true,
    package: 'egg-view-nunjucks',
  },


};
