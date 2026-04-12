/**
 * Status Badge Component
 * Maps shipment/user statuses to visual badges
 */
const STATUS_CONFIG = {
  // Shipment statuses
  open:       { label: 'Open',       cls: 'badge-blue' },
  bidding:    { label: 'Bidding',    cls: 'badge-warning' },
  assigned:   { label: 'Assigned',   cls: 'badge-navy' },
  picked_up:  { label: 'Picked Up',  cls: 'badge-orange' },
  in_transit: { label: 'In Transit', cls: 'badge-orange' },
  delivered:  { label: 'Delivered',  cls: 'badge-success' },
  cancelled:  { label: 'Cancelled',  cls: 'badge-error' },
  // User statuses
  active:     { label: 'Active',     cls: 'badge-success' },
  pending:    { label: 'Pending',    cls: 'badge-warning' },
  rejected:   { label: 'Rejected',   cls: 'badge-error' },
  suspended:  { label: 'Suspended',  cls: 'badge-error' },
  // Bid statuses
  accepted:   { label: 'Accepted',   cls: 'badge-success' },
  withdrawn:  { label: 'Withdrawn',  cls: 'badge-gray' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, cls: 'badge-gray' };
  return (
    <span className={`badge ${config.cls}`}>
      <span className="badge-dot" style={{ background: 'currentColor' }} />
      {config.label}
    </span>
  );
}
