/**
 * Script để tối ưu indexes cho database
 * 
 * Chạy script này để đảm bảo tất cả indexes được tạo đúng
 * và tối ưu cho performance của message system.
 * 
 * Usage: node optimize-indexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const User = require('./models/User');

const optimizeIndexes = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📊 Analyzing and creating indexes...\n');

    // Message indexes
    console.log('📝 Message Collection:');
    console.log('  - Ensuring compound index: conversation + createdAt (for message history)');
    await Message.collection.createIndex(
      { conversation: 1, createdAt: -1 },
      { background: true }
    );

    console.log('  - Ensuring compound index: conversation + sender (for filtering)');
    await Message.collection.createIndex(
      { conversation: 1, sender: 1 },
      { background: true }
    );

    console.log('  - Ensuring compound index: conversation + readBy (for unread count)');
    await Message.collection.createIndex(
      { conversation: 1, readBy: 1 },
      { background: true }
    );

    console.log('  - Ensuring index: sender + createdAt (for user history)');
    await Message.collection.createIndex(
      { sender: 1, createdAt: -1 },
      { background: true }
    );

    // Conversation indexes
    console.log('\n💬 Conversation Collection:');
    console.log('  - Ensuring compound index: participants + lastMessageAt (for conversation list)');
    await Conversation.collection.createIndex(
      { participants: 1, lastMessageAt: -1 },
      { background: true }
    );

    console.log('  - Ensuring compound index: product + participants (for product-related conversations)');
    await Conversation.collection.createIndex(
      { product: 1, participants: 1 },
      { background: true }
    );

    // User indexes
    console.log('\n👤 User Collection:');
    console.log('  - Ensuring index: email (unique)');
    await User.collection.createIndex(
      { email: 1 },
      { unique: true, background: true }
    );

    console.log('  - Ensuring compound index: role + status (for filtering)');
    await User.collection.createIndex(
      { role: 1, status: 1 },
      { background: true }
    );

    console.log('\n✅ All indexes created successfully!');
    console.log('\n📊 Getting index statistics...\n');

    // Get index stats
    const messageIndexes = await Message.collection.getIndexes();
    const conversationIndexes = await Conversation.collection.getIndexes();
    const userIndexes = await User.collection.getIndexes();

    console.log('Message indexes:', Object.keys(messageIndexes).length);
    Object.keys(messageIndexes).forEach(key => {
      console.log(`  - ${key}`);
    });

    console.log('\nConversation indexes:', Object.keys(conversationIndexes).length);
    Object.keys(conversationIndexes).forEach(key => {
      console.log(`  - ${key}`);
    });

    console.log('\nUser indexes:', Object.keys(userIndexes).length);
    Object.keys(userIndexes).forEach(key => {
      console.log(`  - ${key}`);
    });

    console.log('\n✨ Optimization complete!');
    console.log('\n💡 Tips:');
    console.log('  - Monitor query performance with MongoDB Atlas or mongo shell');
    console.log('  - Use .explain() on slow queries to verify index usage');
    console.log('  - Consider adding more indexes if you have specific slow queries');

  } catch (error) {
    console.error('❌ Error optimizing indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

optimizeIndexes();
