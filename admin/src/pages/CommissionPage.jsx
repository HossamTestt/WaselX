/**
 * Commission Page — View and update platform commission rate
 */
import { useEffect, useState } from 'react';
import { Percent, Save } from 'lucide-react';
import { adminAPI } from '../services/api.js';

export default function CommissionPage() {
  const [current, setCurrent] = useState(null);
  const [rate, setRate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    adminAPI.getCommission()
      .then(r => { setCurrent(r.data.data); setRate(r.data.data?.value || '10'); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateCommission(parseFloat(rate));
      setToast({ msg: `Commission updated to ${rate}%`, type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setToast({ msg: e.response?.data?.message || 'Update failed', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">Commission</div>
          <div className="topbar-subtitle">Manage platform commission settings</div>
        </div>
      </div>

      <div className="page-content">
        {toast && <div className="toast-container"><div className={`toast ${toast.type}`}>{toast.msg}</div></div>}

        <div className="card" style={{ maxWidth: '520px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Platform Commission Rate</div>
              <div className="card-subtitle">Applied to each completed shipment</div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fff4eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Percent size={20} color="#FF7917" />
            </div>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="loading-spinner"><div className="spinner" /></div>
            ) : (
              <>
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Rate</div>
                  <div style={{ fontSize: '48px', fontWeight: 800, color: '#FF7917', lineHeight: 1.1, marginTop: '8px' }}>{current?.value}%</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                    Last updated: {current?.updated_at ? new Date(current.updated_at).toLocaleDateString('en-AE') : 'Never'}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="commission-rate">New Commission Rate (%)</label>
                  <input
                    id="commission-rate"
                    type="number"
                    min="0" max="50" step="0.5"
                    className="form-input"
                    value={rate}
                    onChange={e => setRate(e.target.value)}
                    style={{ fontSize: '20px', fontWeight: 700, textAlign: 'center' }}
                  />
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>Valid range: 0% – 50%</div>
                </div>

                <button className="btn btn-orange w-full" style={{ justifyContent: 'center', height: '44px' }} onClick={handleSave} disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Commission Rate'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="card" style={{ maxWidth: '520px', marginTop: '20px' }}>
          <div className="card-header"><div className="card-title">How Commission Works</div></div>
          <div className="card-body">
            <div style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.8' }}>
              <p>• Commission is deducted from the carrier's accepted bid price.</p>
              <p>• Example: Bid = AED 1,000, Commission 10% = AED 100 platform revenue.</p>
              <p>• Carrier receives: AED 900.</p>
              <p>• Commission is recorded when a bid is accepted.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
