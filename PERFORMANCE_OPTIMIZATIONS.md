# Tối Ưu Hiệu Suất Gửi Message

## Tổng Quan

Document này mô tả các tối ưu hiệu suất đã thực hiện để tăng tốc độ gửi tin nhắn trên production.

## Các Tối Ưu Đã Thực Hiện

### 1. Tối Ưu Database Queries

#### a) Parallel Queries (Promise.all)
**Trước đây:**
```javascript
// Các queries chạy tuần tự, mất nhiều thời gian
const message = await Message.create(messageData);
await conversation.save();
const populatedMessage = await Message.findById(message._id).populate(...);
```

**Sau khi tối ưu:**
```javascript
// Queries chạy song song, giảm thời gian chờ
const message = await Message.create(messageData);

const [, populatedMessage] = await Promise.all([
  Conversation.updateOne(...),  // Chạy song song
  Message.findById(message._id).populate(...)  // Chạy song song
]);
```

**Lợi ích:** Giảm 30-50% thời gian thực thi khi update conversation và populate message.

#### b) Sử dụng lean() cho Read Queries
**Trước đây:**
```javascript
const conversation = await Conversation.findOne({
  _id: conversationId,
  participants: userId,
});
```

**Sau khi tối ưu:**
```javascript
const conversation = await Conversation.findOne({
  _id: conversationId,
  participants: userId,
}).lean();  // Trả về plain JavaScript object
```

**Lợi ích:** 
- Tăng tốc độ query lên 5-10 lần
- Giảm memory usage
- Không cần Mongoose document overhead khi chỉ đọc dữ liệu

#### c) Sử dụng updateOne() thay vì save()
**Trước đây:**
```javascript
conversation.lastMessage = message._id;
conversation.lastMessageAt = message.createdAt;
await conversation.save();  // Tốn thời gian validate và process hooks
```

**Sau khi tối ưu:**
```javascript
await Conversation.updateOne(
  { _id: conversationId },
  {
    $set: {
      lastMessage: message._id,
      lastMessageAt: message.createdAt,
    },
  }
);
```

**Lợi ích:** 
- Nhanh hơn 2-3 lần
- Bypass Mongoose middleware và validation không cần thiết
- Ít memory hơn

### 2. Tối Ưu Field Selection

**Trước đây:**
```javascript
.populate({
  path: "sender",
  // Populate tất cả fields
})
```

**Sau khi tối ưu:**
```javascript
.populate({
  path: "sender",
  select: "fullname avatar status",  // Chỉ lấy fields cần thiết
})
.select('sender content type image images readBy createdAt updatedAt')
```

**Lợi ích:**
- Giảm payload size 40-60%
- Giảm network latency
- Tăng tốc độ query

### 3. Batch Processing cho Unread Counts

**Trước đây:**
```javascript
// N queries riêng biệt cho N conversations
const resultsWithUnread = await Promise.all(
  results.map(async (conversation) => {
    const unreadCount = await Message.countDocuments({
      conversation: conversation._id,
      sender: { $ne: userId },
      readBy: { $ne: userId },
    });
    return { ...conversation, unreadCount };
  })
);
```

**Sau khi tối ưu:**
```javascript
// 1 aggregation query duy nhất cho tất cả conversations
const unreadCounts = await Message.aggregate([
  {
    $match: {
      conversation: { $in: conversationIds },
      sender: { $ne: userId },
      readBy: { $ne: userId },
    },
  },
  {
    $group: {
      _id: '$conversation',
      count: { $sum: 1 },
    },
  },
]);
```

**Lợi ích:**
- Giảm từ N queries xuống 1 query
- Giảm database round-trips
- Tăng tốc lên 10-20 lần với nhiều conversations

### 4. Database Indexes

Đã tạo các compound indexes quan trọng:

```javascript
// Message collection
{ conversation: 1, createdAt: -1 }  // Lấy messages theo thứ tự thời gian
{ conversation: 1, sender: 1 }      // Filter messages by sender
{ conversation: 1, readBy: 1 }      // Tính unread count nhanh
{ sender: 1, createdAt: -1 }        // User message history

// Conversation collection
{ participants: 1, lastMessageAt: -1 }  // Lấy conversations sorted
{ product: 1, participants: 1 }         // Product conversations

// User collection
{ email: 1 }              // Unique index
{ role: 1, status: 1 }    // Filter users
```

