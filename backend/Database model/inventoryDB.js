import mongoose from "mongoose";
import { Schema, model } from "mongoose";

// Inventory Item Schema - for tracking medical supplies
const InventoryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['medicine', 'equipment', 'supplies', 'device', 'other']
  },
  description: {
    type: String,
    default: ''
  },
  manufacturer: {
    type: String,
    default: ''
  },
  batchNumber: {
    type: String,
    default: ''
  },
  expiryDate: {
    type: Date
  },
  unitPrice: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  }
}, { timestamps: true });

// Order Schema - for tracking orders between doctors and MRs
const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  items: [{
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true
    },
    itemName: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: Number,
    totalPrice: Number
  }],
  totalAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'received'],
    default: 'pending'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  requiredDate: {
    type: Date
  },
  deliveryAddress: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Inventory Transaction Schema - for tracking inventory movements
const InventoryTransactionSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionType: {
    type: String,
    enum: ['order_placed', 'order_confirmed', 'item_shipped', 'item_delivered', 'order_cancelled'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  }
}, { timestamps: true });

// Generate unique order number
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    try {
      const count = await this.constructor.countDocuments();
      this.orderNumber = `ORD-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating order number:', error);
      // Fallback order number generation
      this.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  next();
});

// Calculate total amount before saving
OrderSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.totalPrice || (item.quantity * (item.unitPrice || 0)));
  }, 0);
  next();
});

export const InventoryItem = model('InventoryItem', InventoryItemSchema);
export const Order = model('Order', OrderSchema);
export const InventoryTransaction = model('InventoryTransaction', InventoryTransactionSchema);