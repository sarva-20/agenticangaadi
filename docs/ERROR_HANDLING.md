# 🐛 Error Handling Guide

Complete guide to handling errors in AgenticAngaadi - both for store owners and AI agents.

---

## 🎯 Philosophy

AgenticAngaadi provides **clear, actionable error messages** because:
- AI agents need to understand what went wrong
- Developers need to debug quickly
- Users need helpful feedback

**Bad error:** `500 Internal Server Error`  
**Good error:** `Product 'prod_xyz' not found in catalog`

---

## 🚨 Common Errors & Solutions

### 1. Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**What it means:**  
Another application is using port 3000.

**Solution A - Kill the process:**
```bash
# Find what's using port 3000
lsof -i :3000

# Kill it (replace PID with actual number)
kill -9 <PID>

# Restart your server
npm run dev
```

**Solution B - Use a different port:**

Edit `src/index.ts`:
```typescript
const PORT = 3001; // Change from 3000
```

---

### 2. TypeScript Compilation Errors

**Error:**
```
TSError: ⨯ Unable to compile TypeScript:
src/index.ts:226:32 - error TS2345
```

**What it means:**  
TypeScript found a type mismatch.

**Common causes:**

#### Missing type assertion
```typescript
// ❌ Error
const sessionId = req.params.sessionId;
const session = SESSIONS.get(sessionId);

// ✅ Fixed
const sessionId = req.params.sessionId as string;
const session = SESSIONS.get(sessionId);
```

#### Missing import
```typescript
// ❌ Error - Product is undefined
const catalog: Product[] = [];

// ✅ Fixed
import { Product } from './ucp-types';
const catalog: Product[] = [];
```

**Solution:**
1. Read the error line number
2. Check the type mismatch
3. Add proper type annotations or assertions

---

### 3. Module Not Found

**Error:**
```
Cannot find module 'express'
Error: Cannot find module '@types/express'
```

**What it means:**  
Dependencies not installed or corrupted.

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Or install specific module
npm install express
npm install -D @types/express
```

---

### 4. Test Agent Can't Connect

**Error:**
```
❌ Failed to discover store: FetchError: request to 
http://localhost:3000/.well-known/ucp failed
```

**What it means:**  
Store server isn't running or not accessible.

**Checklist:**
- [ ] Is `npm run dev` running in another terminal?
- [ ] Does `curl http://localhost:3000/health` work?
- [ ] Is port 3000 correct?
- [ ] Any firewall blocking localhost?

**Solution:**
```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Test agent
npm run test-agent
```

---

### 5. Product Not Found

**Error (in response):**
```json
{
  "error": "Invalid Product",
  "message": "Product prod_xyz not found"
}
```

**What it means:**  
AI agent requested a product ID that doesn't exist in your catalog.

**Where this happens:**  
`src/index.ts` - Checkout endpoint
```typescript
const product = PRODUCT_CATALOG.find(p => p.id === item.item.id);

if (!product) {
  return res.status(400).json({
    error: 'Invalid Product',
    message: `Product ${item.item.id} not found`
  });
}
```

**Solution:**
- Check product IDs match exactly (case-sensitive!)
- Verify product exists in `PRODUCT_CATALOG`
- Use `/products` endpoint to see available IDs

---

### 6. Out of Stock

**Error (in response):**
```json
{
  "error": "Out of Stock",
  "message": "Turkey & Avocado Sandwich is currently out of stock"
}
```

**What it means:**  
Product exists but `in_stock: false`.

**Solution:**

Edit `src/index.ts`:
```typescript
{
  id: "prod_sandwich_turkey",
  title: "Turkey & Avocado Sandwich",
  in_stock: true  // Change from false to true
}
```

---

### 7. Empty Cart

**Error:**
```json
{
  "error": "Bad Request",
  "message": "line_items cannot be empty"
}
```

**What it means:**  
Checkout request has no items.

**Invalid request:**
```json
{
  "line_items": []  // Empty!
}
```

**Valid request:**
```json
{
  "line_items": [
    {
      "item": { "id": "prod_coffee_latte" },
      "quantity": 1
    }
  ]
}
```

---

### 8. Session Not Found

**Error:**
```json
{
  "error": "Not Found",
  "message": "Session sess_xyz does not exist"
}
```

**What it means:**  
Session ID doesn't exist or expired.

**Common causes:**
- Typo in session ID
- Server restarted (sessions are in-memory)
- Session expired (30 min timeout)

**Solution:**
- Double-check session ID
- Create a new checkout session

---

### 9. Session Already Complete

**Error:**
```json
{
  "error": "Already Complete",
  "message": "This session has already been completed"
}
```

**What it means:**  
Trying to complete payment twice.

**Solution:**
- Create a new checkout session
- This is actually correct behavior (prevents double-charging!)

---

### 10. Invalid JSON

**Error:**
```
SyntaxError: Unexpected token } in JSON at position 45
```

**What it means:**  
Malformed JSON in request body.

**Invalid:**
```json
{
  "line_items": [
    { "item": { "id": "prod_latte" } }  // Missing quantity!
  ]
}
```

