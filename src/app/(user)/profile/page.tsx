import Profile from '@/components/app/profile/profile';
import React from 'react';

const ProfilePage = () => {
  return (
    <div className="bg-bground-1 custom-scrollbar flex h-full w-full flex-col rounded-3xl">
      <div className="flex h-16 w-full items-center justify-between rounded-t-3xl border-b px-3 md:h-20 md:px-6">
        <h3 className="flex items-center text-lg font-semibold capitalize md:text-xl">
          Profile
        </h3>
      </div>

      <div className="h-[calc(100%-64px)] overflow-y-auto md:h-[calc(100%-80px)]">
        <Profile />
      </div>
    </div>
  );
};

export default ProfilePage;
