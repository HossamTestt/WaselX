# Carrier Workflow - WaselX

This document outlines the core journey of a Carrier (Driver/Company) on the WaselX platform.

```mermaid
sequenceDiagram
    participant C as Carrier (Mobile)
    participant B as Backend (API)
    participant S as Shipper (Mobile)
    participant A as Admin (Dashboard)

    Note over C: 1. Registration & Verification
    C->>B: POST /api/auth/register (Role: Carrier)
    B-->>A: Flag: "Pending Carrier Approval"
    A->>B: PATCH /api/users/:id/status ('active')
    B-->>C: Welcome to WaselX! Access granted.
    
    Note over C: 2. Finding Work
    C->>B: GET /api/shipments?status=open (Marketplace)
    C->>B: POST /api/bids (Submit Offer)
    
    Note over S: 3. Selection
    S->>B: Accept Bid
    B-->>C: Push Notification: "Cargo Won! Head to Pickup"
    
    Note over C: 4. Execution
    C->>C: Open Navigation to Pickup
    C->>B: Update Status: 'picked_up'
    C->>B: POST /api/tracking (Continuous GPS)
    C->>B: Update Status: 'delivered'
    
    Note over B: 5. Settlement
    B->>B: Record earnings - 10% Platform Fee
    B-->>C: Transaction Complete
```

## Key States
- **PENDING**: Registered but waiting for Admin to verify license/vehicle.
- **ACTIVE**: Ready to bid on shipments.
- **ON_TRIP**: Currently assigned to a load.
- **SUSPENDED**: Account locked by admin (policy violation).
