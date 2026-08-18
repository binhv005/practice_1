# 🚀 Quick Performance Check Guide

## Pre-Deployment Checklist

### ✅ Trước khi deploy:

- [ ] Đã chạy `npm run optimize-indexes`
- [ ] Đã set `NODE_ENV=production` trong production
- [ ] Đã test locally với production database
- [ ] Đã backup database
- [ ] Đã review code changes

## Post-Deployment Checks

### 1️⃣ Immediate Checks (0-5 minutes)

```bash
# Check server started successfully
curl https://your-domain.com/api/conversations
# Should return 200 OK

# Check MongoDB connection
# Look for log: "MongoDB connected successfully with optimized connection pool"
```

**Expected:**
- ✅ Server starts without errors
- ✅ MongoDB connects with "Production mode" in logs
- ✅ Socket.IO initializes correctly

### 2️⃣ Index Verification (5-10 minutes)

```javascript
// Connect to MongoDB and run:
use your_database

// Check Message indexes
db.messages.getIndexes()
// Should see: conversation_1_createdAt_-1, conversation_1_sender_1, conversation_1_readBy_1

// Check Conversation indexes  
db.conversations.getIndexes()
// Should see: participants_1_lastMessageAt_-1

// Verify index is used
db.messages.find({ conversation: ObjectId("...") }).explain("executionStats")
// Look for: "indexName" in executionStats
```

**Expected:**
- ✅ All required indexes exist
- ✅ Queries use indexes (not COLLSCAN)

### 3️⃣ Performance Testing (10-20 minutes)

#### A. Message Send Latency

```bash
# Frontend: Send message and check Network tab
# Time to First Byte (TTFB) should be < 100ms

# Or use curl:
time curl -X POST https://your-domain.com/api/conversations/{id}/messages \
  -H "Content-Type: application/json" \
  -H "Cookie: token=..." \
  -d '{"content":"test"}'
```

**Expected:**
- ✅ < 100ms response time
- ✅ No errors in response

#### B. Conversation List Load

```bash
time curl https://your-domain.com/api/conversations \
  -H "Cookie: token=..."
```

**Expected:**
- ✅ < 200ms for list of 50 conversations
- ✅ Unread counts included

#### C. Real-time Message Test

1. Open 2 browser tabs
2. Send message from Tab 1
3. Message should appear in Tab 2 instantly (< 50ms)

**Expected:**
- ✅ Near-instant delivery
- ✅ Conversation order updates
- ✅ Unread count updates

### 4️⃣ Resource Monitoring (20-60 minutes)

#### MongoDB Atlas Metrics

Go to: Atlas → Cluster → Metrics

**Check:**
- **Operations** → Query Execution Time: < 50ms average
- **Connections** → Active: < 20 (maxPoolSize)
- **Network** → Data Transfer: Reasonable for traffic
- **Hardware** → CPU: < 70%, RAM: < 80%

**Expected:**
- ✅ Query time decreased significantly
- ✅ No connection spikes
- ✅ CPU/RAM stable or decreased

#### Server Metrics

```bash
# If using PM2
pm2 monit

# Or check logs
pm2 logs --lines 100

# Look for:
# - No errors
# - No memory leaks
# - Reasonable CPU usage
```

**Expected:**
- ✅ Memory usage stable or decreased
- ✅ CPU usage stable
- ✅ No error spikes

### 5️⃣ User Experience Test (60+ minutes)

#### Real User Testing

1. **Send multiple messages rapidly**
   - All messages should send without delay
   - No message loss
   - Order preserved

2. **Open multiple conversations**
   - List loads quickly
   - Unread counts accurate
   - Sorting correct

3. **Multiple devices test**
   - Send from Device A
   - Receive on Device B instantly
   - Both devices stay in sync

**Expected:**
- ✅ Smooth, lag-free experience
- ✅ No UI freezing
- ✅ Perfect synchronization

## 📊 Performance Benchmarks

### Target Metrics

