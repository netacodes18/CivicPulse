const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const User = require("./models/User");
const Report = require("./models/Report");
const Comment = require("./models/Comment");
const Announcement = require("./models/Announcement");
const AuditLog = require("./models/AuditLog");
const Category = require("./models/Category");
const Event = require("./models/Event");
const Group = require("./models/Group");
const Notification = require("./models/Notification");

async function clearAndSeedDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI not found in environment variables");
    }

    console.log("📦 Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected.");

    console.log("🧹 Clearing all existing collections...");
    await Promise.all([
      User.deleteMany({}),
      Report.deleteMany({}),
      Comment.deleteMany({}),
      Announcement.deleteMany({}),
      AuditLog.deleteMany({}),
      Category.deleteMany({}),
      Event.deleteMany({}),
      Group.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log("✅ All collections cleared.");

    // Clean uploads directory
    const uploadsDir = path.join(__dirname, "uploads");
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        if (file !== ".gitkeep") {
          try {
            fs.unlinkSync(path.join(uploadsDir, file));
          } catch (e) {
            console.warn(`Could not delete file ${file}:`, e.message);
          }
        }
      }
      console.log("✅ Uploaded image files cleaned from disk.");
    }

    console.log("🌱 Seeding Categories...");
    const defaultCategories = [
      { name: "Roads & Potholes", value: "roads", department: "roads" },
      { name: "Water Supply & Leaks", value: "water", department: "water" },
      { name: "Sanitation & Garbage", value: "sanitation", department: "sanitation" },
      { name: "Electricity & Streetlights", value: "electricity", department: "electricity" },
      { name: "Parks & Public Spaces", value: "other", department: "other" }
    ];
    await Category.insertMany(defaultCategories);
    console.log("✅ Default categories seeded.");

    console.log("👤 Seeding Users (Admins, Moderators, Citizens)...");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    // Super Admin
    const superAdmin = await User.create({
      username: "admin",
      email: "admin@civicpulse.org",
      phone: "+919876543210",
      password: hashedPassword,
      role: "super_admin",
      state: "Maharashtra",
      area: "Mumbai",
      pincode: "400001",
      points: 250
    });

    // Moderators / Department Admins
    const roadsAdmin = await User.create({
      username: "roads_officer",
      email: "roads.admin@civicpulse.org",
      phone: "+919876543211",
      password: hashedPassword,
      role: "moderator",
      department: "roads",
      state: "Maharashtra",
      area: "Mumbai",
      pincode: "400001",
      points: 150
    });

    const waterAdmin = await User.create({
      username: "water_officer",
      email: "water.admin@civicpulse.org",
      phone: "+919876543212",
      password: hashedPassword,
      role: "moderator",
      department: "water",
      state: "Maharashtra",
      area: "Mumbai",
      pincode: "400001",
      points: 130
    });

    // Citizen Users
    const citizen1 = await User.create({
      username: "rahul_mumbai",
      email: "rahul.sharma@example.com",
      phone: "+919812345678",
      password: userPassword,
      role: "user",
      state: "Maharashtra",
      area: "Mumbai",
      pincode: "400001",
      points: 140
    });

    const citizen2 = await User.create({
      username: "priya_patel",
      email: "priya.patel@example.com",
      phone: "+919823456789",
      password: userPassword,
      role: "user",
      state: "Maharashtra",
      area: "Mumbai",
      pincode: "400053",
      points: 110
    });

    const citizen3 = await User.create({
      username: "aarti_kulkarni",
      email: "aarti.k@example.com",
      phone: "+919834567890",
      password: userPassword,
      role: "user",
      state: "Maharashtra",
      area: "Mumbai",
      pincode: "400001",
      points: 85
    });

    const citizen4 = await User.create({
      username: "vikram_singh",
      email: "vikram.s@example.com",
      phone: "+919845678901",
      password: userPassword,
      role: "user",
      state: "Maharashtra",
      area: "Mumbai",
      pincode: "400053",
      points: 60
    });

    const citizen5 = await User.create({
      username: "neha_deshmukh",
      email: "neha.d@example.com",
      phone: "+919856789012",
      password: userPassword,
      role: "user",
      state: "Maharashtra",
      area: "Mumbai",
      pincode: "400001",
      points: 35
    });

    console.log("✅ Users created.");

    console.log("📝 Seeding Reports...");
    const reports = [
      {
        title: "Deep Potholes on Linking Road near Bandra West Station",
        description: "Multiple severe potholes causing massive traffic bottlenecks during peak rush hours and posing a major hazard for two-wheelers at night.",
        category: "roads",
        imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
        status: "in-progress",
        user: citizen1._id,
        state: "Maharashtra",
        area: "Mumbai",
        pincode: "400053",
        upvotes: [citizen2._id, citizen3._id, citizen4._id, citizen5._id],
        coordinates: { lat: 19.0596, lng: 72.8295 },
        assignedTo: roadsAdmin._id,
        assignedDepartment: "roads"
      },
      {
        title: "Main Pipeline Burst Supplying Sector 4 Water Tank",
        description: "Heavy water leakage from a cracked trunk pipeline wasting hundreds of liters of clean drinking water onto SV Road.",
        category: "water",
        imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80",
        status: "resolved",
        user: citizen2._id,
        state: "Maharashtra",
        area: "Mumbai",
        pincode: "400001",
        upvotes: [citizen1._id, citizen3._id, citizen4._id],
        coordinates: { lat: 19.1136, lng: 72.8697 },
        assignedTo: waterAdmin._id,
        assignedDepartment: "water"
      },
      {
        title: "Overflowing Garbage Bins near Municipal Market Gate 2",
        description: "Sanitation waste has not been collected for over 3 days. Strong foul odor and stray animal menace reported by local vendors.",
        category: "sanitation",
        imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
        status: "pending",
        user: citizen3._id,
        state: "Maharashtra",
        area: "Mumbai",
        pincode: "400001",
        upvotes: [citizen1._id, citizen4._id, citizen5._id],
        coordinates: { lat: 19.0176, lng: 72.8561 },
        assignedDepartment: "sanitation"
      },
      {
        title: "Non-Functional Streetlights along Marine Drive Promenade",
        description: "Five consecutive lamp posts are out of order near pillar #18, creating safety risks for evening pedestrians and tourists.",
        category: "electricity",
        imageUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
        status: "in-progress",
        user: citizen4._id,
        state: "Maharashtra",
        area: "Mumbai",
        pincode: "400001",
        upvotes: [citizen1._id, citizen2._id, citizen3._id, citizen5._id],
        coordinates: { lat: 19.0330, lng: 72.8570 },
        assignedDepartment: "electricity"
      },
      {
        title: "Clogged Stormwater Drain ahead of Monsoon Season",
        description: "Plastic trash and construction silt clogging main rainwater drain near the railway subway. Cleared by BMC field crew.",
        category: "roads",
        imageUrl: "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=800&q=80",
        status: "resolved",
        user: citizen1._id,
        state: "Maharashtra",
        area: "Mumbai",
        pincode: "400001",
        upvotes: [citizen3._id, citizen5._id],
        coordinates: { lat: 19.0760, lng: 72.8777 },
        assignedTo: roadsAdmin._id,
        assignedDepartment: "roads"
      },
      {
        title: "Damaged Benches and Broken Fencing at Shivaji Park",
        description: "Heavy storm damaged two public benches and knocked over decorative iron fencing near the jogging track.",
        category: "other",
        imageUrl: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80",
        status: "pending",
        user: citizen5._id,
        state: "Maharashtra",
        area: "Mumbai",
        pincode: "400001",
        upvotes: [citizen1._id, citizen2._id],
        coordinates: { lat: 19.0269, lng: 72.8378 },
        assignedDepartment: "other"
      },
      {
        title: "Fallen Tree Obstructing Lane 2 Traffic",
        description: "Monsoon winds caused a large branch to fall onto the roadway. Municipal emergency unit arrived and cleared the road.",
        category: "roads",
        imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
        status: "resolved",
        user: citizen2._id,
        state: "Maharashtra",
        area: "Mumbai",
        pincode: "400053",
        upvotes: [citizen1._id, citizen3._id, citizen4._id, citizen5._id],
        coordinates: { lat: 19.0620, lng: 72.8400 },
        assignedTo: roadsAdmin._id,
        assignedDepartment: "roads"
      }
    ];

    const createdReports = await Report.insertMany(reports);
    console.log(`✅ ${createdReports.length} Reports created.`);

    console.log("💬 Seeding Comments...");
    const comments = [
      {
        report: createdReports[0]._id,
        user: citizen2._id,
        text: "This pothole damaged my bike tire yesterday! Really hope the roads department fixes it ASAP."
      },
      {
        report: createdReports[0]._id,
        user: roadsAdmin._id,
        text: "Inspection team visited the spot. Asphalting crew has been assigned for tonight's shift."
      },
      {
        report: createdReports[1]._id,
        user: citizen1._id,
        text: "Great response time by the water department! Leakage stopped and pipe joint replaced."
      },
      {
        report: createdReports[1]._id,
        user: waterAdmin._id,
        text: "Issue verified and resolved by Ward West Maintenance Team."
      },
      {
        report: createdReports[2]._id,
        user: citizen4._id,
        text: "Upvoted! Garbage collection truck needs to come twice a day here during market hours."
      },
      {
        report: createdReports[3]._id,
        user: citizen3._id,
        text: "It gets very unsafe after dark here. Good to see status changed to in-progress."
      }
    ];
    await Comment.insertMany(comments);
    console.log("✅ Comments created.");

    console.log("📢 Seeding Announcements...");
    const announcements = [
      {
        title: "Scheduled Water Supply Maintenance in Mumbai West Zone",
        content: "Please note that water supply will be temporarily shut off for trunk pipeline replacement on Saturday from 10:00 AM to 4:00 PM in Bandra and Andheri West.",
        state: "Maharashtra",
        author: superAdmin._id
      },
      {
        title: "Monsoon Emergency Cell & Toll-Free Helpline Active",
        content: "CivicPulse 24/7 Helpline (1916) is live for reporting severe waterlogging, tree falls, or electrical hazards during monsoon rains.",
        state: "Maharashtra",
        author: superAdmin._id
      },
      {
        title: "Citywide E-Waste & Plastic Drive This Weekend",
        content: "Bring old electronic items, batteries, and plastics to Ward Office collection centers for safe recycling and earn double civic reward points!",
        state: "ALL",
        author: superAdmin._id
      }
    ];
    await Announcement.insertMany(announcements);
    console.log("✅ Announcements created.");

    console.log("📅 Seeding Events...");
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const inTwoWeeks = new Date();
    inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);

    const events = [
      {
        title: "Bandra Promenade Beach Clean-Up Drive",
        description: "Join local community volunteers to clean up coastal plastic and trash. Protective gloves and bags will be provided.",
        date: nextWeek,
        location: "Bandra Fort Promenade, Mumbai",
        state: "Maharashtra",
        area: "Mumbai",
        creator: superAdmin._id,
        attendees: [citizen1._id, citizen2._id, citizen3._id, citizen4._id]
      },
      {
        title: "Ward 12 Civic Townhall & Road Planning Forum",
        description: "Interactive Q&A session with ward councilors and PWD engineers regarding road resurfacing and monsoon preparations.",
        date: inTwoWeeks,
        location: "Community Hall, Dadar West, Mumbai",
        state: "Maharashtra",
        area: "Mumbai",
        creator: superAdmin._id,
        attendees: [citizen1._id, citizen4._id, citizen5._id]
      }
    ];
    await Event.insertMany(events);
    console.log("✅ Events created.");

    console.log("👥 Seeding Groups...");
    const groups = [
      {
        name: "Clean Mumbai Brigade",
        description: "Citizen volunteer network dedicated to neighborhood sanitation, spot-fix drives, and waste segregation awareness.",
        state: "Maharashtra",
        area: "Mumbai",
        creator: superAdmin._id,
        members: [citizen1._id, citizen2._id, citizen3._id, citizen5._id]
      },
      {
        name: "Green & Sustainable Neighborhoods",
        description: "Promoting urban tree planting drives, rainwater harvesting in residential societies, and community composting.",
        state: "Maharashtra",
        area: "Mumbai",
        creator: superAdmin._id,
        members: [citizen1._id, citizen4._id, citizen2._id]
      }
    ];
    await Group.insertMany(groups);
    console.log("✅ Groups created.");

    console.log("🔔 Seeding Notifications...");
    const notifications = [
      {
        user: citizen1._id,
        title: "Report Status Updated",
        message: "Your report 'Deep Potholes on Linking Road' is now in-progress.",
        type: "status_update",
        read: false
      },
      {
        user: citizen1._id,
        title: "New Public Announcement",
        message: "Scheduled Water Supply Maintenance in Mumbai West Zone on Saturday.",
        type: "announcement",
        read: true
      },
      {
        user: citizen2._id,
        title: "Report Resolved! 🎉",
        message: "Your report 'Main Pipeline Burst Supplying Sector 4' has been resolved. You earned 20 bonus points!",
        type: "status_update",
        read: false
      }
    ];
    await Notification.insertMany(notifications);
    console.log("✅ Notifications created.");

    console.log("📜 Seeding Audit Logs...");
    const auditLogs = [
      {
        action: "STATUS_UPDATE",
        admin: superAdmin._id,
        details: "Updated report status of 'Deep Potholes on Linking Road' from pending to in-progress",
        targetModel: "Report",
        targetId: createdReports[0]._id,
        state: "Maharashtra"
      },
      {
        action: "REPORT_ASSIGN",
        admin: superAdmin._id,
        details: "Assigned report 'Main Pipeline Burst' to Water Maintenance Department",
        targetModel: "Report",
        targetId: createdReports[1]._id,
        state: "Maharashtra"
      },
      {
        action: "BROADCAST",
        admin: superAdmin._id,
        details: "Broadcasted announcement 'Scheduled Water Supply Maintenance'",
        targetModel: "Announcement",
        targetId: (await Announcement.findOne({ title: /Scheduled Water/ }))._id,
        state: "Maharashtra"
      }
    ];
    await AuditLog.insertMany(auditLogs);
    console.log("✅ Audit Logs created.");

    console.log("\n=======================================================");
    console.log("🎉 DATABASE SUCCESSFULLY SEEDED WITH RHO / DEMO DATA!");
    console.log("=======================================================");
    console.log("🔑 Default Login Credentials:");
    console.log("   • Super Admin: admin / admin123");
    console.log("   • Roads Officer: roads_officer / admin123");
    console.log("   • Water Officer: water_officer / admin123");
    console.log("   • Citizen User: rahul_mumbai / user123");
    console.log("   • Citizen User: priya_patel / user123");
    console.log("=======================================================\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
}

clearAndSeedDatabase();

