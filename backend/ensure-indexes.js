/**
 * Script để ensure các indexes được tạo đúng trong database.
 * Chạy script này sau khi deploy để đảm bảo performance optimal.
 * 
 * Usage: node ensure-indexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const User = require('./models/User');

const ensureIndexes = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    console.log('✅ Connected to MongoDB');

    console.log('\n📊 Creating indexes...\n');

    // Message indexes
    console.log('Creating Message indexes...');
    await Message.syncIndexes();
    const messageIndexes = await Message.collection.getIndexes();
    console.log('✅ Message indexes:', Object.keys(messageIndexes));

    // Conversation indexes
    console.log('\nCreating Conversation indexes...');
    await Conversation.syncIndexes();
    const conversationIndexes = await Conversation.collection.getIndexes();
    console.log('✅ Conversation indexes:', Object.keys(conversationIndexes));

    // User indexes
    console.log('\nCreating User indexes...');
    await User.syncIndexes();
    const userIndexes = await User.collection.getIndexes();
    console.log('✅ User indexes:', Object.keys(userIndexes));

    console.log('\n✨ All indexes created successfully!');

    // Analyze collections for query optimization
    console.log('\n📈 Collection statistics:\n');
    
    const messageStats = await Message.collection.stats();
    console.log('Messages:');
    console.log(`  - Documents: ${messageStats.count}`);
    console.log(`  - Size: ${(messageStats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Average document size: ${(messageStats.avgObjSize / 1024).toFixed(2)} KB`);
    console.log(`  - Indexes: ${messageStats.nindexes}`);
    console.log(`  - Total index size: ${(messageStats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);

    const conversationStats = await Conversation.collection.stats();
    console.log('\nConversations:');
    console.log(`  - Documents: ${conversationStats.count}`);
    console.log(`  - Size: ${(conversationStats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Average document size: ${(conversationStats.avgObjSize / 1024).toFixed(2)} KB`);
    console.log(`  - Indexes: ${conversationStats.nindexes}`);
    console.log(`  - Total index size: ${(conversationStats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);

    const userStats = await User.collection.stats();
    console.log('\nUsers:');
    console.log(`  - Documents: ${userStats.count}`);
    console.log(`  - Size: ${(userStats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Average document size: ${(userStats.avgObjSize / 1024).toFixed(2)} KB`);
    console.log(`  - Indexes: ${userStats.nindexes}`);
    console.log(`  - Total index size: ${(userStats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);

    console.log('\n🎉 Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ensuring indexes:', error);
    process.exit(1);
  }
};

ensureIndexes();
