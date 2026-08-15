import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import StarRating from '../components/StarRating';
import RoleBadge from '../components/RoleBadge';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import {
  Users,
  Store as StoreIcon,
  Star,
  Plus,
  Search,
  Eye,
  Filter
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'stores'

  // Users state
  const [users, setUsers] = useState([]);
  const [userFilters, setUserFilters] = useState({ search: '', role: '' });
  const [userSort, setUserSort] = useState({ sortBy: 'name', sortOrder: 'ASC' });

  // Stores state
  const [stores, setStores] = useState([]);
  const [storeFilters, setStoreFilters] = useState({ search: '' });
  const [storeSort, setStoreSort] = useState({ sortBy: 'name', sortOrder: 'ASC' });

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  // Forms data
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'NORMAL_USER'
  });
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users', {
        params: {
          search: userFilters.search,
          role: userFilters.role,
          sortBy: userSort.sortBy,
          sortOrder: userSort.sortOrder
        }
      });
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await api.get('/admin/stores', {
        params: {
          search: storeFilters.search,
          sortBy: storeSort.sortBy,
          sortOrder: storeSort.sortOrder
        }
      });
      setStores(res.data.stores);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [userFilters, userSort, activeTab]);

  useEffect(() => {
    if (activeTab === 'stores') fetchStores();
  }, [storeFilters, storeSort, activeTab]);

  // Create User submit handler
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Client-side quick check
    if (newUser.name.length < 20 || newUser.name.length > 60) {
      setFormErrors({ name: 'Name must be between 20 and 60 characters' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/users', newUser);
      setToast({ type: 'success', message: 'New user created successfully!' });
      setIsAddUserOpen(false);
      setNewUser({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });
      fetchUsers();
      fetchStats();
    } catch (err) {
      const errs = err.response?.data?.errors;
      if (errs) setFormErrors(errs);
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to create user' });
    } finally {
      setLoading(false);
    }
  };

  // Create Store submit handler
  const handleCreateStore = async (e) => {
    e.preventDefault();
    setFormErrors({});

    if (newStore.name.length < 20 || newStore.name.length > 60) {
      setFormErrors({ name: 'Store name must be between 20 and 60 characters' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/stores', newStore);
      setToast({ type: 'success', message: 'New store created successfully!' });
      setIsAddStoreOpen(false);
      setNewStore({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
      fetchStats();
    } catch (err) {
      const errs = err.response?.data?.errors;
      if (errs) setFormErrors(errs);
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to create store' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific user detail
  const handleViewUserDetail = async (userId) => {
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setSelectedUserDetail(res.data.user);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to fetch user details' });
    }
  };

  // User table columns
  const userColumns = [
    { label: 'Name', key: 'name', sortable: true },
    { label: 'Email', key: 'email', sortable: true },
    { label: 'Address', key: 'address', sortable: true },
    {
      label: 'Role',
      key: 'role',
      sortable: true,
      render: (role) => <RoleBadge role={role} />
    },
    {
      label: 'Actions',
      key: 'actions',
      sortable: false,
      render: (_, user) => (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => handleViewUserDetail(user.id)}
        >
          <Eye size={14} /> Details
        </button>
      )
    }
  ];

  // Store table columns
  const storeColumns = [
    { label: 'Store Name', key: 'name', sortable: true },
    { label: 'Email', key: 'email', sortable: true },
    { label: 'Address', key: 'address', sortable: true },
    {
      label: 'Overall Rating',
      key: 'rating',
      sortable: true,
      render: (rating, store) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StarRating rating={rating} readOnly />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            ({store.total_ratings} ratings)
          </span>
        </div>
      )
    }
  ];

  return (
    <div>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '32px auto', padding: '0 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-muted)' }}>Manage system users, stores, and view metrics overview</p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setIsAddStoreOpen(true)}>
              <Plus size={18} /> Add Store
            </button>
            <button className="btn btn-primary" onClick={() => setIsAddUserOpen(true)}>
              <Plus size={18} /> Add User
            </button>
          </div>
        </div>

        {/* Dashboard Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '36px' }}>
          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#e0f2fe', border: '1px solid #7fc3f7', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Total Users</span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '700', lineHeight: 1.1, color: '#0f172a' }}>{stats.totalUsers}</h2>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#e0f2fe', border: '1px solid #7fc3f7', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <StoreIcon size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Total Stores</span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '700', lineHeight: 1.1, color: '#0f172a' }}>{stats.totalStores}</h2>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#e0f2fe', border: '1px solid #7fc3f7', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Total Ratings</span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '700', lineHeight: 1.1, color: '#0f172a' }}>{stats.totalRatings}</h2>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'users' ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Users size={18} /> User Listings
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'stores' ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === 'stores' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <StoreIcon size={18} /> Store Listings
          </button>
        </div>

        {/* Tab Content: Users Listing */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Search Filter */}
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="Filter users by Name, Email, or Address..."
                  value={userFilters.search}
                  onChange={(e) => setUserFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
              </div>

              {/* Role Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={16} style={{ color: 'var(--text-dim)' }} />
                <select
                  className="form-select"
                  style={{ width: '180px' }}
                  value={userFilters.role}
                  onChange={(e) => setUserFilters((prev) => ({ ...prev, role: e.target.value }))}
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">System Admin</option>
                  <option value="NORMAL_USER">Normal User</option>
                  <option value="STORE_OWNER">Store Owner</option>
                </select>
              </div>
            </div>

            <Table
              columns={userColumns}
              data={users}
              sortBy={userSort.sortBy}
              sortOrder={userSort.sortOrder}
              onSort={(sortBy, sortOrder) => setUserSort({ sortBy, sortOrder })}
              emptyMessage="No users found matching filter criteria"
            />
          </div>
        )}

        {/* Tab Content: Stores Listing */}
        {activeTab === 'stores' && (
          <div>
            <div style={{ marginBottom: '20px', maxWidth: '400px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="Filter stores by Name, Email, or Address..."
                value={storeFilters.search}
                onChange={(e) => setStoreFilters({ search: e.target.value })}
              />
            </div>

            <Table
              columns={storeColumns}
              data={stores}
              sortBy={storeSort.sortBy}
              sortOrder={storeSort.sortOrder}
              onSort={(sortBy, sortOrder) => setStoreSort({ sortBy, sortOrder })}
              emptyMessage="No stores found matching filter criteria"
            />
          </div>
        )}
      </div>

      {/* Modal: Add New User */}
      <Modal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} title="Add New User">
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Full Name</label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{newUser.name.length}/60 (Min 20)</span>
            </div>
            <input
              type="text"
              className={`form-input ${formErrors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Benjamin Alexander Harrison User"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
            {formErrors.name && <div className="error-text">{formErrors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className={`form-input ${formErrors.email ? 'is-invalid' : ''}`}
              placeholder="user@example.com"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
            {formErrors.email && <div className="error-text">{formErrors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className={`form-input ${formErrors.password ? 'is-invalid' : ''}`}
              placeholder="8-16 chars, 1+ uppercase, 1+ special"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
            {formErrors.password && <div className="error-text">{formErrors.password}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              rows={2}
              className={`form-input ${formErrors.address ? 'is-invalid' : ''}`}
              placeholder="User full residential address"
              value={newUser.address}
              onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
              required
            />
            {formErrors.address && <div className="error-text">{formErrors.address}</div>}
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="NORMAL_USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </Modal>

      {/* Modal: Add New Store */}
      <Modal isOpen={isAddStoreOpen} onClose={() => setIsAddStoreOpen(false)} title="Add New Store">
        <form onSubmit={handleCreateStore}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Store Name</label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{newStore.name.length}/60 (Min 20)</span>
            </div>
            <input
              type="text"
              className={`form-input ${formErrors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Apex Tech Superstore & Gadgets"
              value={newStore.name}
              onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
              required
            />
            {formErrors.name && <div className="error-text">{formErrors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Store Email</label>
            <input
              type="email"
              className={`form-input ${formErrors.email ? 'is-invalid' : ''}`}
              placeholder="store@example.com"
              value={newStore.email}
              onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
              required
            />
            {formErrors.email && <div className="error-text">{formErrors.email}</div>}
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Address</label>
            <textarea
              rows={2}
              className={`form-input ${formErrors.address ? 'is-invalid' : ''}`}
              placeholder="Store physical location address"
              value={newStore.address}
              onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
              required
            />
            {formErrors.address && <div className="error-text">{formErrors.address}</div>}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Store'}
          </button>
        </form>
      </Modal>

      {/* Modal: View User Details */}
      <Modal isOpen={!!selectedUserDetail} onClose={() => setSelectedUserDetail(null)} title="User Profile Details">
        {selectedUserDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Name</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{selectedUserDetail.name}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</div>
              <div style={{ fontSize: '1rem' }}>{selectedUserDetail.email}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Address</div>
              <div style={{ fontSize: '0.95rem' }}>{selectedUserDetail.address}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Role</div>
              <RoleBadge role={selectedUserDetail.role} />
            </div>

            {/* Requirement: If user is Store Owner, display their Rating */}
            {selectedUserDetail.role === 'STORE_OWNER' && (
              <div style={{ marginTop: '8px', padding: '16px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <div style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: '600', marginBottom: '4px' }}>
                  Owned Store Rating Performance
                </div>
                {selectedUserDetail.store ? (
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '4px' }}>
                      {selectedUserDetail.store.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StarRating rating={selectedUserDetail.rating} readOnly />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        ({selectedUserDetail.store.total_ratings} ratings received)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    No store currently assigned to this owner.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
