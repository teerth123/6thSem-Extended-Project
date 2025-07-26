import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./Database model/userDB.js";
import { Conversation } from "./Database model/conversationDB.js";
import { Message } from "./Database model/messageDB.js";
import { InventoryItem, Order, InventoryTransaction } from "./Database model/inventoryDB.js";
import { Appointment } from "./Database model/appointmentDB.js";
import { VideoTracking } from "./Database model/videotrackingDB.js";

dotenv.config();

const mongodb_url = process.env.mongodb_url;

// Sample Users Data
const sampleUsers = [
  {
    username: "dr_smith",
    firstname: "John",
    lastname: "Smith",
    email: "john.smith@email.com",
    password: "password123",
    role: "doctor",
    yearsofExperience: 15,
    shortBio: "Experienced cardiologist specializing in heart surgery and preventive care.",
    worksAt: "City General Hospital",
    connections: [],
    pendingConnections: [],
    connectionRequests: []
  },
  {
    username: "dr_johnson",
    firstname: "Sarah",
    lastname: "Johnson",
    email: "sarah.johnson@email.com",
    password: "password123",
    role: "doctor",
    yearsofExperience: 8,
    shortBio: "Pediatrician focused on child healthcare and development.",
    worksAt: "Children's Medical Center",
    connections: [],
    pendingConnections: [],
    connectionRequests: []
  },
  {
    username: "mr_davis",
    firstname: "Michael",
    lastname: "Davis",
    email: "michael.davis@pharma.com",
    password: "password123",
    role: "medical_representative",
    yearsofExperience: 5,
    shortBio: "Medical representative for pharmaceutical products and medical devices.",
    worksAt: "Pharma Solutions Inc",
    connections: [],
    pendingConnections: [],
    connectionRequests: []
  },
  {
    username: "dr_wilson",
    firstname: "Emily",
    lastname: "Wilson",
    email: "emily.wilson@email.com",
    password: "password123",
    role: "doctor",
    yearsofExperience: 12,
    shortBio: "Dermatologist specializing in skin conditions and cosmetic procedures.",
    worksAt: "Skin Care Clinic",
    connections: [],
    pendingConnections: [],
    connectionRequests: []
  },
  {
    username: "mr_brown",
    firstname: "Robert",
    lastname: "Brown",
    email: "robert.brown@medtech.com",
    password: "password123",
    role: "medical_representative",
    yearsofExperience: 7,
    shortBio: "Specialist in medical equipment and diagnostic devices.",
    worksAt: "MedTech Solutions",
    connections: [],
    pendingConnections: [],
    connectionRequests: []
  },
  {
    username: "dr_garcia",
    firstname: "Maria",
    lastname: "Garcia",
    email: "maria.garcia@email.com",
    password: "password123",
    role: "doctor",
    yearsofExperience: 20,
    shortBio: "Senior neurologist with expertise in brain disorders and stroke treatment.",
    worksAt: "Neurological Institute",
    connections: [],
    pendingConnections: [],
    connectionRequests: []
  },
  {
    username: "mr_lee",
    firstname: "David",
    lastname: "Lee",
    email: "david.lee@biotech.com",
    password: "password123",
    role: "medical_representative",
    yearsofExperience: 3,
    shortBio: "Biotechnology specialist focusing on innovative medical solutions.",
    worksAt: "BioTech Innovations",
    connections: [],
    pendingConnections: [],
    connectionRequests: []
  },
  {
    username: "dr_anderson",
    firstname: "James",
    lastname: "Anderson",
    email: "james.anderson@email.com",
    password: "password123",
    role: "doctor",
    yearsofExperience: 10,
    shortBio: "Orthopedic surgeon specializing in joint replacement and sports medicine.",
    worksAt: "Sports Medicine Center",
    connections: [],
    pendingConnections: [],
    connectionRequests: []
  }
];

// Sample Inventory Items
const sampleInventoryItems = [
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
    name: "Stethoscope",
    category: "equipment",
    description: "Professional dual-head stethoscope",
    manufacturer: "MediScope Pro",
    batchNumber: "MSP2024005",
    expiryDate: new Date("2030-12-31"),
    unitPrice: 65.00,
    currency: "USD"
  },
  {
    name: "MRI Scanner",
    category: "equipment",
    description: "High-resolution magnetic resonance imaging scanner",
    manufacturer: "ImageTech Pro",
    batchNumber: "ITP2024001",
    expiryDate: new Date("2035-01-01"),
    unitPrice: 1250000.00,
    currency: "USD"
  }
];

