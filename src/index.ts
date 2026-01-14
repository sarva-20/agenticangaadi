// src/index.ts
// 🏪 UCP Beginner Toolkit - Your First AI-Ready Store
// This server implements the Universal Commerce Protocol (UCP)
// so AI agents can discover and shop from your store automatically!

import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { 
  Product, 
  CheckoutSession, 
  UCPDiscovery, 
  CreateCheckoutRequest,
  LineItem,
  MoneyAmount 
} from './ucp-types';

// ============================================
// 🎛️ CONFIGURATION
// ============================================
const app = express();
const PORT = 3000;
const SERVER_URL = `http://localhost:${PORT}`;

// Middleware setup
app.use(cors());                    // Allow requests from anywhere
app.use(bodyParser.json());         // Parse JSON request bodies

// ============================================
// 🗄️ PRODUCT CATALOG (Our "Database")
// ============================================
// In a real app, this would be in a database like PostgreSQL
// For learning, we're keeping it simple with an in-memory array

const PRODUCT_CATALOG: Product[] = [
  {
    id: "prod_coffee_latte",
    title: "Caramel Latte",
    description: "Smooth espresso with steamed milk and caramel",
    price: 550,              // $5.50 in cents
    currency: "USD",
    image_url: "https://example.com/latte.jpg",
    in_stock: true
  },
  {
    id: "prod_coffee_mocha",
    title: "Chocolate Mocha",
    description: "Rich chocolate and espresso blend",
    price: 600,              // $6.00 in cents
    currency: "USD",
    in_stock: true
  },
  {
    id: "prod_pastry_croissant",
    title: "Butter Croissant",
    description: "Flaky, buttery French pastry",
    price: 350,              // $3.50 in cents
    currency: "USD",
    in_stock: true
  },
  {
    id: "prod_sandwich_turkey",
    title: "Turkey & Avocado Sandwich",
    description: "Fresh turkey, avocado, lettuce on sourdough",
    price: 895,              // $8.95 in cents
    currency: "USD",
    in_stock: false          // Currently out of stock!
  }
];

// In-memory storage for checkout sessions
// In production, use Redis or a database
const SESSIONS: Map<string, CheckoutSession> = new Map();

// ============================================
// 🔍 ENDPOINT 1: UCP DISCOVERY
// ============================================
// This is THE MOST CRITICAL endpoint for UCP!
// AI agents visit /.well-known/ucp to discover:
// 1. "Are you a UCP store?"
// 2. "What can you do?"
// 3. "Where should I send requests?"

app.get('/.well-known/ucp', (req: Request, res: Response) => {
  console.log('🤖 Agent discovered our store!');
  
  const discovery: UCPDiscovery = {
    ucp: {
      version: "2026-01-11",           // UCP spec version
      services: {
        "dev.ucp.shopping": {
          version: "2026-01-11",
          rest: {
            endpoint: SERVER_URL       // Tell agents where to shop
          }
        }
      },
      capabilities: [
        {
          name: "dev.ucp.shopping.checkout",
          version: "2026-01-11"
        }
      ]
    }
  };
  
  res.json(discovery);
});

// ============================================
// 🛍️ ENDPOINT 2: LIST PRODUCTS
// ============================================
// Optional but helpful - lets agents browse your catalog

app.get('/products', (req: Request, res: Response) => {
  console.log('🤖 Agent is browsing products');
  
  // Only show products that are in stock
  const availableProducts = PRODUCT_CATALOG.filter(p => p.in_stock);
  
  res.json({
    products: availableProducts,
    total: availableProducts.length
  });
});

// ============================================
// 🛒 ENDPOINT 3: CREATE CHECKOUT SESSION
// ============================================
// This is where the magic happens!
// When an AI agent wants to buy something, they POST here

