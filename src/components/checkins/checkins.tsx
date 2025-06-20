'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useProfile } from '@/zustand/user/userStore';
import CheckInHeader from './checkinHeader';
import CheckInTable from './checkinTable';
import Loader from '../app/loading/loading';

const CheckIns = () => {
  const { profile } = useProfile();
  const { data: session } = useSession();
  const [reload, setReload] = useState(false);
  const [locationPermissionAllowed, setLocationPermissionAllowed] =
    useState(false);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationPermissionAllowed(true);
            resolve(position);
          },
          (error) => {
            setLocationPermissionAllowed(false);
            reject(error);
          }
        );
      } else {
        setLocationPermissionAllowed(false);
        reject(new Error('Geolocation not supported'));
      }
    });
  };

  if (!profile || !session) {
    return (
      <div className="grid h-full w-full place-content-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <CheckInHeader
        locationPermissionAllowed={locationPermissionAllowed}
        reload={reload}
        setReload={setReload}
      />
      <div className="flex flex-col gap-4 p-3 md:p-6">
        <CheckInTable reload={reload} setReload={setReload} />
      </div>
    </>
  );
};

export default CheckIns;
