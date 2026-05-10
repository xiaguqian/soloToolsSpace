const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const config = require('../config');

const initDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    
    await sequelize.sync({ force: true });
    console.log('Database tables created');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await User.create({
      username: 'admin',
      password: hashedPassword,
      nickname: '系统管理员',
      user_type: config.userTypes.SYSTEM,
      status: 1
    });
    console.log('System user created: admin / admin123');
    
    const user = await User.create({
      username: 'user',
      password: hashedPassword,
      nickname: '测试用户',
      user_type: config.userTypes.NORMAL,
      status: 1
    });
    console.log('Normal user created: user / admin123');
    
    console.log('\nDatabase initialization completed!');
    console.log('\nDefault users:');
    console.log('  System User: admin / admin123');
    console.log('  Normal User: user / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase();
