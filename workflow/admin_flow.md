# Admin Workflow - WaselX

This document outlines the core journey of a Platform Administrator on the WaselX Dashboard.

```mermaid
graph TD
    UserSignup[User Registration] --> AdminAlert(Admin Notification)
    AdminAlert --> ReviewDocs[Review License & Vehicle Docs]
    ReviewDocs -->|Approve| ActivateUser[Activate Carrier]
    ReviewDocs -->|Reject| NotifyUser[Send Rejection Email]
    
    ActiveSystem[Monitor Platform] --> TrackShipments[Track Live Shipments]
    ActiveSystem --> MarketWatch[Manage Marketplace]
    MarketWatch -->|Manual Assist| AssignCarrier[Force Assign Carrier to Load]
    
    Settlement[Financials] --> ComConfig[Adjust Commission Rates]
    Settlement --> RevenueView[Analyze Platform Profit]
```

## Key Responsibilities
1.  **Safety & Trust**: Verifying Carriers and their legal documents.
2.  **Market Stability**: Monitoring open shipments to ensure they get bids.
3.  **Support**: Manually assigning carriers if a shipper is struggling to find one.
4.  **Growth**: Adjusting platform fees and analyzing volume trends.
