// 后端权限验证
module.exports = (option, app) => {
  return async (ctx, next) => {
    // 拿到用户信息 ctx.session
    if (!ctx.session.auth) {
      ctx.toast('请先登录', 'danger')
      return ctx.redirect(`/admin/login`);
    }
    await next();

    if (ctx.status === 404) {
      await ctx.pageFail('页面不存在')
    }
  }
}