const crypto = require('crypto');
module.exports = app => {
  const { STRING, INTEGER, DATE, ENUM, TEXT } = app.Sequelize;

  const User = app.model.define('user', {
    id: {
      type: INTEGER(20),
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: STRING(30),
      allowNull: false,
      defaultValue: '',
      comment: '用户名',
      unique: true
    },
    password: {
      type: STRING,
      allowNull: false,
      defaultValue: '',
      comment: "密码",
      set(val) {
        const hmac = crypto.createHash("sha256", app.config.crypto.secret);
        hmac.update(val);
        let hash = hmac.digest("hex");
        this.setDataValue('password', hash);
      }
    },
    avatar: {
      type: STRING,
      allowNull: true,
      defaultValue: '',
      comment: '头像',
      get() {
        return app.config.webUrl + this.getDataValue('avatar')
      }
    },
    coin: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '金币'
    },
    created_time: {
      type: DATE,
      get() {
        return app.formatTime(this.getDataValue('created_time'))
      }
    },
    updated_time: DATE,
  });

  User.associate = function (models) {
    // 关联视频
    User.hasMany(app.model.Live);
  }

  return User;
};