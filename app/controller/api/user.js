'use strict';

const Controller = require('egg').Controller;
const crypto = require('crypto');

class UserController extends Controller {
  // 用户注册
  async reg() {
    let { ctx, app } = this;
    // 参数验证
    ctx.validate({
      username: {
        type: 'string',
        required: true,
        range: {
          min: 5,
          max: 20
        },
        desc: '用户名'
      },
      password: {
        type: 'string',
        required: true,
        desc: '密码'
      },
      repassword: {
        type: 'string',
        required: true,
        desc: '确认密码'
      }
    }, {
      equals: [
        ['password', 'repassword']
      ]
    });
    let { username, password } = ctx.request.body;
    // 验证用户是否已经存在
    if (await app.model.User.findOne({
      where: {
        username,
      }
    })) {
      ctx.throw(400, '用户名已存在');
    }
    // 创建用户
    let user = await app.model.User.create({
      username,
      password
    });
    if (!user) {
      ctx.throw(400, '创建用户失败');
    }
    ctx.apiSuccess(user);
  }

  // 登录 : npm i egg-jwt --save
  async login() {
    const { ctx, app } = this;
    // 参数验证
    ctx.validate({
      username: {
        type: 'string',
        required: true,
        desc: '用户名'
      },
      password: {
        type: 'string',
        required: true,
        desc: '密码'
      },
    });
    let { username, password } = ctx.request.body;
    // 验证该用户是否存在|验证该用户状态是否启用
    let user = await app.model.User.findOne({
      where: {
        username,
      }
    });
    if (!user) {
      ctx.throw(400, '用户不存在或已被禁用');
    }
    // 验证密码
    await ctx.checkPassword(password, user.password);

    user = JSON.parse(JSON.stringify(user));
    // 生成token
    let token = ctx.getToken(user);
    user.token = token;
    delete user.password;
    // 加入缓存中
    if (!await this.service.cache.set('user_' + user.id, token)) {
      ctx.throw(400, '登录失败');
    }
    // 返回用户信息和token
    return ctx.apiSuccess(user);
  }

  // 退出登录
  async logout() {
    const { ctx, service } = this;
    // 拿到当前用户id
    let current_user_id = ctx.authUser.id;
    // 移除redis当前用户信息
    if (!await service.cache.remove('user_' + current_user_id)) {
      ctx.throw(400, '退出登录失败');
    }
    ctx.apiSuccess('退出成功');
  }

  // 获取当前用户信息
  async info() {
    const { ctx } = this;
    let user = JSON.parse(JSON.stringify(ctx.authUser));
    delete user.password
    ctx.apiSuccess(user)
  }
}

module.exports = UserController;
