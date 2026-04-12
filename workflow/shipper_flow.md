# Shipper Workflow - WaselX

This document outlines the core journey of a Shipper (Customer) on the WaselX platform.

```mermaid
sequenceDiagram
    participant S as Shipper (Mobile/Web)
    participant B as Backend (API)
    participant C as Carrier (Mobile)
    participant A as Admin (Dashboard)

    Note over S: 1. Request Shipment
    S->>B: POST /api/shipments (Load Details, Budget, Route)
    B-->>S: Shipment Status: 'OPEN'
    
    Note over C: 2. Bidding Phase
    B->>C: Push Notification: "New Shipment in your area!"
    C->>B: POST /api/shipments/:id/bids (Price, Delivery Time)
    B-->>S: Notify: "New Bid Received"
    
    Note over S: 3. Evaluation & Acceptance
    S->>B: GET /api/shipments/:id/bids (Review Carriers & Prices)
    S->>B: PATCH /api/shipments/:id/bids/:bidId/accept
    B-->>C: Notify: "Bid Accepted! Start Trip"
    B-->>S: Shipment Status: 'ASSIGNED'
    
    Note over C: 4. Transportation
    C->>B: PATCH status 'picked_up'
    B-->>S: Notify: "Driver at Pickup"
    C->>B: Location Update (GPS Stream)
    B->>S: Real-time tracking on Map
    C->>B: PATCH status 'delivered'
    
    Note over S: 5. Completion
    B-->>S: Notify: "Arrived at Destination"
    B->>B: Calculate Commission (10%)
    B-->>A: Record Platform Revenue
```

## Key States
- **OPEN**: Shipment created, waiting for bids.
- **BIDDING**: Bids are coming in.
- **ASSIGNED**: Shipper has chosen a carrier.
- **IN_TRANSIT**: Goods are on the move.
- **DELIVERED**: Trip finished.
