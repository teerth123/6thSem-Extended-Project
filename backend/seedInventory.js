import mongoose from "mongoose";
import dotenv from "dotenv";
import { InventoryItem } from "./Database model/inventoryDB.js";

dotenv.config();

const mongodb_url = process.env.mongodb_url;

// Sample medical inventory items
const sampleItems = [
  {
    name: "Paracetamol 500mg",
    category: "medicine",
    description: "Pain relief and fever reducer tablets",
    manufacturer: "Pharma Corp",
    batchNumber: "PC2024001",
    expiryDate: new Date("2025-12-31"),
    unitPrice: 0.50,
    currency: "USD"
  },
  {
    name: "Digital Thermometer",
    category: "device",
    description: "Digital infrared thermometer for accurate temperature readings",
    manufacturer: "MedTech Solutions",
    batchNumber: "MT2024015",
    expiryDate: new Date("2027-06-30"),
    unitPrice: 25.00,
    currency: "USD"
  },
  {
    name: "Surgical Gloves (Box of 100)",
    category: "supplies",
    description: "Latex-free disposable surgical gloves",
    manufacturer: "SafeHands Medical",
    batchNumber: "SH2024025",
    expiryDate: new Date("2026-03-15"),
    unitPrice: 12.99,
    currency: "USD"
  },
  {
    name: "Amoxicillin 250mg",
    category: "medicine", 
    description: "Antibiotic capsules for bacterial infections",
    manufacturer: "AntiBio Pharma",
    batchNumber: "AB2024008",
    expiryDate: new Date("2025-09-30"),
    unitPrice: 0.75,
    currency: "USD"
  },
  {
    name: "Blood Pressure Monitor",
    category: "equipment",
    description: "Digital automatic blood pressure monitor",
    manufacturer: "CardioTech",
    batchNumber: "CT2024012",
    expiryDate: new Date("2028-01-15"),
    unitPrice: 89.99,
    currency: "USD"
  },
  {
    name: "Insulin Syringes (Pack of 10)",
    category: "supplies",
    description: "1ml insulin syringes with ultra-fine needles",
    manufacturer: "DiabCare",
    batchNumber: "DC2024030",
    expiryDate: new Date("2026-08-20"),
    unitPrice: 8.50,
    currency: "USD"
  },
  {
    name: "Ibuprofen 400mg",
    category: "medicine",
    description: "Anti-inflammatory pain relief tablets",
    manufacturer: "Pharma Corp",
    batchNumber: "PC2024002",
    expiryDate: new Date("2025-11-30"),
    unitPrice: 0.60,
    currency: "USD"
  },
  {
    name: "Stethoscope",
    category: "equipment",
    description: "Professional dual-head stethoscope",
    manufacturer: "MediScope Pro",
    batchNumber: "MSP2024005",
    expiryDate: new Date("2030-12-31"),
    unitPrice: 65.00,
    currency: "USD"
  }
];

async function seedInventory() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongodb_url);
    console.log("Connected to MongoDB");
    
    // Clear existing inventory items (optional - remove this line if you want to keep existing items)
    await InventoryItem.deleteMany({});
    console.log("Cleared existing inventory items");
    
    // Insert sample items
    const result = await InventoryItem.insertMany(sampleItems);
    console.log(`Successfully added ${result.length} inventory items`);
    
    // Display the added items
    result.forEach(item => {
      console.log(`- ${item.name} (${item.category}) - $${item.unitPrice}`);
    });
    
  } catch (error) {
    console.error("Error seeding inventory:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the seed function
seedInventory();