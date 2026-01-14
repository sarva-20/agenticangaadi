// src/agents/test-agent.ts
// 🤖 Mock AI Agent - Tests UCP Stores
// This simulates how Claude, ChatGPT, or any AI would interact with a UCP store

import fetch from 'node-fetch';

const STORE_URL = 'http://localhost:3000';

// ANSI color codes for pretty terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Helper function for colored output
function log(emoji: string, message: string, color: string = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

// ============================================
// 🔍 STEP 1: DISCOVER THE STORE
// ============================================
async function discoverStore() {
  log('🔍', 'Discovering UCP store...', colors.cyan);
  
  try {
    const response = await fetch(`${STORE_URL}/.well-known/ucp`);
    const discovery = await response.json();
    
    log('✅', 'Store discovered!', colors.green);
    console.log(JSON.stringify(discovery, null, 2));
    
    return discovery;
  } catch (error) {
    log('❌', `Failed to discover store: ${error}`, colors.red);
    process.exit(1);
  }
}

// ============================================
// 🛍️ STEP 2: BROWSE PRODUCTS
// ============================================
async function browseProducts() {
  log('🛍️', 'Browsing products...', colors.cyan);
  
  try {
    const response = await fetch(`${STORE_URL}/products`);
    const data: any = await response.json();
    
    log('✅', `Found ${data.total} products`, colors.green);
    
    data.products.forEach((product: any) => {
      const price = (product.price / 100).toFixed(2);
      console.log(`  - ${product.title}: $${price} ${product.currency}`);
    });
    
    return data.products;
  } catch (error) {
    log('❌', `Failed to browse products: ${error}`, colors.red);
    process.exit(1);
  }
}

// ============================================
// 🛒 STEP 3: CREATE CHECKOUT SESSION
// ============================================
async function createCheckout(productId: string, quantity: number) {
  log('🛒', `Adding ${quantity}x ${productId} to cart...`, colors.cyan);
  
  try {
    const response = await fetch(`${STORE_URL}/checkout-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        line_items: [
          {
            item: { id: productId },
            quantity: quantity
          }
        ]
      })
    });
    
    const session: any = await response.json();
    
    if (response.status === 201) {
      const total = (parseInt(session.total.amount) / 100).toFixed(2);
      log('✅', `Checkout created! Session: ${session.id}`, colors.green);
      log('💰', `Total: $${total} ${session.total.currency}`, colors.yellow);
      console.log(JSON.stringify(session, null, 2));
      return session;
    } else {
      log('❌', `Checkout failed: ${session.message || session.error}`, colors.red);
      return null;
    }
  } catch (error) {
    log('❌', `Failed to create checkout: ${error}`, colors.red);
    return null;
  }
}

// ============================================
// 💳 STEP 4: COMPLETE PAYMENT
// ============================================
async function completePayment(sessionId: string) {
  log('💳', 'Processing payment...', colors.cyan);
  
  try {
    const response = await fetch(`${STORE_URL}/checkout-sessions/${sessionId}/complete`, {
      method: 'POST'
    });
    
    const result: any = await response.json();
    
    if (result.success) {
      log('✅', 'Payment successful!', colors.green);
      log('🎉', result.message, colors.bright);
      return result;
    } else {
      log('❌', `Payment failed: ${result.message}`, colors.red);
      return null;
    }
  } catch (error) {
    log('❌', `Failed to complete payment: ${error}`, colors.red);
    return null;
  }
}

// ============================================
// 🤖 MAIN: RUN THE FULL SHOPPING FLOW
// ============================================
async function main() {
  console.log('\n' + '='.repeat(60));
  log('🤖', 'AI AGENT TEST - Shopping at UCP Store', colors.bright);
  console.log('='.repeat(60) + '\n');
  
  // Step 1: Discover the store
  await discoverStore();
  console.log('');
  
  // Step 2: Browse products
  const products = await browseProducts();
  console.log('');
  
  // Step 3: Create checkout (buy 2 lattes)
  const session = await createCheckout('prod_coffee_latte', 2);
  console.log('');
  
  if (session) {
    // Step 4: Complete the payment
    await completePayment(session.id);
  }
  
  console.log('\n' + '='.repeat(60));
  log('✅', 'Shopping flow completed!', colors.green);
  console.log('='.repeat(60) + '\n');
}

// Run the agent
main().catch(console.error);