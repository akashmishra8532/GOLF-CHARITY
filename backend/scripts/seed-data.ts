import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../src/models/User";
import { Charity } from "../src/models/Charity";
import { Score } from "../src/models/Score";
import { Subscription } from "../src/models/Subscription";
import { env } from "../src/config/env";

async function seedData() {
  try {
    // Connect to database
    if (env.mongoUri) {
      await mongoose.connect(env.mongoUri);
      console.log("Connected to MongoDB");
    } else {
      console.log("No MongoDB URI provided, skipping seed");
      return;
    }

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Charity.deleteMany({}),
      Score.deleteMany({}),
      Subscription.deleteMany({}),
    ]);
    console.log("Cleared existing data");

    // Create charities
    const charities = await Charity.create([
      {
        name: "Golf Foundation",
        slug: "golf-foundation",
        description: "Supporting junior golf programs and making golf accessible to underserved communities.",
        imageUrl: "/assets/charities/golf-foundation.jpg",
      },
      {
        name: "Green Sports Initiative",
        slug: "green-sports-initiative",
        description: "Promoting sustainable practices in golf courses and sports facilities worldwide.",
        imageUrl: "/assets/charities/green-sports.jpg",
      },
      {
        name: "Youth Golf Academy",
        slug: "youth-golf-academy",
        description: "Providing free golf training and equipment to young aspiring golfers from all backgrounds.",
        imageUrl: "/assets/charities/youth-golf.jpg",
      },
      {
        name: "Veterans Golf Association",
        slug: "veterans-golf-association",
        description: "Helping veterans rehabilitate and connect through the therapeutic power of golf.",
        imageUrl: "/assets/charities/veterans-golf.jpg",
      },
      {
        name: "Golf for Health",
        slug: "golf-for-health",
        description: "Using golf as a platform to promote physical and mental health awareness.",
        imageUrl: "/assets/charities/golf-health.jpg",
      },
    ]);
    console.log("Created charities");

    // Create users
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const users = await User.create([
      {
        email: "admin@golfcharity.com",
        name: "Admin User",
        passwordHash: hashedPassword,
        role: "Admin",
        charityId: charities[0]._id,
        contributionPercent: 15,
      },
      {
        email: "john.doe@example.com",
        name: "John Doe",
        passwordHash: hashedPassword,
        role: "User",
        charityId: charities[1]._id,
        contributionPercent: 20,
      },
      {
        email: "jane.smith@example.com",
        name: "Jane Smith",
        passwordHash: hashedPassword,
        role: "User",
        charityId: charities[2]._id,
        contributionPercent: 10,
      },
      {
        email: "mike.wilson@example.com",
        name: "Mike Wilson",
        passwordHash: hashedPassword,
        role: "User",
        charityId: charities[3]._id,
        contributionPercent: 25,
      },
      {
        email: "sarah.jones@example.com",
        name: "Sarah Jones",
        passwordHash: hashedPassword,
        role: "User",
        charityId: charities[4]._id,
        contributionPercent: 12,
      },
    ]);
    console.log("Created users");

    // Create subscriptions for regular users
    const subscriptions = await Subscription.create([
      {
        userId: users[1]._id, // John Doe
        stripeCustomerId: "cus_test_john",
        stripeSubscriptionId: "sub_test_john",
        planInterval: "monthly",
        status: "active",
        currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        amountPerMonthCents: 1000,
      },
      {
        userId: users[2]._id, // Jane Smith
        stripeCustomerId: "cus_test_jane",
        stripeSubscriptionId: "sub_test_jane",
        planInterval: "yearly",
        status: "active",
        currentPeriodStart: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        currentPeriodEnd: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000), // 305 days from now
        amountPerMonthCents: 833, // 10000 yearly / 12 months
      },
      {
        userId: users[3]._id, // Mike Wilson
        stripeCustomerId: "cus_test_mike",
        stripeSubscriptionId: "sub_test_mike",
        planInterval: "monthly",
        status: "active",
        currentPeriodStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        currentPeriodEnd: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        amountPerMonthCents: 1000,
      },
      {
        userId: users[4]._id, // Sarah Jones
        stripeCustomerId: "cus_test_sarah",
        stripeSubscriptionId: "sub_test_sarah",
        planInterval: "monthly",
        status: "expired",
        currentPeriodStart: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        currentPeriodEnd: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        amountPerMonthCents: 1000,
      },
    ]);
    console.log("Created subscriptions");

    // Create scores for users
    const scores = [];
    const now = new Date();
    
    // John Doe's scores
    for (let i = 0; i < 5; i++) {
      scores.push({
        userId: users[1]._id,
        value: Math.floor(Math.random() * 30) + 15, // Random score between 15-45
        date: new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000), // Weekly intervals
      });
    }
    
    // Jane Smith's scores
    for (let i = 0; i < 5; i++) {
      scores.push({
        userId: users[2]._id,
        value: Math.floor(Math.random() * 25) + 20, // Random score between 20-45
        date: new Date(now.getTime() - i * 5 * 24 * 60 * 60 * 1000), // 5-day intervals
      });
    }
    
    // Mike Wilson's scores
    for (let i = 0; i < 5; i++) {
      scores.push({
        userId: users[3]._id,
        value: Math.floor(Math.random() * 20) + 18, // Random score between 18-38
        date: new Date(now.getTime() - i * 10 * 24 * 60 * 60 * 1000), // 10-day intervals
      });
    }
    
    // Sarah Jones's scores (expired user)
    for (let i = 0; i < 5; i++) {
      scores.push({
        userId: users[4]._id,
        value: Math.floor(Math.random() * 35) + 10, // Random score between 10-45
        date: new Date(now.getTime() - i * 6 * 24 * 60 * 60 * 1000), // 6-day intervals
      });
    }

    await Score.create(scores);
    console.log("Created scores");

    console.log("\n✅ Seed data created successfully!");
    console.log("\n📧 Test Accounts:");
    console.log("Admin: admin@golfcharity.com / password123");
    console.log("User 1: john.doe@example.com / password123 (Active Monthly)");
    console.log("User 2: jane.smith@example.com / password123 (Active Yearly)");
    console.log("User 3: mike.wilson@example.com / password123 (Active Monthly)");
    console.log("User 4: sarah.jones@example.com / password123 (Expired)");

  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedData();
}

export { seedData };
