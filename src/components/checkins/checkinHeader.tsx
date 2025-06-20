'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useProfile } from '@/zustand/user/userStore';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import moment from 'moment';
import {
  todayCheckInAPI,
  todayCheckInCheckOutAPI,
  todayCheckOutAPI,
} from '@/lib/api';
import { toast } from 'sonner';
import Loader from '../app/loading/loading';
import { Badge } from '../ui/badge';

const CheckInHeader = ({
  reload,
  setReload,
  locationPermissionAllowed,
}: any) => {
  const { data: session } = useSession();
  const { profile } = useProfile();
  const [todayCheckIn, setTodayCheckIn] = useState(null);
  const [todayCheckOut, setTodayCheckOut] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.access && profile?.role === 'employee') {
      getTodayCheckInCheckOutDetails(session?.user?.access ?? '');
    }
  }, [reload, session?.user, profile]);

  const getTodayCheckInCheckOutDetails = (token: string) => {
    todayCheckInCheckOutAPI(token)
      .then((res) => {
        console.log(res.data.data);
        setTodayCheckIn(res.data.data['today_check_in']);
        setTodayCheckOut(res.data.data['today_check_out']);
      })
      .catch((error) => {
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              longitude: position.coords.longitude,
              latitude: position.coords.latitude,
            });
          },
          (error) => {
            console.log(error);
            reject("Error getting user's location.");
          }
        );
      } else {
        reject('Geolocation is not supported by your browser.');
      }
    });
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const { longitude, latitude }: any = await getUserLocation();
      if (!longitude || !latitude) return;

      await todayCheckInAPI(
        {
          longitude,
          latitude,
        },
        session?.user?.access ?? ''
      );
      toast.success('Check In Successfully!');
      setReload(!reload);
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    try {
      const { longitude, latitude }: any = await getUserLocation();
      if (!longitude || !latitude) return;

      await todayCheckOutAPI(
        {
          longitude,
          latitude,
          access_token: session?.user?.access ?? '',
        },

        session?.user?.access ?? ''
      );
      toast.success('Check Out Successfully!');
      setReload(!reload);
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile || !session) {
    return (
      <div className="grid h-[400px] w-full place-content-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="flex h-16 w-full items-center justify-between rounded-t-3xl border-b px-3 md:h-20 md:px-6">
        <div>
          <h1 className="text-lg font-bold md:text-xl">Check Ins</h1>
        </div>
        {profile?.role === 'employee' && locationPermissionAllowed ? (
          <div className="flex gap-2">
            <Button
              variant="custom"
              size="sm"
              onClick={handleCheckIn}
              disabled={loading || !!todayCheckIn}
            >
              {loading && !todayCheckOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Check In
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckOut}
              disabled={loading || !todayCheckIn || !!todayCheckOut}
            >
              {isLoading && !todayCheckOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Check Out
            </Button>
          </div>
        ) : profile?.role === 'employee' ? (
          <Badge variant={'destructive'}>
            <AlertCircle className="size-4" /> Allow Location Permission
          </Badge>
        ) : null}
      </div>
      {profile?.role === 'employee' && (
        <div className="flex gap-4 p-3 !pb-0 md:p-6">
          <div className="flex items-center gap-2">
            <span className="gradient size-3 rounded-full"></span>
            <span className="font-medium">
              {todayCheckIn ? (
                <>
                  Check In Time:{' '}
                  <Badge variant="outline">
                    {moment(todayCheckIn).format('h:mm:ss A')}
                  </Badge>
                </>
              ) : (
                'Check in to continue work.'
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="gradient size-3 rounded-full"></span>
            <span className="font-medium">
              {todayCheckOut ? (
                <>
                  Check Out Time:{' '}
                  <Badge variant="outline">
                    {moment(todayCheckOut).format('h:mm:ss A')}
                  </Badge>
                </>
              ) : (
                'Check out to close work.'
              )}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckInHeader;
