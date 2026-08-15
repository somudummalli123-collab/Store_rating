import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function Table({ columns, data, sortBy, sortOrder, onSort, emptyMessage = 'No records found' }) {
  const handleSortClick = (key, sortable) => {
    if (!sortable || !onSort) return;
    if (sortBy === key) {
      onSort(key, sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      onSort(key, 'ASC');
    }
  };

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col) => {
              const isSorted = sortBy === col.key;
              return (
                <th
                  key={col.key}
                  className={col.sortable ? 'sortable' : ''}
                  onClick={() => handleSortClick(col.key, col.sortable)}
                  style={{ width: col.width || 'auto' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{col.label}</span>
                    {col.sortable && (
                      <span>
                        {isSorted ? (
                          sortOrder === 'ASC' ? (
                            <ArrowUp size={14} style={{ color: 'var(--primary)' }} />
                          ) : (
                            <ArrowDown size={14} style={{ color: 'var(--primary)' }} />
                          )
                        ) : (
                          <ArrowUpDown size={14} style={{ opacity: 0.4 }} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id || idx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
