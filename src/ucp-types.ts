// src/ucp-types.ts
// Simplified UCP Types for Beginners
// Based on UCP 2026-01-11 specification

/**
 * A product that can be sold in your store
 * Example: A laptop, a book, a coffee, etc.
 */
export interface Product {
  id: string;              // Unique identifier (e.g., "prod_laptop_001")
  title: string;           // Display name (e.g., "MacBook Pro 16-inch")
  description?: string;    // Optional description
  price: number;           // Price in smallest currency unit (cents for USD)
  currency: string;        // Currency code (e.g., "USD", "EUR")
  image_url?: string;      // Optional product image
  in_stock: boolean;       // Is this available to buy?
}

/**
 * A single item in a shopping cart
 * This is what an AI agent sends when they want to buy something
 */
export interface LineItem {
  item: {
    id: string;           // Must match a Product.id from your catalog
    title?: string;       // Optional, for display purposes
  };
  quantity: number;       // How many they want
}

/**
 * Money amount following UCP specification
 * We use strings to avoid floating-point math errors
 * Example: $19.99 = { amount: "1999", currency: "USD" }
 */
export interface MoneyAmount {
  amount: string;         // Amount in smallest unit (cents) as string
  currency: string;       // ISO 4217 currency code
}

/**
 * Payment methods your store accepts
 * This tells AI agents "I can accept Visa/Mastercard cards"
 */
export interface PaymentCapability {
  type: 'card' | 'bank_account' | 'wallet';
  brands?: string[];      // e.g., ['visa', 'mastercard', 'amex']
}

/**
 * The checkout session - the "shopping cart" object
 * This is what you send back to an AI agent when they start shopping
 */
export interface CheckoutSession {
  id: string;                          // Unique session ID (e.g., "sess_abc123")
  status: 'incomplete' | 'complete' | 'expired';  // Current state
  line_items: LineItem[];              // What's in the cart
  total: MoneyAmount;                  // Total price
  payment_capabilities: PaymentCapability[];  // How they can pay
  expires_at?: string;                 // Optional: ISO 8601 timestamp
}

/**
 * UCP Discovery Document
 * This is THE MOST IMPORTANT response - it tells AI agents:
 * "Hi! I'm a UCP store and here's what I can do"
 */
export interface UCPDiscovery {
  ucp: {
    version: string;                   // UCP spec version (e.g., "2026-01-11")
    services: {
      'dev.ucp.shopping': {
        version: string;               // Shopping service version
        rest: {
          endpoint: string;            // Where to send requests (your server URL)
        };
      };
    };
    capabilities: Array<{
      name: string;                    // e.g., "dev.ucp.shopping.checkout"
      version: string;
    }>;
  };
}

/**
 * Request body when creating a checkout session
 * This is what the AI agent sends to your /checkout-sessions endpoint
 */
export interface CreateCheckoutRequest {
  line_items: LineItem[];
  metadata?: Record<string, string>;   // Optional extra data
}