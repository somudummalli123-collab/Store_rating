import React from 'react';
import { ShieldCheck, User, Store } from 'lucide-react';

export default function RoleBadge({ role }) {
  if (role === 'ADMIN') {
    return (
      <span className="badge badge-admin">
        <ShieldCheck size={14} /> System Admin
      </span>
    );
  }
  if (role === 'STORE_OWNER') {
    return (
      <span className="badge badge-owner">
        <Store size={14} /> Store Owner
      </span>
    );
  }
  return (
    <span className="badge badge-user">
      <User size={14} /> Normal User
    </span>
  );
}
