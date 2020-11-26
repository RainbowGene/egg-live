'use strict';
const Controller = require('egg').Controller;

class NspController extends Controller {
  // 进入直播间
  async joinLive() {
    const { ctx, app, service, helper } = this;
    const nsp = app.io.of('/');
    const message = ctx.args[0] || {};
    const socket = ctx.socket;
    const id = socket.id;

    const { live_id, token } = message;

    let user = await this.checkToken(token)
    if (!user) {
      return;
    }

    // 验证当前直播间是否存在且是否处于开播中
    let msg = await service.live.checkStatus(live_id)
    if (msg) {
      socket.emit(id, ctx.helper.parseMsg('error', msg));
      return;
    }

    const room = 'live_' + live_id
    // 用户加入
    console.log('#join', room);
    socket.join(room);

    const rooms = [room];
    // 在线列表
    // nsp.adapter.clients(rooms, (err, clients) => {
    //     console.log('#online_join', clients);
    // });

    // 加入存储中
    let list = await service.cache.get('userList_' + room);
    list = list ? list : [];
    list = list.filter(item => item.id !== user.id)
    list.unshift({
      id: user.id,
      name: user.nickname || user.username,
      avatar: user.avatar,
    })
    service.cache.set('userList_' + room, list)

    // 更新在线用户列表
    nsp.adapter.clients(rooms, (err, clients) => {
      console.log('#online_join', clients);
      nsp.to(room).emit('online', {
        clients,
        action: 'join',
        user: {
          id: user.id,
          name: user.nickname || user.username,
          avatar: user.avatar,
        },
        data: list
      });
    });

    // 加入播放历史记录
    let liveUser = await app.model.LiveUser.findOne({
      where: {
        user_id: user.id,
        live_id
      }
    })
    if (!liveUser) {
      app.model.LiveUser.create({
        user_id: user.id,
        live_id
      })
      // 总观看人数+1
      let live = await service.live.exist(live_id)
      live.increment({
        look_count: 1
      })
    }
  }

  // 离开直播间
  async leaveLive() {
    const { ctx, app, service, helper } = this;
    const nsp = app.io.of('/');
    const message = ctx.args[0] || {};
    const socket = ctx.socket;
    const id = socket.id;

    const { live_id, token } = message;

    let user = await this.checkToken(token)
    if (!user) {
      return
    }

    // 验证当前直播间是否存在且是否处于开播中
    let msg = await service.live.checkStatus(live_id)
    if (msg) {
      socket.emit(id, ctx.helper.parseMsg('error', msg, {
        notoast: true
      }));
      return
    }

    const room = 'live_' + live_id
    // 用户离开
    socket.leave(room);

    const rooms = [room];
    // 在线列表
    nsp.adapter.clients(rooms, (err, clients) => {
      // 更新在线用户列表
      nsp.to(room).emit('online', {
        clients,
        action: 'leave',
        user: {
          id: user.id,
          name: user.nickname || user.username,
          avatar: user.avatar,
        },
      });
    });

    let list = await service.cache.get('userList_' + room);
    if (list) {
      list = list.filter(item => item.id !== user.id)
      service.cache.set('userList_' + room, list)
    }
  }

  // 直播间发送消息
  async comment() {
    const { ctx, app, service, helper } = this;

    const nsp = app.io.of('/');
    const message = ctx.args[0] || {};
    const socket = ctx.socket;
    const id = socket.id;

    const { live_id, token, data } = message;

    let user = await this.checkToken(token)
    if (!user) {
      return
    }

    try {
      // 验证当前直播间是否存在且是否处于开播中
      let msg = await service.live.checkStatus(live_id)
      if (msg) {
        socket.emit(id, ctx.helper.parseMsg('error', msg));
        return
      }

      const room = 'live_' + live_id
      // 推送消息到直播间
      nsp.to(room).emit('comment', {
        user: {
          id: user.id,
          name: user.nickname || user.username,
          avatar: user.avatar,
        },
        id: ctx.randomString(10), // 用户前端跳到底部
        content: data
      });

      app.model.Comment.create({
        content: data,
        live_id,
        user_id: user.id
      })

    } catch (error) {
      app.logger.error(error);
    }
  }

  // 直播间送礼物
  async gift() {
    const { ctx, app, service, helper } = this;
    const nsp = app.io.of('/');
    const message = ctx.args[0] || {};
    const socket = ctx.socket;
    const id = socket.id;

    const { live_id, gift_id, token } = message;

    let user = await this.checkToken(token)
    if (!user) {
      return
    }

    try {
      // 验证当前直播间是否存在且是否处于开播中
      let live = await service.live.checkStatus(live_id, true)
      if (typeof live === 'string') {
        socket.emit(id, ctx.helper.parseMsg('error', live));
        return
      }

      // 验证礼物是否存在
      let gift = await app.model.Gift.findOne({
        where: { id: gift_id }
      })
      if (!gift) {
        socket.emit(id, ctx.helper.parseMsg('error', '该礼物不存在'));
        return
      }
      // 金币不足
      if (user.coin < gift.coin) {
        socket.emit(id, ctx.helper.parseMsg('error', '金币不足，请先充值'));
        return
      }
      // 扣除金币
      user.coin -= gift.coin
      await user.save()

      // 写入礼物记录表
      app.model.LiveGift.create({
        live_id,
        user_id: user.id,
        gift_id
      })

      // 直播间增加金币数
      live.coin += gift.coin
      live.save()

      const room = 'live_' + live_id
      // 推送消息到直播间
      nsp.to(room).emit('gift', {
        avatar: user.avatar,
        username: user.nickname || user.username,
        gift_image: gift.image,
        gift_name: gift.name,
        num: 1,
        coin: gift.coin
      });

    } catch (error) {
      app.logger.error(error);
    }
  }

  async checkToken(token) {
    const { ctx, app, service, helper } = this;
    const nsp = app.io.of('/');
    const socket = ctx.socket;
    const id = socket.id;

    // 用户验证
    if (!token) {
      socket.emit(id, ctx.helper.parseMsg('error', '您没有权限访问该接口!'));
      return false
    }
    //2. 根据token解密，换取用户信息
    let user = {};
    try {
      user = ctx.checkToken(token);
    } catch (error) {
      let fail = error.name === 'TokenExpiredError' ? 'token 已过期! 请重新获取令牌' : 'Token 令牌不合法!';
      socket.emit(id, ctx.helper.parseMsg('error', fail));
      return false
    }
    //3. 判断当前用户是否登录
    let t = await ctx.service.cache.get('user_' + user.id);
    if (!t || t !== token) {
      socket.emit(id, ctx.helper.parseMsg('error', 'Token 令牌不合法!'));
      return false
    }

    //4. 获取当前用户，验证当前用户是否被禁用
    user = await app.model.User.findByPk(user.id);
    if (!user) {
      socket.emit(id, ctx.helper.parseMsg('error', '用户不存在或已被禁用'));
      return false
    }

    return user
  }
}

module.exports = NspController;
