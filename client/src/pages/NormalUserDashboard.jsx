import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { Search, Star, Edit3, PlusCircle } from 'lucide-react';

export default function NormalUserDashboard() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ sortBy: 'name', sortOrder: 'ASC' });

  const [selectedStore, setSelectedStore] = useState(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchStores = async () => {
    try {
      const res = await api.get('/stores', {
        params: {
          search,
          sortBy: sort.sortBy,
          sortOrder: sort.sortOrder
        }
      });
      setStores(res.data.stores);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [search, sort]);

  const handleOpenRatingModal = (store) => {
    setSelectedStore(store);
    setRatingInput(store.user_rating || 5);
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStore) return;

    setLoading(true);
    try {
      const res = await api.post(`/stores/${selectedStore.id}/rate`, { rating: ratingInput });
      setToast({ type: 'success', message: res.data.message });
      setSelectedStore(null);
      fetchStores();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit rating';
      setToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  // Table columns specification
  const columns = [
    { label: 'Store Name', key: 'name', sortable: true },
    { label: 'Address', key: 'address', sortable: true },
    {
      label: 'Overall Rating',
      key: 'overall_rating',
      sortable: true,
      render: (overallRating, store) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StarRating rating={overallRating} readOnly />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            ({store.total_ratings})
          </span>
        </div>
      )
    },
    {
      label: 'My Submitted Rating',
      key: 'user_rating',
      sortable: true,
      render: (userRating) => (
        userRating ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={16} fill="#0284c7" color="#0284c7" />
            <span style={{ fontWeight: '600', color: '#0f172a' }}>{userRating} / 5</span>
          </div>
        ) : (
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Not rated yet</span>
        )
      )
    },
    {
      label: 'Actions',
      key: 'actions',
      sortable: false,
      render: (_, store) => (
        <button
          className={store.user_rating ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
          onClick={() => handleOpenRatingModal(store)}
        >
          {store.user_rating ? (
            <>
              <Edit3 size={14} /> Modify Rating
            </>
          ) : (
            <>
              <PlusCircle size={14} /> Submit Rating
            </>
          )}
        </button>
      )
    }
  ];

  return (
    <div>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '32px auto', padding: '0 20px' }}>
        {/* Title Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Explore Stores</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Browse registered stores, view overall ratings, and submit or modify your ratings (1 to 5 stars)
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '24px', maxWidth: '480px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '44px' }}
            placeholder="Search stores by Name or Address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Store Listings Table */}
        <Table
          columns={columns}
          data={stores}
          sortBy={sort.sortBy}
          sortOrder={sort.sortOrder}
          onSort={(sortBy, sortOrder) => setSort({ sortBy, sortOrder })}
          emptyMessage="No stores found matching search criteria"
        />
      </div>

      {/* Submit / Modify Rating Modal */}
      <Modal
        isOpen={!!selectedStore}
        onClose={() => setSelectedStore(null)}
        title={selectedStore?.user_rating ? `Modify Rating for ${selectedStore?.name}` : `Submit Rating for ${selectedStore?.name}`}
      >
        <form onSubmit={handleRatingSubmit} style={{ textAlign: 'center', padding: '12px 0' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.95rem' }}>
            Click a star to select your rating from 1 to 5
          </p>

          <div style={{ marginBottom: '24px' }}>
            <StarRating
              rating={ratingInput}
              onRate={(newVal) => setRatingInput(newVal)}
              size={36}
            />
            <div style={{ fontSize: '1.2rem', fontWeight: '700', marginTop: '12px', color: '#09090b' }}>
              {ratingInput} / 5 Stars
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelectedStore(null)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Rating'}
            </button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
