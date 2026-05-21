import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProfileCard from '../components/student/ProfileCard';
import ProfileSettingsForm from '../components/student/ProfileSettingsForm';

export default function StudentProfilePage() {
  const { getProfile } = useAuth();
  const navigate = useNavigate();
  const profile = getProfile();

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[minmax(240px,0.42fr)_minmax(0,1fr)] gap-5 items-start">
      <ProfileCard profile={profile} />
      <ProfileSettingsForm profile={profile} onBack={() => navigate('/student/dashboard')} />
    </section>
  );
}
