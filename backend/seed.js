/**
 * WaselX — Comprehensive Seed Script
 * Creates: 2 Admins, 5 Shippers, 5 Carriers + 20 Shipments (all statuses)
 * Usage: node seed.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('./src/config/database');
const { QueryTypes } = require('sequelize');

const PASS = 'WaselX@2024'; // All test accounts use this password

async function hash(p) { return bcrypt.hash(p, 10); }

async function seed() {
  console.log('\n🌱  WaselX Seed Script Starting...\n');

  const h = await hash(PASS);

  // ─── ADMIN ACCOUNTS ────────────────────────────────────────────
  const admins = [
    { id: uuidv4(), name: 'Hossam Al-Admin',   email: 'admin@waselx.com',  role: 'admin', status: 'active', phone: '+971501000001' },
    { id: uuidv4(), name: 'Operations Manager', email: 'ops@waselx.com',    role: 'admin', status: 'active', phone: '+971501000002' },
  ];

  // ─── SHIPPER ACCOUNTS ───────────────────────────────────────────
  const shippers = [
    { id: uuidv4(), name: 'Ahmed Al-Rashidi',   email: 'ahmed.shipper@waselx.com',   phone: '+971551001001', role: 'shipper', status: 'active' },
    { id: uuidv4(), name: 'Sara Logistics LLC', email: 'sara.logistics@waselx.com',  phone: '+971551001002', role: 'shipper', status: 'active' },
    { id: uuidv4(), name: 'Dubai Cargo Co.',    email: 'dubai.cargo@waselx.com',     phone: '+971551001003', role: 'shipper', status: 'active' },
    { id: uuidv4(), name: 'Fatima Al-Zaabi',    email: 'fatima.shipper@waselx.com',  phone: '+971551001004', role: 'shipper', status: 'active' },
    { id: uuidv4(), name: 'Gulf Trade Supply',  email: 'gulf.trade@waselx.com',      phone: '+971551001005', role: 'shipper', status: 'active' },
  ];

  // ─── CARRIER ACCOUNTS ───────────────────────────────────────────
  const carriers = [
    { id: uuidv4(), name: 'Khalid Al-Mansouri', email: 'khalid.driver@waselx.com',   phone: '+971561002001', role: 'carrier', status: 'active',
      vehicle_type: 'Flatbed Truck', capacity: 20, plate: 'DXB-K2201', company: 'Al-Mansouri Transport', verified: true,  rating: 4.8, trips: 124, verif_status: 'verified',   verif_type: 'uaepass' },
    { id: uuidv4(), name: 'Fahad Al-Nuaimi',    email: 'fahad.transport@waselx.com', phone: '+971561002002', role: 'carrier', status: 'active',
      vehicle_type: 'Refrigerated Truck', capacity: 10, plate: 'AUH-F4402', company: 'Fast Cold Chain', verified: true,  rating: 4.5, trips: 87,  verif_status: 'verified',   verif_type: 'passport' },
    { id: uuidv4(), name: 'Omar Bin Saud',       email: 'omar.logistics@waselx.com',  phone: '+971561002003', role: 'carrier', status: 'active',
      vehicle_type: 'Box Truck',        capacity: 5,  plate: 'SHJ-O0033', company: null,               verified: false, rating: 4.1, trips: 32,  verif_status: 'pending_review', verif_type: null },
    { id: uuidv4(), name: 'Yousif Al-Hammadi',  email: 'yousif.driver@waselx.com',   phone: '+971561002004', role: 'carrier', status: 'active',
      vehicle_type: 'Flatbed Truck',  capacity: 25, plate: 'DXB-Y7714', company: 'Hammadi Heavy Haul', verified: true,  rating: 4.9, trips: 210, verif_status: 'verified',   verif_type: 'uaepass' },
    { id: uuidv4(), name: 'Rashid Transport',    email: 'rashid.transport@waselx.com',phone: '+971561002005', role: 'carrier', status: 'pending',
      vehicle_type: 'Tanker',           capacity: 30, plate: 'FUJ-R9900', company: 'Rashid Fuel LLC',  verified: false, rating: 0.0, trips: 0,   verif_status: 'not_started', verif_type: null },
  ];

  // ─── INSERT ALL USERS ───────────────────────────────────────────
  const allUsers = [...admins, ...shippers, ...carriers];

  for (const u of allUsers) {
    await sequelize.query(`
      INSERT INTO users (id, name, email, phone, password_hash, role, status, created_at, updated_at)
      VALUES (:id, :name, :email, :phone, :hash, :role, :status, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name, phone = EXCLUDED.phone, role = EXCLUDED.role, status = EXCLUDED.status
    `, { replacements: { ...u, hash: h }, type: QueryTypes.INSERT });
  }

  // Add verification fields (safe, schema already migrated)
  for (const c of carriers) {
    await sequelize.query(`
      UPDATE users SET
        verification_status = :vs,
        verification_type = :vt
      WHERE email = :email
    `, { replacements: { vs: c.verif_status, vt: c.verif_type, email: c.email }, type: QueryTypes.UPDATE });
  }

  console.log(`✅ Users inserted: ${allUsers.length} (2 admins, ${shippers.length} shippers, ${carriers.length} carriers)`);

  // ─── INSERT CARRIER PROFILES ────────────────────────────────────
  for (const c of carriers) {
    const userRow = await sequelize.query(`SELECT id FROM users WHERE email = :email`, {
      replacements: { email: c.email }, type: QueryTypes.SELECT,
    });
    if (!userRow[0]) continue;
    await sequelize.query(`
      INSERT INTO carrier_profiles (id, user_id, company_name, vehicle_type, vehicle_capacity, license_plate, is_verified, rating, total_trips)
      VALUES (:id, :uid, :co, :vt, :cap, :plate, :verified, :rating, :trips)
      ON CONFLICT (user_id) DO UPDATE SET
        company_name = EXCLUDED.company_name, vehicle_type = EXCLUDED.vehicle_type,
        vehicle_capacity = EXCLUDED.vehicle_capacity, license_plate = EXCLUDED.license_plate,
        is_verified = EXCLUDED.is_verified, rating = EXCLUDED.rating, total_trips = EXCLUDED.total_trips
    `, { replacements: {
        id: uuidv4(), uid: userRow[0].id, co: c.company || null, vt: c.vehicle_type,
        cap: c.capacity, plate: c.plate, verified: c.verified, rating: c.rating, trips: c.trips
      }, type: QueryTypes.INSERT });
  }
  console.log(`✅ Carrier profiles inserted`);

  // ─── FETCH USER IDs ─────────────────────────────────────────────
  const getUser = async (email) => {
    const r = await sequelize.query(`SELECT id FROM users WHERE email = :email`, { replacements: { email }, type: QueryTypes.SELECT });
    return r[0]?.id;
  };

  const [s1, s2, s3, s4, s5] = await Promise.all(shippers.map(s => getUser(s.email)));
  const [c1, c2, c3, c4, c5] = await Promise.all(carriers.map(c => getUser(c.email)));

  // ─── SHIPMENTS (20 — all statuses) ─────────────────────────────
  const shipments = [
    // ── OPEN (no carrier yet) ──
    { id: uuidv4(), shipper: s1, carrier: null,   status: 'open',       pickup_city: 'Dubai',       dropoff_city: 'Abu Dhabi',  load: 'General Goods',   weight: 5.0,  min: 400,  max: 600,  final: null,   desc: 'Electronics shipment, handle with care' },
    { id: uuidv4(), shipper: s2, carrier: null,   status: 'open',       pickup_city: 'Sharjah',     dropoff_city: 'Dubai',      load: 'Furniture',       weight: 8.5,  min: 300,  max: 500,  final: null,   desc: 'Office furniture relocation' },
    { id: uuidv4(), shipper: s3, carrier: null,   status: 'open',       pickup_city: 'Ajman',       dropoff_city: 'Al Ain',     load: 'Construction',    weight: 15.0, min: 700,  max: 1000, final: null,   desc: 'Steel pipes and raw materials' },
    { id: uuidv4(), shipper: s4, carrier: null,   status: 'open',       pickup_city: 'Fujairah',    dropoff_city: 'Dubai',      load: 'Refrigerated',    weight: 3.2,  min: 500,  max: 800,  final: null,   desc: 'Fresh produce, temperature controlled' },
    // ── BIDDING (carriers have bid) ──
    { id: uuidv4(), shipper: s1, carrier: null,   status: 'bidding',    pickup_city: 'Dubai',       dropoff_city: 'Sharjah',    load: 'General Goods',   weight: 2.0,  min: 200,  max: 350,  final: null,   desc: 'Retail goods delivery' },
    { id: uuidv4(), shipper: s2, carrier: null,   status: 'bidding',    pickup_city: 'Abu Dhabi',   dropoff_city: 'Ras Al Khaimah', load: 'Hazardous', weight: 10.0, min: 1200, max: 1800, final: null,   desc: 'Chemical supplies, licensed carrier required' },
    { id: uuidv4(), shipper: s3, carrier: null,   status: 'bidding',    pickup_city: 'Dubai',       dropoff_city: 'Fujairah',   load: 'Machinery',       weight: 22.0, min: 1500, max: 2200, final: null,   desc: 'Heavy industrial equipment' },
    { id: uuidv4(), shipper: s5, carrier: null,   status: 'bidding',    pickup_city: 'Sharjah',     dropoff_city: 'Abu Dhabi',  load: 'Textile',         weight: 4.5,  min: 350,  max: 550,  final: null,   desc: 'Fabric rolls for factory' },
    // ── ASSIGNED ──
    { id: uuidv4(), shipper: s1, carrier: c1,     status: 'assigned',   pickup_city: 'Dubai',       dropoff_city: 'Abu Dhabi',  load: 'General Goods',   weight: 6.0,  min: 500,  max: 700,  final: 620,    desc: 'Monthly consumer goods run' },
    { id: uuidv4(), shipper: s4, carrier: c2,     status: 'assigned',   pickup_city: 'Abu Dhabi',   dropoff_city: 'Dubai',      load: 'Refrigerated',    weight: 5.5,  min: 600,  max: 900,  final: 750,    desc: 'Frozen seafood delivery' },
    { id: uuidv4(), shipper: s5, carrier: c4,     status: 'assigned',   pickup_city: 'Dubai',       dropoff_city: 'Al Ain',     load: 'Construction',    weight: 18.0, min: 900,  max: 1300, final: 1100,   desc: 'Cement bags and building materials' },
    // ── PICKED UP ──
    { id: uuidv4(), shipper: s2, carrier: c1,     status: 'picked_up',  pickup_city: 'Sharjah',     dropoff_city: 'Dubai',      load: 'Furniture',       weight: 7.0,  min: 400,  max: 600,  final: 520,    desc: 'Residential furniture' },
    { id: uuidv4(), shipper: s3, carrier: c4,     status: 'picked_up',  pickup_city: 'Dubai',       dropoff_city: 'Ras Al Khaimah', load: 'Machinery',  weight: 12.0, min: 1000, max: 1500, final: 1250,   desc: 'Generator unit transport' },
    // ── IN TRANSIT ──
    { id: uuidv4(), shipper: s1, carrier: c2,     status: 'in_transit', pickup_city: 'Dubai',       dropoff_city: 'Abu Dhabi',  load: 'Refrigerated',    weight: 4.0,  min: 550,  max: 800,  final: 680,    desc: 'Dairy products active delivery' },
    { id: uuidv4(), shipper: s2, carrier: c4,     status: 'in_transit', pickup_city: 'Abu Dhabi',   dropoff_city: 'Dubai',      load: 'General Goods',   weight: 9.0,  min: 600,  max: 900,  final: 780,    desc: 'Wholesale goods en route' },
    { id: uuidv4(), shipper: s4, carrier: c1,     status: 'in_transit', pickup_city: 'Dubai',       dropoff_city: 'Sharjah',    load: 'Electronics',     weight: 1.5,  min: 300,  max: 500,  final: 420,    desc: 'Consumer electronics batch' },
    { id: uuidv4(), shipper: s5, carrier: c2,     status: 'in_transit', pickup_city: 'Sharjah',     dropoff_city: 'Fujairah',   load: 'Textile',         weight: 5.0,  min: 450,  max: 700,  final: 580,    desc: 'Garments active route' },
    // ── DELIVERED ──
    { id: uuidv4(), shipper: s3, carrier: c4,     status: 'delivered',  pickup_city: 'Dubai',       dropoff_city: 'Al Ain',     load: 'Construction',    weight: 20.0, min: 1100, max: 1600, final: 1400,   desc: 'Completed infrastructure run' },
    { id: uuidv4(), shipper: s1, carrier: c1,     status: 'delivered',  pickup_city: 'Abu Dhabi',   dropoff_city: 'Dubai',      load: 'General Goods',   weight: 3.5,  min: 300,  max: 500,  final: 380,    desc: 'Express retail delivery — completed' },
    // ── CANCELLED ──
    { id: uuidv4(), shipper: s2, carrier: null,   status: 'cancelled',  pickup_city: 'Dubai',       dropoff_city: 'Abu Dhabi',  load: 'General Goods',   weight: 2.0,  min: 200,  max: 400,  final: null,   desc: 'Order cancelled by shipper' },
  ];

  for (const s of shipments) {
    const now = new Date();
    const daysAgo = (d) => new Date(now - d * 86400000).toISOString();
    await sequelize.query(`
      INSERT INTO shipments (
        id, shipper_id, assigned_carrier_id, pickup_address, pickup_city,
        dropoff_address, dropoff_city, load_type, description, weight_tonnes,
        budget_min, budget_max, final_price, commission_amount, status,
        pickup_date, created_at, updated_at,
        assigned_at, delivered_at
      ) VALUES (
        :id, :shipper, :carrier, :pu_addr, :pu_city, :do_addr, :do_city,
        :load, :desc, :weight, :min, :max, :final,
        :commission, :status, :pickup_date, :created, :updated,
        :assigned_at, :delivered_at
      ) ON CONFLICT (id) DO NOTHING
    `, { replacements: {
        id: s.id, shipper: s.shipper, carrier: s.carrier || null,
        pu_addr: `${s.pickup_city} Industrial Area`, pu_city: s.pickup_city,
        do_addr: `${s.dropoff_city} Main Warehouse`, do_city: s.dropoff_city,
        load: s.load, desc: s.desc, weight: s.weight,
        min: s.min, max: s.max,
        final: s.final,
        commission: s.final ? (s.final * 0.10).toFixed(2) : null,
        status: s.status,
        pickup_date: daysAgo(-1),
        created: daysAgo(Math.floor(Math.random() * 14) + 1),
        updated: daysAgo(Math.floor(Math.random() * 3)),
        assigned_at: s.carrier ? daysAgo(2) : null,
        delivered_at: s.status === 'delivered' ? daysAgo(0) : null,
      }, type: QueryTypes.INSERT });
  }

  console.log(`✅ Shipments inserted: ${shipments.length} (4 open, 4 bidding, 3 assigned, 2 picked_up, 4 in_transit, 2 delivered, 1 cancelled)`);

  // ─── SEED BIDS ──────────────────────────────────────────────────
  const biddingShipments = shipments.filter(s => s.status === 'bidding');
  for (const ship of biddingShipments) {
    for (const carrier of [c1, c2, c3]) {
      if (!carrier) continue;
      const bidPrice = (ship.min + Math.random() * (ship.max - ship.min)).toFixed(2);
      await sequelize.query(`
        INSERT INTO bids (id, shipment_id, carrier_id, price, estimated_hours, note, status)
        VALUES (:id, :sid, :cid, :price, :hours, :note, 'pending')
        ON CONFLICT (shipment_id, carrier_id) DO NOTHING
      `, { replacements: {
          id: uuidv4(), sid: ship.id, cid: carrier,
          price: bidPrice,
          hours: (Math.random() * 5 + 2).toFixed(1),
          note: 'Available immediately, fully insured vehicle.',
        }, type: QueryTypes.INSERT });
    }
  }

  // Also add accepted bids for assigned/in_transit/delivered/picked_up shipments
  const activeShipments = shipments.filter(s => s.carrier && ['assigned','picked_up','in_transit','delivered'].includes(s.status));
  for (const ship of activeShipments) {
    await sequelize.query(`
      INSERT INTO bids (id, shipment_id, carrier_id, price, estimated_hours, note, status)
      VALUES (:id, :sid, :cid, :price, :hours, :note, 'accepted')
      ON CONFLICT (shipment_id, carrier_id) DO NOTHING
    `, { replacements: {
        id: uuidv4(), sid: ship.id, cid: ship.carrier,
        price: ship.final, hours: (Math.random() * 5 + 2).toFixed(1),
        note: 'Accepted and confirmed.',
      }, type: QueryTypes.INSERT });
  }

  console.log(`✅ Bids seeded`);

  console.log('\n──────────────────────────────────────────────');
  console.log('🎉  Seed Complete! Test credentials:');
  console.log(`    Password for ALL accounts: ${PASS}`);
  console.log('');
  console.log('  ADMINS:');
  console.log('    admin@waselx.com | ops@waselx.com');
  console.log('');
  console.log('  SHIPPERS:');
  shippers.forEach(s => console.log(`    ${s.email}`));
  console.log('');
  console.log('  CARRIERS:');
  carriers.forEach(c => console.log(`    ${c.email}  [${c.verif_status}]`));
  console.log('──────────────────────────────────────────────\n');

  await sequelize.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
