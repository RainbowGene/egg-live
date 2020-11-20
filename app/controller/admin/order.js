'use strict';

const Controller = require('egg').Controller;

class OrderController extends Controller {
  async index() {
    const { ctx, app } = this;

    let data = await ctx.page('Order', {}, {
      include: [{
        model: app.model.User,
        attributes: ['id', 'username', 'avatar']
      }]
    })

    data = JSON.parse(JSON.stringify(data))

    data = data.map(item => {
      item.username = item.user.username
      item.avatar = item.user.avatar
      return item
    })

    await ctx.renderTemplate({
      title: "订单管理",
      tempType: "table",
      table: {
        // 表头
        columns: [{
          title: 'ID',
          key: 'id',
          width: 60,
          fixed: 'center'
        }, {
          title: '订单号',
          key: 'no',
          width: 200,
          fixed: 'center'
        }, {
          title: '用户',
          fixed: 'left',
          render(item) {
            let avatar = item.avatar.replace('undefined', '') || '/public/assets/img/profiles/avatar-01.jpg'
            return `
                        <h2 class="table-avatar">
                            <a class="avatar avatar-sm mr-2"><img class="avatar-img rounded-circle bg-light" src="${avatar}"></a>
                            <a>${item.username}</a>
                        </h2>`
          },
        }, {
          title: '价格',
          key: 'price',
          width: 180,
          fixed: 'center'
        }, {
          title: '订单状态',
          width: 180,
          fixed: 'center',
          render(item) {
            const o = {
              pending: {
                text: "未支付",
                color: "warning"
              },
              success: {
                text: "支付成功",
                color: "success"
              },
              fail: {
                text: "支付失败",
                color: "danger"
              }
            }
            let v = o[item.status]
            return `
                        <span class="badge badge-${v.color}">${v.text}</span>
                        `
          },
        }, {
          title: '创建时间',
          key: 'created_time',
          width: 180,
          fixed: 'center'
        }, {
          title: "操作",
          width: 200,
          fixed: 'center',
          action: {
            delete: function (id) {
              return `/admin/order/delete/${id}`
            },
          }
        }],
        data
      }
    })
  }

  async delete() {
    const { ctx, app } = this;
    const id = ctx.params.id
    await app.model.Order.destroy({
      where: {
        id
      }
    })
    ctx.toast('删除成功', 'success')

    ctx.redirect(`/admin/order`);
  }
}

module.exports = OrderController;
