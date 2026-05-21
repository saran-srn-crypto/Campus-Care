import React, { useState } from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useNotifications } from '../../hooks/useNotifications';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';

export default function CategoryManagement() {
  const { state, addCategory } = useTickets();
  const { showToast } = useNotifications();
  const [name, setName] = useState('');
  const inputCls = 'w-full border border-[#cbd5e1] rounded-lg bg-white text-ink px-3 py-2.5 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.14)]';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addCategory(name.trim());
    showToast('Complaint category added.');
    setName('');
  };

  return (
    <article className="p-4.5 border border-line rounded-lg bg-white shadow-card grid gap-4">
      <div><h2 className="m-0">Complaint Categories</h2><p className="mt-1 mb-0 text-muted">Add or remove ticket categories used by students.</p></div>
      <form className="flex flex-wrap gap-2.5 items-center" onSubmit={handleSubmit}>
        <input placeholder="New category name" value={name} onChange={e => setName(e.target.value)} className={inputCls} style={{ maxWidth: 260 }} />
        <Button variant="secondary" type="submit">Add Category</Button>
      </form>
      <div className="flex flex-wrap gap-2 items-center">
        {state.categories.map(c => <StatusBadge key={c} value={c} />)}
      </div>
    </article>
  );
}
