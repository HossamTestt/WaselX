/**
 * Users Page — Manage shippers and carriers
 */
import { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, User, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';
import { usersAPI } from '../services/api.js';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', status: '', page: 1 });
  const [pagination, setPagination] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await usersAPI.list(filters);
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [filters.role, filters.status, filters.page]);

  const handleStatusUpdate = async (userId, status) => {
    try {
      await usersAPI.updateStatus(userId, status);
      showToast(`User ${status} successfully`);
      fetchUsers();
    } catch (e) {
      showToast(e.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleVerifyUpdate = async (userId, status, type = 'uaepass') => {
    try {
      await usersAPI.updateVerify(userId, { verification_status: status, verification_type: type });
      showToast(`User verification set to ${status}`);
      fetchUsers();
    } catch (e) {
      showToast(e.response?.data?.message || 'Verification update failed', 'error');
    }
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">Users</div>
          <div className="topbar-subtitle">Manage shippers and carriers</div>
        </div>
      </div>

      <div className="page-content">
        {/* Toast */}
        {toast && (
          <div className="toast-container">
            <div className={`toast ${toast.type}`}>{toast.msg}</div>
          </div>
        )}

        {/* Filters */}
        <div className="filter-bar">
          <select className="form-select" value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value, page: 1 }))}>
            <option value="">All Roles</option>
            <option value="shipper">Shipper</option>
            <option value="carrier">Carrier</option>
          </select>
          <select className="form-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="card">
          <div className="table-wrap">
            {loading ? (
              <div className="loading-spinner"><div className="spinner" /></div>
            ) : users.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><User size={48} /></div>
                <h3>No users found</h3>
                <p>Try adjusting your filters</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Certification</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                        {user.company_name && <div style={{ fontSize: '12px', color: '#64748b' }}>{user.company_name}</div>}
                      </td>
                      <td style={{ color: '#64748b' }}>{user.email}</td>
                      <td style={{ color: '#64748b' }}>{user.phone || '—'}</td>
                      <td>
                        <span className={`badge ${user.role === 'carrier' ? 'badge-orange' : 'badge-blue'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {user.verification_status === 'verified' ? (
                            <span className="badge badge-success" title={`Verified via ${user.verification_type}`}>
                              <ShieldCheck size={12} /> {user.verification_type?.toUpperCase()}
                            </span>
                          ) : user.verification_status === 'pending_review' ? (
                            <span className="badge badge-warning">
                              <Clock size={12} /> Pending
                            </span>
                          ) : (
                            <span className="badge badge-gray">Not Verified</span>
                          )}
                        </div>
                      </td>
                      <td><StatusBadge status={user.status} /></td>
                      <td style={{ color: '#64748b', fontSize: '13px' }}>
                        {new Date(user.created_at).toLocaleDateString('en-AE')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {user.status === 'pending' && (
                            <>
                              <button className="btn btn-primary btn-sm" id={`approve-${user.id}`} onClick={() => handleStatusUpdate(user.id, 'active')}>
                                <CheckCircle size={13} /> Approve
                              </button>
                              <button className="btn btn-danger btn-sm" id={`reject-${user.id}`} onClick={() => handleStatusUpdate(user.id, 'rejected')}>
                                <XCircle size={13} /> Reject
                              </button>
                            </>
                          )}
                          {user.status === 'suspended' && (
                            <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(user.id, 'active')}>
                              Re-activate
                            </button>
                          )}
                          
                          {/* Verification Toggle */}
                          {user.verification_status !== 'verified' ? (
                            <button className="btn btn-orange btn-sm" onClick={() => handleVerifyUpdate(user.id, 'verified', 'passport')}>
                              Certify
                            </button>
                          ) : (
                            <button className="btn btn-ghost btn-sm" onClick={() => handleVerifyUpdate(user.id, 'not_started')}>
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {pagination.total > 0 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {((filters.page - 1) * 20) + 1}–{Math.min(filters.page * 20, pagination.total)} of {pagination.total}
              </div>
              <div className="pagination-controls">
                <button className="btn btn-ghost btn-sm" disabled={filters.page === 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Prev</button>
                <button className="btn btn-ghost btn-sm" disabled={filters.page >= pagination.pages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