app.post('/checkout-sessions', (req: Request, res: Response) => {
  const body: CreateCheckoutRequest = req.body;
  
  console.log('🛒 Agent wants to checkout:', JSON.stringify(body.line_items, null, 2));
  
  // Validate the request
  if (!body.line_items || body.line_items.length === 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'line_items cannot be empty'
    });
  }
  
  // Calculate total and validate products
  let totalCents = 0;
  const validatedItems: LineItem[] = [];
  
  for (const item of body.line_items) {
    // Find the product in our catalog
    const product = PRODUCT_CATALOG.find(p => p.id === item.item.id);
    
    if (!product) {
      return res.status(400).json({
        error: 'Invalid Product',
        message: `Product ${item.item.id} not found`
      });
    }
    
    if (!product.in_stock) {
      return res.status(400).json({
        error: 'Out of Stock',
        message: `${product.title} is currently out of stock`
      });
    }
    
    // Calculate price
    totalCents += product.price * item.quantity;
    
    // Add to validated items with full title
    validatedItems.push({
      item: {
        id: product.id,
        title: product.title
      },
      quantity: item.quantity
    });
    
    console.log(`  ✅ ${item.quantity}x ${product.title} ($${(product.price / 100).toFixed(2)} each)`);
  }
  
  console.log(`  💰 Total: $${(totalCents / 100).toFixed(2)}`);
  
  // Create a unique session ID
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Build the total amount object
  const total: MoneyAmount = {
    amount: totalCents.toString(),
    currency: "USD"
  };
  
  // Create the checkout session
  const session: CheckoutSession = {
    id: sessionId,
    status: 'incomplete',
    line_items: validatedItems,
    total: total,
    payment_capabilities: [
      {
        type: 'card',
        brands: ['visa', 'mastercard', 'amex']
      }
    ],
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // Expires in 30 mins
  };
  
  // Store it in memory
  SESSIONS.set(sessionId, session);
  
  console.log(`  🎫 Created session: ${sessionId}`);
  
  // Send the session back to the agent
  res.status(201).json(session);
});

// ============================================
// 📋 ENDPOINT 4: GET CHECKOUT SESSION
// ============================================
// Let agents check the status of their checkout

app.get('/checkout-sessions/:sessionId', (req: Request, res: Response) => {
  const sessionId = req.params.sessionId as string;  // ← Added type assertion
  
  const session = SESSIONS.get(sessionId);
  
  if (!session) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Session ${sessionId} does not exist`
    });
  }
  
  console.log(`📋 Agent checking session: ${sessionId}`);
  res.json(session);
});

// ============================================
// 💳 ENDPOINT 5: COMPLETE CHECKOUT (Simulate Payment)
// ============================================
// In a real store, this would integrate with Stripe/PayPal
// For learning, we'll just mark it as complete

app.post('/checkout-sessions/:sessionId/complete', (req: Request, res: Response) => {
  const sessionId = req.params.sessionId as string;  // ← Added type assertion
  
  const session = SESSIONS.get(sessionId);
  
  if (!session) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Session ${sessionId} does not exist`
    });
  }
  
  if (session.status === 'complete') {
    return res.status(400).json({
      error: 'Already Complete',
      message: 'This session has already been completed'
    });
  }
  
  // Mark as complete
  session.status = 'complete';
  SESSIONS.set(sessionId, session);
  
  console.log(`✅ Payment completed for session: ${sessionId}`);
  console.log(`   Total charged: $${(parseInt(session.total.amount) / 100).toFixed(2)}`);
  
  res.json({
    success: true,
    session: session,
    message: 'Payment processed successfully!'
  });
});

// ============================================
// 🏥 HEALTH CHECK
// ============================================
// Simple endpoint to check if the server is running

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ============================================
// 🚀 START THE SERVER
// ============================================
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🏪 UCP BEGINNER TOOLKIT - STORE SERVER');
  console.log('='.repeat(60));
  console.log(`✅ Server running on: ${SERVER_URL}`);
  console.log(`🔍 Discovery URL: ${SERVER_URL}/.well-known/ucp`);
  console.log(`📦 Products available: ${PRODUCT_CATALOG.filter(p => p.in_stock).length}`);
  console.log('\n💡 Quick Test Commands:');
  console.log(`   curl ${SERVER_URL}/.well-known/ucp`);
  console.log(`   curl ${SERVER_URL}/products`);
  console.log('='.repeat(60) + '\n');
});