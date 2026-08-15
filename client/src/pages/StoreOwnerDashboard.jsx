import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import StarRating from '../components/StarRating';
import Toast from '../components/Toast';
import { Store, Star, Users, MapPin, Mail } from 'lucide-react';

export default function StoreOwnerDashboard() {
  const [data, setData] = useState({
    hasStore: false,
    store: null,
    averageRating: 0,
    totalRatings: 0,
    ratingsList: []
  });
  const [sort, setSort] = useState({ sortBy: 'name', sortOrder: 'ASC' });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/owner/dashboard', {
        params: {
          sortBy: sort.sortBy,
          sortOrder: sort.sortOrder
        }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to load store owner dashboard data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [sort]);

  const columns = [
    { label: 'User Name', key: 'user_name', sortable: true },
    { label: 'User Email', key: 'user_email', sortable: true },
    { label: 'User Address', key: 'user_address', sortable: true },
    {
      label: 'Rating Given',
      key: 'rating',
      sortable: true,
      render: (rating) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Star size={16} fill="#0284c7" color="#0284c7" />
          <span style={{ fontWeight: '600', color: '#0f172a' }}>{rating} / 5</span>
        </div>
      )
    },
    {
      label: 'Submitted Date',
      key: 'created_at',
      sortable: true,
      render: (dateStr) => new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    }
  ];

  return (
    <div>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '32px auto', padding: '0 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            Loading store dashboard...
          </div>
        ) : !data.hasStore ? (
          <div className="glass-card" style={{ padding: '48px', textAlign: 'center', maxWidth: '560px', margin: '40px auto' }}>
            <Store size={48} style={{ color: 'var(--text-dim)', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>No Store Assigned</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              You do not currently have a store linked to your account. Please contact a System Administrator to assign a store to your profile.
            </p>
          </div>
        ) : (
          <div>
            {/* Header & Store Profile Banner */}
            <div className="glass-card" style={{ padding: '28px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <Store size={24} style={{ color: 'var(--primary)' }} />
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>{data.store.name}</h1>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={15} /> {data.store.email}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={15} /> {data.store.address}
                    </span>
                  </div>
                </div>

                {/* Average Store Rating Metric Badge */}
                <div
                  style={{
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px 28px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.05em' }}>
                      Average Store Rating
                    </span>
                    <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
                      {data.averageRating.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <StarRating rating={data.averageRating} readOnly size={22} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      From {data.totalRatings} user review{data.totalRatings === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* List of Users Who Submitted Ratings */}
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '600' }}>Customer Reviews & Ratings</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Users who have submitted ratings for {data.store.name}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Users size={16} /> Total: {data.ratingsList.length}
              </div>
            </div>

            <Table
              columns={columns}
              data={data.ratingsList}
              sortBy={sort.sortBy}
              sortOrder={sort.sortOrder}
              onSort={(sortBy, sortOrder) => setSort({ sortBy, sortOrder })}
              emptyMessage="No ratings have been submitted for your store yet"
            />
          </div>
        )}
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
