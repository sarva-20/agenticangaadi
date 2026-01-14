# 🛠️ Setup Guide

Complete installation and configuration guide for AgenticAngaadi.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 16+** installed ([Download here](https://nodejs.org/))
- **npm** or **yarn** package manager
- A code editor (VS Code recommended)
- Terminal/Command line access
- Basic knowledge of JavaScript/TypeScript (helpful but not required)

### Check Your Node Version
```bash
node --version
# Should show v16.x.x or higher
```

---

## 🚀 Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/agenticangaadi.git
cd agenticangaadi
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs:
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `body-parser` - JSON request parsing
- `typescript` - TypeScript compiler
- `ts-node` - Run TypeScript directly
- `nodemon` - Auto-restart on file changes

### Step 3: Verify Installation
```bash
npm run dev
```

You should see:
```
============================================================
🏪 AGENTICANGAADI - AI-Ready Store Server
============================================================
✅ Server running on: http://localhost:3000
🔍 Discovery URL: http://localhost:3000/.well-known/ucp
📦 Products available: 3
============================================================
```

**If you see this, installation was successful!** ✅

---

## ⚙️ Configuration

### Port Configuration

By default, AgenticAngaadi runs on port 3000. To change it:

**Edit `src/index.ts`:**
```typescript
const PORT = 3001; // Change to your preferred port
```

### Product Catalog

The default store has a coffee shop catalog. To customize:

**Edit `src/index.ts` - find `PRODUCT_CATALOG`:**
```typescript
const PRODUCT_CATALOG: Product[] = [
  {
    id: "prod_your_item",
    title: "Your Product Name",
    description: "Product description",
    price: 1000,              // Price in smallest unit (cents/paise)
    currency: "USD",          // Currency code
    image_url: "https://...", // Optional
    in_stock: true
  }
];
```

### Currency Settings

AgenticAngaadi supports any ISO 4217 currency:

**Common currencies:**
- `USD` - US Dollar (cents)
- `INR` - Indian Rupee (paise)
- `EUR` - Euro (cents)
- `GBP` - British Pound (pence)

**Example for Indian Rupees:**
```typescript
{
  id: "prod_chai",
  title: "Masala Chai",
  price: 2000,        // ₹20.00 (in paise)
  currency: "INR"
}
```

---

## 🧪 Testing Your Setup

### Test 1: Discovery Endpoint

Open a new terminal and run:
```bash
curl http://localhost:3000/.well-known/ucp
```

**Expected output:**
```json
{
  "ucp": {
    "version": "2026-01-11",
    "services": { ... }
  }
}
```

### Test 2: Product Catalog
```bash
curl http://localhost:3000/products
```

**Expected output:**
```json
{
  "products": [ ... ],
  "total": 3
}
```

### Test 3: Automated Test Agent
```bash
npm run test-agent
```

**Expected output:**
```
🤖 AI AGENT TEST - Shopping at UCP Store
🔍 Discovering UCP store...
✅ Store discovered!
🛍️ Browsing products...
✅ Found 3 products
...
✅ Shopping flow completed!
```

---

## 🐛 Common Setup Issues

### Issue: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
1. Check what's using port 3000:
```bash
   lsof -i :3000
```
2. Kill the process:
```bash
   kill -9 <PID>
```
3. Or change the port in `src/index.ts`

### Issue: TypeScript Compilation Errors

**Error:**
```
TSError: Unable to compile TypeScript
```

**Solution:**
1. Delete `node_modules` and reinstall:
```bash
   rm -rf node_modules package-lock.json
   npm install
```

2. Ensure TypeScript is installed:
```bash
   npm install -D typescript
```

### Issue: Module Not Found

**Error:**
```
Cannot find module 'express'
```

**Solution:**
```bash
npm install express cors body-parser
npm install -D @types/express @types/cors @types/body-parser
```

### Issue: Test Agent Fails to Connect

**Error:**
```
❌ Failed to discover store: FetchError
```

**Solution:**
- Ensure the server is running (`npm run dev` in another terminal)
- Check if port 3000 is accessible
- Verify no firewall is blocking localhost

---

## 📁 Project Structure

After setup, your project should look like:
```
agenticangaadi/
├── node_modules/          # Dependencies (auto-generated)
├── src/
│   ├── index.ts          # Main server file
│   ├── ucp-types.ts      # TypeScript type definitions
│   └── agents/
│       └── test-agent.ts # Test AI agent
├── docs/                 # Documentation (you are here!)
├── package.json          # Project configuration
├── package-lock.json     # Dependency lock file
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project overview
```

---

## 🔧 Development Workflow

### Running in Development Mode
```bash
npm run dev
```

This uses `nodemon` which auto-restarts when you save files.

### Building for Production
```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

### Running Production Build
```bash
npm start
```

This runs the compiled JavaScript (faster, but no auto-restart).

---

## 🌐 Environment Variables (Optional)

For advanced configuration, create a `.env` file:
```env
PORT=3000
NODE_ENV=development
STORE_NAME="My Store"
```

Then install dotenv:
```bash
npm install dotenv
```

And load it in `src/index.ts`:
```typescript
import 'dotenv/config';

const PORT = process.env.PORT || 3000;
```

---

## ✅ Next Steps

Once setup is complete:

1. 📖 Read [Getting Started Guide](GETTING_STARTED.md)
2. 🎨 [Customize Your Store](CUSTOMIZATION.md)
3. 🚀 [Deploy to Production](DEPLOYMENT.md)
4. 🤝 [Contribute](CONTRIBUTING.md)

---

## 💡 Tips

- Keep the server running while developing
- Use `console.log()` to debug
- Check server logs for AI agent activity
- The test agent is great for quick iteration

---

## 🆘 Need Help?

- 📖 [Troubleshooting Guide](TROUBLESHOOTING.md)
- 🐛 [Report Issues](https://github.com/yourusername/agenticangaadi/issues)
- 💬 [Discussions](https://github.com/yourusername/agenticangaadi/discussions)

---

**Setup complete?** [Continue to Getting Started →](GETTING_STARTED.md)