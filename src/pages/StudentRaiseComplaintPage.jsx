import React from 'react';
import { useAuth } from '../hooks/useAuth';
import CreateTicketForm from '../components/student/CreateTicketForm';

export default function StudentRaiseComplaintPage() {
  const { getProfile } = useAuth();
  const profile = getProfile();

  return (
    <section className="max-w-5xl">
      <CreateTicketForm ownerName={profile.userId || profile.name} />
    </section>
  );
}
