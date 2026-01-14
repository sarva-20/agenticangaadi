# 🎓 Getting Started with AgenticAngaadi

Your first steps into AI-powered commerce! This guide walks you through understanding and using AgenticAngaadi.

---

## 🎯 What You'll Learn

By the end of this guide, you'll:
- ✅ Understand what UCP is and why it matters
- ✅ Run your first AI-ready store
- ✅ See an AI agent shop from your store
- ✅ Customize products and pricing
- ✅ Understand the complete shopping flow

**Time required:** 15 minutes

---

## 🧠 Understanding UCP (5 minutes)

### What Problem Does UCP Solve?

**Before UCP:**
```
AI Agent: "I want to buy coffee"
Problem: Every store has different APIs, formats, authentication...
Result: AI can't shop automatically 😞
```

**With UCP:**
```
AI Agent: "I want to buy coffee"
1. Discovers store at /.well-known/ucp
2. Browses products
3. Creates checkout
4. Completes payment
Result: AI shops anywhere automatically! 🎉
```

### The UCP Flow (Simple Version)
```
1. DISCOVERY
   AI: "Hey store, do you speak UCP?"
   Store: "Yes! Here's what I can do"

2. BROWSE
   AI: "Show me your products"
   Store: "Here are 3 products..."

3. CHECKOUT
   AI: "I want 2 lattes"
   Store: "Cart created! Total: $11.00"

4. PAYMENT
   AI: "Here's payment"
   Store: "Payment confirmed! Order complete!"
```

---

## 🚀 Your First Store (10 minutes)

### Step 1: Start the Server
```bash
cd agenticangaadi
npm run dev
```

**What's happening?**
- Server starts on `http://localhost:3000`
- UCP discovery endpoint is live at `/.well-known/ucp`
- Product catalog is loaded (3 items)

**Expected output:**
```
============================================================
🏪 AGENTICANGAADI - AI-Ready Store Server
============================================================
✅ Server running on: http://localhost:3000
🔍 Discovery URL: http://localhost:3000/.well-known/ucp
📦 Products available: 3
```

### Step 2: Test Discovery (Manual)

Open a **new terminal** and run:
```bash
curl http://localhost:3000/.well-known/ucp
```

**What you'll see:**
```json
{
  "ucp": {
    "version": "2026-01-11",
    "services": {
      "dev.ucp.shopping": {
        "version": "2026-01-11",
        "rest": {
          "endpoint": "http://localhost:3000"
        }
      }
    },
    "capabilities": [
      {
        "name": "dev.ucp.shopping.checkout",
        "version": "2026-01-11"
      }
    ]
  }
}
```

**What this means:**
- ✅ Your store is UCP-compliant
- ✅ AI agents can discover it
- ✅ It supports shopping/checkout
- ✅ Endpoint is `http://localhost:3000`

### Step 3: Browse Products
```bash
curl http://localhost:3000/products
```

**What you'll see:**
```json
{
  "products": [
    {
      "id": "prod_coffee_latte",
      "title": "Caramel Latte",
      "price": 550,
      "currency": "USD",
      "in_stock": true
    }
    // ... more products
  ],
  "total": 3
}
```

**Understanding the response:**
- `price: 550` = $5.50 (prices are in cents)
- `in_stock: true` = Available for purchase
- `currency: "USD"` = US Dollars

### Step 4: Create a Checkout
```bash
curl -X POST http://localhost:3000/checkout-sessions \
  -H "Content-Type: application/json" \
  -d '{
    "line_items": [
      {
        "item": { "id": "prod_coffee_latte" },
        "quantity": 2
      }
    ]
  }'
```

**What you'll see:**
```json
{
  "id": "sess_1234567890_abc",
  "status": "incomplete",
  "line_items": [
    {
      "item": {
        "id": "prod_coffee_latte",
        "title": "Caramel Latte"
      },
      "quantity": 2
    }
  ],
  "total": {
    "amount": "1100",
    "currency": "USD"
  },
  "payment_capabilities": [
    {
      "type": "card",
      "brands": ["visa", "mastercard", "amex"]
    }
  ],
  "expires_at": "2026-01-14T10:30:00.000Z"
}
```

**Understanding the response:**
- Session created with ID `sess_1234567890_abc`
- Total: $11.00 (2 × $5.50)
- Accepts card payments
- Expires in 30 minutes

**Check your server logs!** You'll see:
```
🛒 Agent wants to checkout: ...
  ✅ 2x Caramel Latte ($5.50 each)
  💰 Total: $11.00
  🎫 Created session: sess_...
```

### Step 5: Run the Full AI Agent Test
```bash
npm run test-agent
```

This simulates a complete AI shopping experience!

**What you'll see:**
```
============================================================
🤖 AI AGENT TEST - Shopping at UCP Store
============================================================

🔍 Discovering UCP store...
✅ Store discovered!

🛍️ Browsing products...
✅ Found 3 products
  - Caramel Latte: $5.50 USD
  - Chocolate Mocha: $6.00 USD
  - Butter Croissant: $3.50 USD

🛒 Adding 2x prod_coffee_latte to cart...
✅ Checkout created! Session: sess_...
💰 Total: $11.00 USD

💳 Processing payment...
✅ Payment successful!
🎉 Payment processed successfully!

============================================================
✅ Shopping flow completed!
============================================================
```