async function seedDummyData() {
  try {
    console.log("Starting dummy data seeding...");
    
    // Connect to MongoDB
    await mongoose.connect(mongodb_url);
    console.log("Connected to MongoDB");
    
    // Clear existing data
    await User.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await InventoryItem.deleteMany({});
    await Order.deleteMany({});
    await InventoryTransaction.deleteMany({});
    await Appointment.deleteMany({});
    await VideoTracking.deleteMany({});
    
    // Drop collections to reset indexes
    try {
      await mongoose.connection.db.collection('appointments').drop();
    } catch (e) {
      // Collection might not exist
    }
    
    console.log("Cleared existing data");

    // 1. Create Users
    const users = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${users.length} users`);

    // Organize users by role
    const doctors = users.filter(user => user.role === "doctor");
    const medicalReps = users.filter(user => user.role === "medical_representative");

    // 2. Create connections between users
    // Connect first doctor with first medical rep
    if (doctors.length > 0 && medicalReps.length > 0) {
      doctors[0].connections.push(medicalReps[0]._id);
      medicalReps[0].connections.push(doctors[0]._id);
      await doctors[0].save();
      await medicalReps[0].save();

      // Add more connections
      if (doctors.length > 1 && medicalReps.length > 1) {
        doctors[1].connections.push(medicalReps[1]._id);
        medicalReps[1].connections.push(doctors[1]._id);
        await doctors[1].save();
        await medicalReps[1].save();
      }

      // Some pending connections
      if (doctors.length > 2 && medicalReps.length > 2) {
        doctors[2].pendingConnections.push(medicalReps[2]._id);
        medicalReps[2].connectionRequests.push(doctors[2]._id);
        await doctors[2].save();
        await medicalReps[2].save();
      }
    }
    console.log("✅ Created user connections");

    // 3. Create Inventory Items
    const inventoryItems = await InventoryItem.insertMany(sampleInventoryItems);
    console.log(`✅ Created ${inventoryItems.length} inventory items`);

    // 4. Create Conversations
    const conversations = [];
    if (doctors.length > 0 && medicalReps.length > 0) {
      // Conversation between first doctor and first medical rep
      const conv1 = new Conversation({
        participants: [doctors[0]._id, medicalReps[0]._id],
        lastMessage: "Hello, I need some medical supplies for my clinic.",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        unreadCount: new Map([[doctors[0]._id.toString(), 0], [medicalReps[0]._id.toString(), 1]])
      });
      conversations.push(conv1);

      // Conversation between second doctor and second medical rep
      if (doctors.length > 1 && medicalReps.length > 1) {
        const conv2 = new Conversation({
          participants: [doctors[1]._id, medicalReps[1]._id],
          lastMessage: "Thank you for the quick delivery!",
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          unreadCount: new Map([[doctors[1]._id.toString(), 1], [medicalReps[1]._id.toString(), 0]])
        });
        conversations.push(conv2);
      }

      // Group conversation
      if (doctors.length > 2) {
        const conv3 = new Conversation({
          participants: [doctors[0]._id, doctors[1]._id, doctors[2]._id],
          lastMessage: "Let's discuss the new treatment protocols.",
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          unreadCount: new Map([
            [doctors[0]._id.toString(), 0], 
            [doctors[1]._id.toString(), 2], 
            [doctors[2]._id.toString(), 1]
          ])
        });
        conversations.push(conv3);
      }
    }

    const savedConversations = await Conversation.insertMany(conversations);
    console.log(`✅ Created ${savedConversations.length} conversations`);

    // 5. Create Messages
    const messages = [];
    if (savedConversations.length > 0) {
      // Messages for first conversation
      const conv1 = savedConversations[0];
      messages.push(
        new Message({
          conversationId: conv1._id,
          sender: doctors[0]._id,
          text: "Hello, I need some medical supplies for my clinic.",
          type: "text",
          read: true
        }),
        new Message({
          conversationId: conv1._id,
          sender: medicalReps[0]._id,
          text: "Hello Dr. Smith! I'd be happy to help. What specific supplies do you need?",
          type: "text",
          read: true
        }),
        new Message({
          conversationId: conv1._id,
          sender: doctors[0]._id,
          text: "I need surgical gloves, digital thermometers, and some paracetamol.",
          type: "text",
          read: true
        }),
        new Message({
          conversationId: conv1._id,
          sender: medicalReps[0]._id,
          text: "Perfect! I can arrange those items for you. Let me prepare a quote.",
          type: "text",
          read: false
        })
      );

      // Messages for second conversation if it exists
      if (savedConversations.length > 1) {
        const conv2 = savedConversations[1];
        messages.push(
          new Message({
            conversationId: conv2._id,
            sender: medicalReps[1]._id,
            text: "Your order has been delivered successfully!",
            type: "text",
            read: true
          }),
          new Message({
            conversationId: conv2._id,
            sender: doctors[1]._id,
            text: "Thank you for the quick delivery! Everything looks great.",
            type: "text",
            read: false
          })
        );
      }

      // Messages for group conversation if it exists
      if (savedConversations.length > 2) {
        const conv3 = savedConversations[2];
        messages.push(
          new Message({
            conversationId: conv3._id,
            sender: doctors[0]._id,
            text: "Let's discuss the new treatment protocols.",
            type: "text",
            read: true
          }),
          new Message({
            conversationId: conv3._id,
            sender: doctors[1]._id,
            text: "I've reviewed the latest guidelines. They look promising.",
            type: "text",
            read: false
          }),
          new Message({
            conversationId: conv3._id,
            sender: doctors[2]._id,
            text: "I agree. Should we schedule a meeting to discuss implementation?",
            type: "text",
            read: false
          })
        );
      }
    }

    const savedMessages = await Message.insertMany(messages);
    console.log(`✅ Created ${savedMessages.length} messages`);

    // 6. Create Orders
    const orders = [];
    if (doctors.length > 0 && medicalReps.length > 0 && inventoryItems.length > 0 && savedConversations.length > 0) {
      // Order 1: Doctor ordering supplies
      const order1 = new Order({
        orderNumber: `ORD-${Date.now()}-0001`,
        doctorId: doctors[0]._id,
        mrId: medicalReps[0]._id,
        conversationId: savedConversations[0]._id,
        items: [
          {
            inventoryItem: inventoryItems[2]._id, // Surgical Gloves
            itemName: "Surgical Gloves (Box of 100)",
            quantity: 5,
            unitPrice: 12.99,
            totalPrice: 64.95
          },
          {
            inventoryItem: inventoryItems[1]._id, // Digital Thermometer
            itemName: "Digital Thermometer",
            quantity: 2,
            unitPrice: 25.00,
            totalPrice: 50.00
          },
          {
            inventoryItem: inventoryItems[0]._id, // Paracetamol
            itemName: "Paracetamol 500mg",
            quantity: 100,
            unitPrice: 0.50,
            totalPrice: 50.00
          }
        ],
        status: "confirmed",
        requiredDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
        deliveryAddress: "City General Hospital, 123 Medical St, City",
        notes: "Urgent delivery required for upcoming surgery schedule."
      });
      orders.push(order1);

      // Order 2: Another doctor's order
      if (doctors.length > 1 && medicalReps.length > 1) {
        const order2 = new Order({
          orderNumber: `ORD-${Date.now()}-0002`,
          doctorId: doctors[1]._id,
          mrId: medicalReps[1]._id,
          conversationId: savedConversations[1]._id,
          items: [
            {
              inventoryItem: inventoryItems[4]._id, // Blood Pressure Monitor
              itemName: "Blood Pressure Monitor",
              quantity: 3,
              unitPrice: 89.99,
              totalPrice: 269.97
            },
            {
              inventoryItem: inventoryItems[6]._id, // Stethoscope
              itemName: "Stethoscope",
              quantity: 2,
              unitPrice: 65.00,
              totalPrice: 130.00
            }
          ],
          status: "delivered",
          requiredDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
          deliveryAddress: "Children's Medical Center, 456 Pediatric Ave, City",
          notes: "For new pediatric examination rooms."
        });
        orders.push(order2);
      }

      // Order 3: Pending order
      if (doctors.length > 2) {
        const order3 = new Order({
          orderNumber: `ORD-${Date.now()}-0003`,
          doctorId: doctors[2]._id,
          mrId: medicalReps[0]._id,
          conversationId: savedConversations[0]._id,
          items: [
            {
              inventoryItem: inventoryItems[3]._id, // Amoxicillin
              itemName: "Amoxicillin 250mg",
              quantity: 200,
              unitPrice: 0.75,
              totalPrice: 150.00
            }
          ],
          status: "pending",
          requiredDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 14 days from now
          deliveryAddress: "Skin Care Clinic, 789 Dermatology Blvd, City",
          notes: "For treating bacterial skin infections."
        });
        orders.push(order3);
      }
    }

    const savedOrders = await Order.insertMany(orders);
    console.log(`✅ Created ${savedOrders.length} orders`);

    // 7. Create Inventory Transactions
    const transactions = [];
    savedOrders.forEach(order => {
      // Transaction for order placement
      transactions.push(new InventoryTransaction({
        orderId: order._id,
        userId: order.doctorId,
        transactionType: "order_placed",
        description: `Order ${order.orderNumber} placed by doctor`,
        metadata: new Map([
          ["orderNumber", order.orderNumber],
          ["totalAmount", order.totalAmount.toString()],
          ["itemCount", order.items.length.toString()]
        ])
      }));

      // Transaction for order confirmation (if order is confirmed or delivered)
      if (order.status === "confirmed" || order.status === "delivered") {
        transactions.push(new InventoryTransaction({
          orderId: order._id,
          userId: order.mrId,
          transactionType: "order_confirmed",
          description: `Order ${order.orderNumber} confirmed by medical representative`,
          metadata: new Map([
            ["orderNumber", order.orderNumber],
            ["confirmationDate", new Date().toISOString()]
          ])
        }));
      }

      // Transaction for delivery (if order is delivered)
      if (order.status === "delivered") {
        transactions.push(new InventoryTransaction({
          orderId: order._id,
          userId: order.mrId,
          transactionType: "item_delivered",
          description: `Order ${order.orderNumber} delivered successfully`,
          metadata: new Map([
            ["orderNumber", order.orderNumber],
            ["deliveryDate", new Date().toISOString()],
            ["deliveryAddress", order.deliveryAddress]
          ])
        }));
      }
    });

    const savedTransactions = await InventoryTransaction.insertMany(transactions);
    console.log(`✅ Created ${savedTransactions.length} inventory transactions`);

    // 8. Create Appointments
    const appointments = [];
    if (doctors.length > 0 && medicalReps.length > 0) {
      // Appointment 1: Product demonstration
      appointments.push(new Appointment({
        doctorId: doctors[0]._id,
        mrId: medicalReps[0]._id,
        title: "New Medical Equipment Demonstration",
        description: "Demonstration of latest blood pressure monitors and digital thermometers",
        appointmentDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
        startTime: "10:00",
        endTime: "11:30",
        status: "confirmed",
        meetingType: "in-person",
        location: "City General Hospital - Conference Room A",
        notes: "Please bring product catalogs and pricing information",
        priority: "high",
        reminders: [
          {
            reminderTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // 1 day before
            sent: false
          }
        ]
      }));

      // Appointment 2: Virtual consultation
      if (doctors.length > 1 && medicalReps.length > 1) {
        appointments.push(new Appointment({
          doctorId: doctors[1]._id,
          mrId: medicalReps[1]._id,
          title: "Pediatric Equipment Consultation",
          description: "Discussion about specialized pediatric medical equipment needs",
          appointmentDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days from now
          startTime: "14:00",
          endTime: "15:00",
          status: "scheduled",
          meetingType: "video-call",
          meetingLink: "https://meet.google.com/abc-defg-hij",
          notes: "Focus on child-friendly equipment designs",
          priority: "medium",
          reminders: [
            {
              reminderTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4), // 1 day before
              sent: false
            }
          ]
        }));
      }

      // Appointment 3: Follow-up meeting
      if (doctors.length > 2) {
        appointments.push(new Appointment({
          doctorId: doctors[2]._id,
          mrId: medicalReps[0]._id,
          title: "Order Follow-up and Inventory Review",
          description: "Review delivered items and discuss future requirements",
          appointmentDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
          startTime: "09:00",
          endTime: "10:00",
          status: "scheduled",
          meetingType: "phone-call",
          notes: "Discuss dermatology-specific supplies",
          priority: "low"
        }));
      }

      // Appointment 4: Completed appointment
      appointments.push(new Appointment({
        doctorId: doctors[0]._id,
        mrId: medicalReps[1]._id,
        title: "Equipment Training Session",
        description: "Training on new diagnostic equipment usage",
        appointmentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        startTime: "15:00",
        endTime: "17:00",
        status: "completed",
        meetingType: "in-person",
        location: "City General Hospital - Training Room",
        notes: "Training completed successfully. Staff certified on new equipment.",
        priority: "high"
      }));
    }

    const savedAppointments = await Appointment.insertMany(appointments);
    console.log(`✅ Created ${savedAppointments.length} appointments`);

    // 9. Create Video Tracking Data
    const videoTrackingData = [];
    if (users.length > 0) {
      // Sample video tracking for medical training videos
      const sampleVideos = [
        {
          videoId: "med-training-001",
          title: "Proper Injection Techniques"
        },
        {
          videoId: "med-training-002", 
          title: "Blood Pressure Measurement"
        },
        {
          videoId: "med-training-003",
          title: "Surgical Glove Safety Protocol"
        },
        {
          videoId: "med-training-004",
          title: "Emergency Response Procedures"
        }
      ];

      users.forEach((user, index) => {
        sampleVideos.forEach((video, videoIndex) => {
          // Create some viewing data for each user
          if ((index + videoIndex) % 3 === 0) { // Only create data for some combinations
            const watchPercentage = Math.floor(Math.random() * 100) + 1;
            const totalWatchTime = Math.floor(Math.random() * 1800) + 300; // 5-35 minutes
            
            videoTrackingData.push(new VideoTracking({
              videoId: video.videoId,
              userId: user._id,
              totalWatchTime: totalWatchTime,
              watchPercentage: watchPercentage,
              completed: watchPercentage >= 90,
              segments: [
                {
                  start: 0,
                  end: Math.floor(totalWatchTime * 0.4)
                },
                {
                  start: Math.floor(totalWatchTime * 0.5),
                  end: totalWatchTime
                }
              ],
              interactions: [
                {
                  type: "play",
                  videoTime: 0,
                  timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7)) // Random time in last week
                },
                {
                  type: "pause",
                  videoTime: Math.floor(totalWatchTime * 0.4),
                  timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7))
                },
                {
                  type: "seek",
                  videoTime: Math.floor(totalWatchTime * 0.5),
                  from: Math.floor(totalWatchTime * 0.4),
                  to: Math.floor(totalWatchTime * 0.5),
                  timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7))
                }
              ],
              watchDate: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)) // Random date in last month
            }));
          }
        });
      });
    }

    const savedVideoTracking = await VideoTracking.insertMany(videoTrackingData);
    console.log(`✅ Created ${savedVideoTracking.length} video tracking records`);

    // Summary
    console.log("\n🎉 DUMMY DATA SEEDING COMPLETED!");
    console.log("================================");
    console.log(`👥 Users: ${users.length}`);
    console.log(`   - Doctors: ${doctors.length}`);
    console.log(`   - Medical Representatives: ${medicalReps.length}`);
    console.log(`💬 Conversations: ${savedConversations.length}`);
    console.log(`📨 Messages: ${savedMessages.length}`);
    console.log(`📦 Inventory Items: ${inventoryItems.length}`);
    console.log(`📋 Orders: ${savedOrders.length}`);
    console.log(`📊 Transactions: ${savedTransactions.length}`);
    console.log(`📅 Appointments: ${savedAppointments.length}`);
    console.log(`🎥 Video Tracking: ${savedVideoTracking.length}`);
    console.log("================================");

    // Display sample data
    console.log("\n📋 SAMPLE USERS:");
    users.slice(0, 3).forEach(user => {
      console.log(`  - ${user.firstname} ${user.lastname} (${user.username}) - ${user.role}`);
    });

    console.log("\n📦 SAMPLE ORDERS:");
    savedOrders.forEach(order => {
      console.log(`  - ${order.orderNumber}: $${order.totalAmount} - ${order.status}`);
    });

    console.log("\n📅 SAMPLE APPOINTMENTS:");
    savedAppointments.forEach(appointment => {
      console.log(`  - ${appointment.title} - ${appointment.status} (${appointment.appointmentDate.toDateString()})`);
    });

  } catch (error) {
    console.error("❌ Error seeding dummy data:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔐 Database connection closed");
  }
}

// Run the seed function
seedDummyData();