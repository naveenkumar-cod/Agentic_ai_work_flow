const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const config = require('./env');

let mongoMemoryServer = null;

async function seedDemoUsers() {
  try {
    const User = require('../models/User');
    const operatorExists = await User.findOne({ email: 'operator@agentflow.ai' });
    if (!operatorExists) {
      await User.create({
        name: 'Demo Operator',
        email: 'operator@agentflow.ai',
        password: 'operator123',
        role: 'operator'
      });
      console.log('✅ [Database] Seeded default operator user: operator@agentflow.ai / operator123');
    }

    const adminExists = await User.findOne({ email: 'admin@agentflow.ai' });
    if (!adminExists) {
      await User.create({
        name: 'Platform Admin',
        email: 'admin@agentflow.ai',
        password: 'admin12345',
        role: 'admin'
      });
      console.log('✅ [Database] Seeded default admin user: admin@agentflow.ai / admin12345');
    }
  } catch (err) {
    console.warn('⚠️ [Database] Demo user seeding notice:', err.message);
  }
}

async function connectDB() {
  mongoose.set('strictQuery', false);

  try {
    console.log(`🔌 [Database] Attempting connection to MongoDB: ${config.mongodbUri}`);
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log('✅ [Database] Connected to external MongoDB instance');
    await seedDemoUsers();
  } catch (err) {
    console.warn('⚠️ [Database] External MongoDB connection failed. Initializing In-Memory Mongo Server...');
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      console.log(`🔌 [Database] In-Memory MongoDB running at: ${memoryUri}`);
      await mongoose.connect(memoryUri);
      console.log('✅ [Database] Connected to In-Memory MongoDB successfully');
      await seedDemoUsers();
    } catch (memErr) {
      console.error('❌ [Database] Failed to start In-Memory MongoDB:', memErr);
      throw memErr;
    }
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (err) {
    console.error('Error disconnecting database:', err);
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  seedDemoUsers
};