**🎉 Congratulations!** You just saw an AI agent shop from your store!

---

## 🎨 Customizing Your Store

### Adding Your Own Products

Open `src/index.ts` and find `PRODUCT_CATALOG`:
```typescript
const PRODUCT_CATALOG: Product[] = [
  {
    id: "prod_my_book",           // Unique ID
    title: "Learn TypeScript",     // Display name
    description: "Master TypeScript in 30 days",
    price: 2999,                   // $29.99 in cents
    currency: "USD",
    image_url: "https://example.com/book.jpg",
    in_stock: true
  }
];
```

**💡 Tips:**
- Use descriptive IDs like `prod_category_item`
- Price in smallest unit (cents for USD, paise for INR)
- Set `in_stock: false` for unavailable items

### Changing Currency to INR (Indian Rupees)
```typescript
{
  id: "prod_masala_chai",
  title: "Masala Chai",
  price: 2000,              // ₹20.00 in paise
  currency: "INR"           // Change to INR
}
```

### Testing Your Changes

After modifying products:
1. Save `src/index.ts`
2. Server auto-restarts (thanks to nodemon!)
3. Run `npm run test-agent` again
4. See your new products in action!

---

## 🧪 Understanding the Code

### The Discovery Endpoint

**Location:** `src/index.ts` line ~70
```typescript
app.get('/.well-known/ucp', (req: Request, res: Response) => {
  // This tells AI agents: "I'm a UCP store!"
  res.json({
    ucp: {
      version: "2026-01-11",
      services: { /* what I can do */ },
      capabilities: [ /* my features */ ]
    }
  });
});
```

**Why it matters:** This is the FIRST endpoint AI agents hit. Without it, they can't discover your store.

### The Checkout Endpoint

**Location:** `src/index.ts` line ~150
```typescript
app.post('/checkout-sessions', (req: Request, res: Response) => {
  const { line_items } = req.body;
  
  // 1. Validate products exist
  // 2. Check if in stock
  // 3. Calculate total
  // 4. Create session
  // 5. Return to agent
});
```

**Why it matters:** This creates the "shopping cart" that AI agents use.

### The Test Agent

**Location:** `src/agents/test-agent.ts`
```typescript
async function main() {
  await discoverStore();    // Find the store
  await browseProducts();   // See what's available
  await createCheckout();   // Make a cart
  await completePayment();  // Finish purchase
}
```

**Why it matters:** This simulates EXACTLY how Claude, ChatGPT, or Gemini would shop.

---

## 🎯 Common First-Time Questions

### Q: Is this a real payment system?

**A:** Not yet! AgenticAngaadi simulates payments for learning purposes. The `/complete` endpoint doesn't actually charge money.

**For production:** You'd integrate Stripe, Razorpay, or another payment gateway.

### Q: Can Claude really shop from this?

**A:** YES! If you deploy this to a public URL (we'll cover that in [DEPLOYMENT.md](DEPLOYMENT.md)), Claude can:
1. Discover your store
2. Browse products
3. Create checkouts
4. Complete orders

### Q: Why use cents/paise instead of dollars/rupees?

**A:** Avoids floating-point math errors!
```javascript
// Bad (floating point errors)
let price = 5.50 + 6.00;  // Might be 11.500000001

// Good (integer math)
let price = 550 + 600;    // Always exactly 1150
```

### Q: What's the difference between UCP and Shopify API?

**Feature** | **Shopify API** | **UCP**
------------|-----------------|--------
Who it's for | Human developers | AI agents
Discovery | No standard way | `/.well-known/ucp`
Setup | Complex OAuth | Simple REST
Purpose | Build custom apps | AI shopping

---

## 🚀 Next Steps

Now that you understand the basics:

1. **Customize:** [Add your own products →](CUSTOMIZATION.md)
2. **Deploy:** [Put your store online →](DEPLOYMENT.md)
3. **Deep Dive:** [Understand the architecture →](ARCHITECTURE.md)
4. **Contribute:** [Help improve AgenticAngaadi →](CONTRIBUTING.md)

---

## 💡 Challenge: Build Your Own Store

Try creating a store for:
- 📚 Bookstore (books, magazines)
- 🏨 Hotel booking (rooms, dates)
- 🍕 Restaurant (menu items)
- 🎮 Game store (digital games)

**Hint:** Just modify `PRODUCT_CATALOG` in `src/index.ts`!

---

## 🆘 Stuck?

- 📖 [Troubleshooting Guide](TROUBLESHOOTING.md)
- 🔧 [Error Handling](ERROR_HANDLING.md)
- 💬 [Ask on GitHub Discussions](https://github.com/sarva-20/agenticangaadi/discussions)

---

**Ready to go deeper?** [Continue to API Reference →](API_REFERENCE.md)