**Lợi ích:**
- Tăng tốc độ query lên 100-1000 lần
- Giảm full collection scans
- Critical cho production performance

### 5. Tối Ưu Socket.IO Events

**Cải thiện:**
- Emit trực tiếp cho receiver ngay cả khi chưa join room
- Sử dụng `emitToUser()` để gửi tới tất cả tabs/devices của user
- Giảm delay trong việc cập nhật UI realtime

### 6. Code Optimization

- Loại bỏ function `populateMessage()` không cần thiết
- Inline queries để giảm function calls overhead
- Sử dụng `lean()` cho tất cả read-only queries

## Cách Chạy Tối Ưu Indexes

```bash
cd backend
node optimize-indexes.js
```

Script này sẽ:
- Kết nối với MongoDB
- Tạo tất cả indexes cần thiết
- Hiển thị thống kê indexes
- Đảm bảo indexes được tạo đúng

## Monitoring & Kiểm Tra

### 1. Kiểm tra Index Usage

Trong MongoDB shell:
```javascript
db.messages.find({ conversation: ObjectId("...") }).explain("executionStats")
```

Xem `winningPlan` có sử dụng index không.

### 2. Slow Query Log

Bật slow query logging:
```javascript
db.setProfilingLevel(1, { slowms: 100 })
```

Xem slow queries:
```javascript
db.system.profile.find().sort({ ts: -1 }).limit(10)
```

### 3. Performance Metrics

Metrics cần theo dõi:
- **Message send latency**: Thời gian từ khi user gửi đến khi DB lưu
- **Socket emit latency**: Thời gian emit realtime event
- **Query execution time**: Thời gian các queries chạy
- **Index hit ratio**: % queries sử dụng index

## Kết Quả Dự Kiến

| Metric | Trước | Sau | Cải Thiện |
|--------|-------|-----|-----------|
| Send message latency | 150-300ms | 50-100ms | 66-75% |
| Get conversations | 500-800ms | 100-200ms | 75-80% |
| Unread count query | 200-400ms | 20-40ms | 90% |
| Memory usage | Baseline | -30% | 30% |
| Database load | Baseline | -40% | 40% |

## Best Practices Đã Áp Dụng

1. ✅ **Always use lean()** cho read-only queries
2. ✅ **Parallel queries** với Promise.all khi độc lập
3. ✅ **Selective field population** - chỉ lấy fields cần thiết
4. ✅ **Batch operations** thay vì N+1 queries
5. ✅ **Proper indexing** cho tất cả queries thường dùng
6. ✅ **Use updateOne/updateMany** thay vì save() khi có thể
7. ✅ **Aggregate queries** cho complex operations

## Lưu Ý Quan Trọng

1. **Indexes chiếm storage**: Mỗi index chiếm RAM, cân nhắc giữa performance và resources
2. **Write performance**: Indexes làm chậm write operations, nhưng benefit từ read queries lớn hơn nhiều
3. **Monitor production**: Luôn monitor sau khi deploy để đảm bảo improvements thực tế
4. **Connection pooling**: Đảm bảo MongoDB connection pool đủ lớn cho load

## Các Tối Ưu Tiếp Theo (Optional)

Nếu cần tăng performance hơn nữa:

1. **Redis caching**: Cache conversations list, unread counts
2. **Message pagination**: Lazy load old messages
3. **CDN for images**: Serve images từ CDN thay vì server
4. **Database sharding**: Nếu data quá lớn
5. **Read replicas**: Distribute read load
6. **Compression**: Compress message content nếu rất dài

## Troubleshooting

### Nếu vẫn chậm sau tối ưu:

1. Kiểm tra indexes có được sử dụng không
2. Check network latency giữa server và database
3. Monitor database CPU/Memory usage
4. Kiểm tra số lượng concurrent connections
5. Review application server resources (CPU, RAM)

## Support

Nếu cần hỗ trợ, kiểm tra:
- MongoDB Atlas performance metrics
- Application logs
- Network latency
- Server resources
