/**
 * Marketplace Page — Live Monitor & Manual Assignment
 */
import { useEffect, useState } from 'react';
import { Truck, Package, Search, Navigation, User, MapPin } from 'lucide-react';
import { adminAPI } from '../services/api.js';

export default function MarketplacePage() {
  const [data, setData] = useState({ openShipments: [], availableCarriers: [] });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // For manual assignment
  const [assigning, setAssigning] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [manualPrice, setManualPrice] = useState('');

  const fetchData = async () => {
    try {
      const { data } = await adminAPI.marketplace();
      setData(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const handleAssign = async (carrierId) => {
    if (!selectedShipment) return;
    if (!manualPrice || isNaN(manualPrice)) {
       alert('Please enter a valid price for manual assignment');
       return;
    }

    setAssigning(true);
    try {
      await adminAPI.manualAssign({
        shipmentId: selectedShipment.id,
        carrierId,
        price: parseFloat(manualPrice)
      });
      setToast({ msg: 'Carrier assigned successfully!', type: 'success' });
      setSelectedShipment(null);
      setManualPrice('');
      fetchData();
    } catch (e) {
      setToast({ msg: e.response?.data?.message || 'Assignment failed', type: 'error' });
    } finally {
      setAssigning(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">Marketplace Monitor</div>
          <div className="topbar-subtitle">Real-time view of loads and available drivers</div>
        </div>
      </div>

      <div className="page-content">
        {toast && (
          <div className="toast-container">
            <div className={`toast ${toast.type}`}>{toast.msg}</div>
          </div>
        )}

        <div className="charts-grid" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
          
          {/* ─── Open Shipments ────────────────── */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={20} color="#007BFC" />
                <div className="card-title">Open Shipments</div>
              </div>
              <span className="badge badge-blue">{data.openShipments.length} Active</span>
            </div>
            <div className="card-body" style={{ maxHeight: '600px', overflowY: 'auto', padding: '0' }}>
              {data.openShipments.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No open shipments found.</div>
              ) : (
                data.openShipments.map(s => (
                  <div key={s.id} onClick={() => setSelectedShipment(s)} style={{
                    padding: '20px',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    background: selectedShipment?.id === s.id ? '#f0f9ff' : 'white',
                    transition: '0.2s'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="badge badge-orange">{s.load_type}</span>
                      <span style={{ fontWeight: '700', color: '#10b981' }}>AED {s.budget_max} (Max)</span>
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '15px' }}>{s.pickup_city} → {s.dropoff_city}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                      Shipper: {s.shipper_name} • {new Date(s.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ─── Available Carriers ────────────── */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} color="#FF7917" />
                <div className="card-title">Available Carriers</div>
              </div>
              <span className="badge badge-orange">{data.availableCarriers.length} Ready</span>
            </div>
            <div className="card-body" style={{ maxHeight: '600px', overflowY: 'auto', padding: '0' }}>
              
              {selectedShipment && (
                <div style={{ background: '#fff7ed', padding: '16px 24px', borderBottom: '2px solid #ffedd5' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#c2410c', marginBottom: '12px' }}>
                    ASSIGNING TO: {selectedShipment.pickup_city} load
                  </div>
                  <div className="flex gap-3">
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="Enter Final Price (AED)" 
                      value={manualPrice} 
                      onChange={e => setManualPrice(e.target.value)}
                      style={{ height: '40px' }}
                    />
                    <button className="btn btn-orange" style={{ height: '40px' }} onClick={() => setSelectedShipment(null)}>Cancel</button>
                  </div>
                </div>
              )}

              {data.availableCarriers.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No carriers available right now.</div>
              ) : (
                data.availableCarriers.map(c => (
                  <div key={c.id} style={{
                    padding: '20px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{c.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{c.vehicle_type} • ⭐ {c.rating}</div>
                    </div>
                    <button 
                      className="btn btn-primary btn-sm" 
                      disabled={!selectedShipment || assigning}
                      onClick={() => handleAssign(c.id)}
                    >
                      Assign
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
