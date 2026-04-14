# WaselX - Comprehensive App Overview

## What is WaselX?

**WaselX** is a cutting-edge B2B & B2C logistics and freight marketplace designed specifically for the UAE market. It connects businesses and individuals who need to move goods (**Shippers**) directly with verified drivers and transport companies (**Carriers**). 

By digitizing the traditional freight-forwarding process, WaselX eliminates the middleman, ensures transparent pricing through a bidding system, provides real-time GPS tracking, and guarantees trust via a strict verification process.

---

## The Three Pillars of WaselX

The platform is divided into three interconnected portals: the Mobile App (for Shippers and Carriers) and the Web Dashboard (for Admin overwatch).

### 1. The Shipper Experience (Customer)
Shippers use the WaselX mobile app to post jobs, evaluate competitive bids, and track their precious cargo.

**Key Features:**
- **Create Shipments:** Easily input pickup/drop-off locations, cargo descriptions, weight (in tonnes), dimensions (CBM), and time windows.
- **Set Budgets:** Shippers can define their minimum and maximum budget to attract the right carriers.
- **Review Bids:** Shippers receive competitive quotes in real-time. They can review the bidding carrier's profile, including their vehicle type, rating, and total completed trips, before accepting an offer.
- **Real-Time GPS Tracking:** Once a bid is accepted and the job starts, shippers can track the carrier's live location on a map until delivery.
- **History & Receipts:** Digital logging of all past shipments and financial records.

### 2. The Carrier Experience (Driver/Company)
Carriers use the WaselX mobile app to find profitable loads, optimize their routes, and build a trusted reputation.

**Key Features:**
- **Marketplace Browsing:** A live feed of all "Open" shipments that match their location and capabilities.
- **Smart Bidding:** Carriers can submit custom bids (price and estimated hours) on jobs they want.
- **Job Management:** A dedicated "Active Job" screen that guides the carrier through the delivery lifecycle (Assigned → Picked Up → In Transit → Delivered).
- **Background Location Sync:** Automatically pushes GPS coordinates to the server when on an active trip (ensuring shipper peace of mind).
- **Verification & Badges:** A robust profile system. Carriers must be approved by the admin and verified before they can bid, ensuring quality control on the platform.

### 3. The Admin Experience (Dashboard)
Platform owners use the React-based Web Dashboard to manage the entire ecosystem, verify users, and monitor revenue.

**Key Features:**
- **Live KPI Overview:** Real-time visibility into Total Revenue, Active Shipments, Carrier Registrations, and live platform activity.
- **User Management & Verification:** Review newly registered carriers, check their uploaded documents (Trade licenses, Emirates IDs, Vehicle registrations), and set their status to "Approved" or "Rejected".
- **Marketplace Overwatch:** Admins can view all ongoing shipments and, if necessary, manually assign a carrier to a struggling shipment.
- **Financial Control:** Adjust the platform's global Commission Rate (e.g., 10%) on the fly, directly impacting the revenue taken from every successful delivery.
- **Interactive Analytics:** Visual charts breaking down shipment trends and the percentage of shipments by status.

---

## Technical Architecture & Stack

WaselX is built on a modern, highly scalable architecture ensuring performance, offline capabilities, and cross-platform support.

- **Mobile Application:** **React Native** & **Expo** (Targeting iOS and Android from a single codebase). 
  - State Management: `Zustand`
  - Maps: `react-native-maps`
- **Admin Dashboard:** **React** & **Vite** (Lightning-fast web application).
  - UI Icons: `lucide-react`
  - Charts: `recharts`
- **Backend Infrastructure:** **Node.js** & **Express**.
  - Database: **PostgreSQL** with `Sequelize` ORM (Relational data integrity).
  - Security: JWT Authentication, `bcrypt` password hashing, `helmet` security headers.
  - Notifications: Firebase Cloud Messaging (FCM) integration for real-time mobile push notifications.