**Valid:**
```json
{
  "line_items": [
    { 
      "item": { "id": "prod_latte" }, 
      "quantity": 1 
    }
  ]
}
```

---

## 🛡️ Error Handling Best Practices

### For Store Developers

#### 1. Always Validate Input
```typescript
// ❌ Bad - No validation
app.post('/checkout-sessions', (req, res) => {
  const items = req.body.line_items;
  // Process without checking...
});

// ✅ Good - Validate first
app.post('/checkout-sessions', (req, res) => {
  const { line_items } = req.body;
  
  if (!line_items || line_items.length === 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'line_items cannot be empty'
    });
  }
  
  // Now safe to process
});
```

#### 2. Use Appropriate HTTP Status Codes
```typescript
// 400 - Bad Request (client's fault)
res.status(400).json({ error: 'Invalid product ID' });

// 404 - Not Found
res.status(404).json({ error: 'Session not found' });

// 409 - Conflict
res.status(409).json({ error: 'Session already complete' });

// 500 - Internal Server Error (server's fault)
res.status(500).json({ error: 'Database connection failed' });
```

#### 3. Log Everything
```typescript
app.post('/checkout-sessions', (req, res) => {
  console.log('🛒 Checkout requested:', req.body);
  
  try {
    // Process checkout
    console.log('✅ Checkout created:', sessionId);
  } catch (error) {
    console.error('❌ Checkout failed:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});
```

#### 4. Handle Edge Cases
```typescript
// Handle decimal quantities
if (!Number.isInteger(item.quantity)) {
  return res.status(400).json({
    error: 'Invalid Quantity',
    message: 'Quantity must be a whole number'
  });
}

// Handle negative quantities
if (item.quantity <= 0) {
  return res.status(400).json({
    error: 'Invalid Quantity',
    message: 'Quantity must be positive'
  });
}
```

---

### For AI Agent Developers

#### 1. Check Response Status
```typescript
const response = await fetch(url, options);

if (!response.ok) {
  const error = await response.json();
  console.error('API Error:', error);
  // Handle appropriately
}
```

#### 2. Implement Retry Logic
```typescript
async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

#### 3. Validate Before Sending
```typescript
// ❌ Bad - Send and hope
await createCheckout({ line_items: items });

// ✅ Good - Validate first
if (items.length === 0) {
  console.error('Cannot checkout with empty cart');
  return;
}

for (const item of items) {
  if (!item.item?.id || !item.quantity) {
    console.error('Invalid item format');
    return;
  }
}

await createCheckout({ line_items: items });
```

---

## 🔍 Debugging Tips

### Enable Debug Logging

Add to `src/index.ts`:
```typescript
// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

### Test Endpoints Individually
```bash
# Test discovery
curl http://localhost:3000/.well-known/ucp

# Test products
curl http://localhost:3000/products

# Test checkout (valid)
curl -X POST http://localhost:3000/checkout-sessions \
  -H "Content-Type: application/json" \
  -d '{"line_items":[{"item":{"id":"prod_coffee_latte"},"quantity":1}]}'

# Test checkout (invalid product)
curl -X POST http://localhost:3000/checkout-sessions \
  -H "Content-Type: application/json" \
  -d '{"line_items":[{"item":{"id":"INVALID"},"quantity":1}]}'
```

### Check Server Logs

The server prints helpful emoji logs:
- 🔍 = Discovery
- 🛍️ = Browse
- 🛒 = Checkout
- ✅ = Success
- ❌ = Error

---

## 📊 Error Response Format

All errors follow this consistent format:
```typescript
{
  "error": "Short Error Type",
  "message": "Detailed explanation of what went wrong"
}
```

**Examples:**
```json
// Product error
{
  "error": "Invalid Product",
  "message": "Product prod_xyz not found"
}

// Stock error
{
  "error": "Out of Stock",
  "message": "Caramel Latte is currently out of stock"
}

// Session error
{
  "error": "Not Found",
  "message": "Session sess_123 does not exist"
}
```

---

## 🆘 When to Ask for Help

If you've tried:
- ✅ Reading this guide
- ✅ Checking [Troubleshooting](TROUBLESHOOTING.md)
- ✅ Searching [GitHub Issues](https://github.com/sarva-20/agenticangaadi/issues)
- ✅ Restarting server/agent

**Then ask for help:**
1. [Open a GitHub Issue](https://github.com/sarva-20/agenticangaadi/issues/new)
2. Include:
   - Error message (full text)
   - What you were trying to do
   - Server logs
   - Node/npm versions (`node -v`, `npm -v`)

---

## 🎓 Learning from Errors

**Errors are learning opportunities!**

Each error teaches you:
- ✅ How UCP validation works
- ✅ HTTP status codes
- ✅ TypeScript type safety
- ✅ API design patterns

**Pro tip:** Keep a log of errors you encounter and how you solved them!

---

## 📚 Related Guides

- [Troubleshooting](TROUBLESHOOTING.md) - FAQ and common issues
- [API Reference](API_REFERENCE.md) - Full endpoint documentation
- [Setup Guide](SETUP.md) - Installation help

---

**Still stuck?** [Open an issue →](https://github.com/sarva-20/agenticangaadi/issues)