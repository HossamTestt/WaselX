# WaselX — Logistics Marketplace MVP

WaselX is a production-ready MVP for a logistics marketplace connecting Shippers and Carriers in the UAE (similar to Trella).

## 📂 Project Structure

- `/backend` — Node.js + Express REST API with PostgreSQL database
- `/admin` — React + Vite web dashboard for platform administrators
- `/mobile` — React Native (Expo) mobile app for Shippers and Carriers

## 🚀 Quick Start Guide

### 1. Database Setup
1. Ensure you have **PostgreSQL** installed and running.
2. Create a database named `waselx_db` (or see `backend/.env.example` to configure yours).
3. Open a terminal and run the schema and seed files against your database:
   ```bash
   psql -U postgres -d waselx_db -f backend/db/schema.sql
   psql -U postgres -d waselx_db -f backend/db/seed.sql
   ```

### 2. Start the Backend API
```bash
cd backend
npm install
cp .env.example .env  # Update the DB credentials in the .env file!
npm run dev
```
The API will run on `http://localhost:3000`.

### 3. Start the Admin Dashboard (Web)
Open a new terminal:
```bash
cd admin
npm install
npm run dev
```
Access the dashboard at `http://localhost:5173`.
**Admin Login:**
- **Email:** `admin@waselx.com`
- **Password:** `Admin@WaselX2024`

### 4. Start the Mobile App (Expo)
Open a third terminal:
```bash
cd mobile
npm install
npm start
```
Use the Expo Go app on your physical device, or run it in an iOS Simulator / Android Emulator.
- **Sample Shipper Login:** `shipper@test.com` / `Test@1234`
- **Sample Carrier Login:** `carrier@test.com` / `Test@1234`

## 🎨 UI/UX Theme
The UI uses the exact brand colors requested:
- **Navy:** `#142F48`
- **Blue:** `#007BFC`
- **Orange:** `#FF7917`

## 📱 Features Included
* Role-based flow (Shipper vs. Carrier).
* Full shipping lifecycle (Create -> Bid -> Accept -> Pick Up -> Transit -> Delivered).
* Live load status and bid management.
* Map view with active shipment tracking coordinates.
* Admin dashboard to monitor platform and manage commission rates.
