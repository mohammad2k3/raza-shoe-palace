import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/raza_shoe_palace';

async function checkDatabase() {
  console.log('====================================================');
  console.log('🔍 RAZA SHOE PALACE — DATABASE HEALTH & STATUS CHECK');
  console.log('====================================================\n');
  console.log(`Connecting to: ${mongoUri} ...`);

  try {
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
    console.log('✅ DATABASE STATUS: CONNECTED & ONLINE\n');
    console.log(`• Host:            ${conn.connection.host}`);
    console.log(`• Port:            ${conn.connection.port}`);
    console.log(`• Database Name:   ${conn.connection.name}`);
    console.log(`• Connection State: Ready (State ${conn.connection.readyState})`);

    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();

    console.log('\n----------------------------------------------------');
    console.log(`📊 COLLECTIONS OVERVIEW (${collections.length} Collections Found)`);
    console.log('----------------------------------------------------');

    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`• ${col.name.padEnd(25)} : ${count} document(s)`);
    }

    console.log('\n----------------------------------------------------');
    console.log('📌 QUICK SUMMARY:');
    const usersCount = await db.collection('users').countDocuments();
    const productsCount = await db.collection('products').countDocuments();
    const categoriesCount = await db.collection('categories').countDocuments();
    const ordersCount = await db.collection('orders').countDocuments();

    console.log(`  - Products in Catalog:     ${productsCount}`);
    console.log(`  - Footwear Categories:     ${categoriesCount}`);
    console.log(`  - Registered Users:        ${usersCount}`);
    console.log(`  - Total Orders Recorded:   ${ordersCount}`);
    console.log('====================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ DATABASE STATUS: DISCONNECTED / OFFLINE');
    console.error(`Error: ${err.message}`);
    console.log('\n💡 TROUBLESHOOTING TIP:');
    console.log('Ensure MongoDB daemon is running with:');
    console.log('& "C:\\Program Files\\MongoDB\\Server\\9.0\\bin\\mongod.exe" --dbpath ".\\data\\db" --bind_ip 127.0.0.1 --port 27017');
    console.log('====================================================\n');
    process.exit(1);
  }
}

checkDatabase();
