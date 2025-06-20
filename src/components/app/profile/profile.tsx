'use client';

import React from 'react';
import ProfileForm from './profileForm';
import ProfileInfo from './profileInfo';

const Profile = () => {
  return (
    <div className="flex flex-col gap-4 p-3 md:flex-row md:p-6">
      {/* ProfileInfo Section */}
      <div className="w-full lg:w-[300px] xl:w-[400px]">
        <ProfileInfo />
      </div>

      {/* ProfileForm Section */}
      <div className="w-full lg:w-[calc(100%_-_300px)] xl:w-[calc(100%_-_400px)]">
        <ProfileForm />
      </div>
    </div>
  );
};

export default Profile;