| Metric | Target | Good | Needs Attention |
|--------|--------|------|-----------------|
| Message send (REST) | < 100ms | < 150ms | > 200ms |
| Message send (Socket) | < 50ms | < 100ms | > 150ms |
| Get conversations | < 200ms | < 300ms | > 500ms |
| Unread count query | < 50ms | < 100ms | > 200ms |
| Socket emit latency | < 20ms | < 50ms | > 100ms |
| Database query | < 20ms | < 50ms | > 100ms |

### Quick Performance Test Script

```javascript
// Run this in browser console on your app
async function testPerformance() {
  const results = {};
  
  // Test 1: Get conversations
  const start1 = performance.now();
  await fetch('/api/conversations', { credentials: 'include' });
  results.getConversations = Math.round(performance.now() - start1);
  
  // Test 2: Send message (replace ID)
  const start2 = performance.now();
  await fetch('/api/conversations/YOUR_CONV_ID/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content: 'test' })
  });
  results.sendMessage = Math.round(performance.now() - start2);
  
  console.table(results);
  return results;
}

// Run test
testPerformance();
```

## 🚨 Red Flags to Watch For

### Critical Issues (Fix Immediately)

- ❌ Error rate > 1%
- ❌ Message send time > 500ms
- ❌ Database CPU > 90%
- ❌ Memory leak (increasing over time)
- ❌ Connection pool exhausted
- ❌ Messages not arriving

### Warning Signs (Investigate)

- ⚠️ Message send time > 200ms
- ⚠️ Database CPU > 70%
- ⚠️ Connections > 15 (out of 20)
- ⚠️ Occasional timeouts
- ⚠️ Slow queries appearing in logs

### Normal Behavior

- ✅ Message send < 100ms
- ✅ Database CPU 30-50%
- ✅ Stable connections 5-10
- ✅ No errors in logs
- ✅ Users report fast experience

## 🔧 Quick Fixes

### If performance is still slow:

1. **Check indexes exist**
   ```bash
   npm run optimize-indexes
   ```

2. **Restart server**
   ```bash
   pm2 restart app-name
   # Or: systemctl restart your-service
   ```

3. **Check MongoDB connection**
   ```javascript
   // Should see "Production mode" in logs
   // maxPoolSize: 20, minPoolSize: 5
   ```

4. **Verify environment variables**
   ```bash
   echo $NODE_ENV  # Should be "production"
   echo $MONGODB_URI  # Should be correct
   ```

5. **Check network latency**
   ```bash
   # From server to MongoDB
   ping your-mongodb-host
   # Should be < 50ms
   ```

## 📞 Emergency Rollback

If critical issues occur:

```bash
# 1. Rollback code
git revert HEAD
git push

# 2. Drop new indexes if needed
db.messages.dropIndex("conversation_1_createdAt_-1")
# etc.

# 3. Restart server
pm2 restart app-name

# 4. Monitor recovery
pm2 logs --lines 100
```

## ✅ Success Criteria

Deployment is successful if:

1. ✅ All indexes created correctly
2. ✅ Message send time < 100ms
3. ✅ No error rate increase
4. ✅ Database metrics stable
5. ✅ Users report improved speed
6. ✅ No crashes or memory leaks
7. ✅ Real-time sync working perfectly

## 📝 Post-Deployment Report Template

```markdown
## Performance Optimization Deployment Report

**Date:** [Date]
**Time:** [Time]

### Pre-Deployment
- Indexes created: ✅/❌
- Environment: ✅/❌
- Backup: ✅/❌

### Performance Metrics
- Message send (before): ___ms → (after): ___ms
- Get conversations (before): ___ms → (after): ___ms
- Database CPU (before): ___% → (after): ___%

### Issues Encountered
- [None / List issues]

### Resolution
- [N/A / How issues were resolved]

### Status
- [ ] Success - All metrics improved
- [ ] Partial - Some improvements, monitoring needed
- [ ] Failed - Rolled back

### Next Steps
- [Actions needed]
```

---

**Remember:** 
- Always check logs first
- Monitor for 24-48 hours
- Document any issues
- Keep backups ready

**Contact:** [Your contact info]
