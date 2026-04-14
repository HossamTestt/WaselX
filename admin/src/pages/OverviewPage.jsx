/**
 * Overview Page — KPI Dashboard
 */
import { useEffect, useState } from 'react';
import { Users, Package, Truck, DollarSign, Clock, CheckCircle, Activity, Box, Gavel, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { adminAPI } from '../services/api.js';
import { t } from '../translations.js';

const PIE_COLORS = ['#007BFC', '#FF7917', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    adminAPI.analytics().then(r => setData(r.data.data)).catch(console.error);
    adminAPI.activity().then(r => setActivity(r.data.data)).catch(console.error);
  };

  useEffect(() => {
    fetchData();
    setLoading(false);
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div>
      <div className="topbar">
        <div><div className="topbar-title">Overview</div><div className="topbar-subtitle">Platform Summary</div></div>
      </div>
      <div className="loading-spinner"><div className="spinner" /></div>
    </div>
  );

  const kpis = data?.kpis || {};
  const trend = data?.shipmentTrend || [];
  const breakdown = data?.statusBreakdown || [];

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">{t('overview')}</div>
          <div className="topbar-subtitle">{t('platformSummary')}</div>
        </div>
        <div className="topbar-actions">
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            {new Date().toLocaleDateString('en-AE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="page-content">
        {/* ─── KPI Cards ─────────────────────── */}
        <div className="kpi-grid">
          <KpiCard icon={<Users size={22} />} iconClass="blue" label={t('totalShippers')} value={kpis.total_shippers || 0} />
          <KpiCard icon={<Truck size={22} />} iconClass="orange" label={t('totalCarriers')} value={kpis.total_carriers || 0} sub={`${kpis.pending_carriers || 0} ${t('pendingCarriers')}`} subClass="warning" />
          <KpiCard icon={<Package size={22} />} iconClass="navy" label={t('totalShipments')} value={kpis.total_shipments || 0} />
          <KpiCard icon={<Clock size={22} />} iconClass="blue" label={t('activeShipments')} value={kpis.active_shipments || 0} />
          <KpiCard icon={<CheckCircle size={22} />} iconClass="green" label={t('deliveredShipments')} value={kpis.delivered_shipments || 0} />
          <KpiCard
            icon={<DollarSign size={22} />}
            iconClass="orange"
            label={t('totalRevenue')}
            value={`AED ${(parseFloat(kpis.total_revenue) || 0).toLocaleString('en-AE', { minimumFractionDigits: 0 })}`}
          />
        </div>

        {/* ─── Charts ───────────────────────── */}
        <div className="charts-grid">
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Shipment Trend</div>
                <div className="card-subtitle">Last 7 days</div>
              </div>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trend}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#007BFC" radius={[6, 6, 0, 0]} name="Shipments" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Status Breakdown</div>
                <div className="card-subtitle">All shipments</div>
              </div>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={breakdown} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}>
                    {breakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ─── Activity Monitor ──────────────── */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#FF7917" />
              <div className="card-title">{t('liveActivity')}</div>
            </div>
            <div className="badge badge-orange badge-dot">مباشر</div>
          </div>
          <div className="card-body" style={{ padding: '0' }}>
            <div className="activity-feed">
              {activity.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px' }}>
                  <p>{t('noActivity')}</p>
                </div>
              ) : (
                activity.map((item, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px', 
                    padding: '16px 24px', 
                    borderBottom: '1px solid #f1f5f9' 
                  }}>
                    <ActivityIcon type={item.type} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{t('by')} {item.user_name}</div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {new Date(item.timestamp).toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' })}
                    </div>
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

function ActivityIcon({ type }) {
  const styles = {
    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
  };
  
  if (type === 'new_shipment') return (
    <div style={{ ...styles, background: '#e0f2fe', color: '#007BFC' }}><Box size={16} /></div>
  );
  if (type === 'new_bid') return (
    <div style={{ ...styles, background: '#fff7ed', color: '#FF7917' }}><Gavel size={16} /></div>
  );
  return (
    <div style={{ ...styles, background: '#f0fdf4', color: '#10b981' }}><UserPlus size={16} /></div>
  );
}

function KpiCard({ icon, iconClass, label, value, sub, subClass }) {
  return (
    <div className="kpi-card">
      <div className={`kpi-icon-wrap ${iconClass}`}>{icon}</div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className={`kpi-change ${subClass || 'neutral'}`}>{sub}</div>}
    </div>
  );
}
