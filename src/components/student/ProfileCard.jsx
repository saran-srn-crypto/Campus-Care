import React from 'react';

export default function ProfileCard({ profile }) {
  return (
    <article className="p-4 border border-line rounded-lg bg-white shadow-card grid gap-3.5 items-start">
      <div className="w-[72px] h-[72px] grid place-items-center rounded-lg bg-primary text-white text-xl font-black uppercase">
        {profile.name?.slice(0, 2)}
      </div>
      <div>
        <span className="text-sidebar-label text-xs font-bold uppercase">Account</span>
        <h2 className="m-0">{profile.name}</h2>
        <p className="m-0 text-muted leading-relaxed">{profile.label} — {profile.department}</p>
      </div>
    </article>
  );
}
