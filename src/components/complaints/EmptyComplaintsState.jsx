import React from 'react';
import { PlusCircle } from 'lucide-react';

export default function EmptyComplaintsState({ onCreate }) {
  return (
    <div className="min-h-[260px] rounded-lg border border-dashed border-line bg-white grid place-items-center p-6 text-center">
      <div className="grid gap-3 justify-items-center max-w-md">
        <span className="w-12 h-12 rounded-lg bg-[#e9f0ff] text-primary grid place-items-center">
          <PlusCircle size={24} />
        </span>
        <div>
          <h3 className="m-0 text-lg font-extrabold">No complaints found</h3>
          <p className="mt-1 mb-0 text-muted">Try a different filter or raise a new complaint.</p>
        </div>
        <button type="button" onClick={onCreate} className="min-h-[40px] rounded-lg bg-primary text-white px-4 py-2 font-extrabold hover:bg-primary-dark transition-colors">
          Raise Complaint
        </button>
      </div>
    </div>
  );
}
