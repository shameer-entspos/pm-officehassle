import { Button } from '@/components/ui/button';
import {
  todayCheckInAPI,
  todayCheckInCheckOutAPI,
  todayCheckOutAPI,
} from '@/lib/api';
import { useProfile } from '@/zustand/user/userStore';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Loader from '../loading/loading';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const CheckinCard = () => {
  const { data: session } = useSession();
  const { profile } = useProfile();
  const [todayCheckIn, setTodayCheckIn] = useState(null);
  const [todayCheckOut, setTodayCheckOut] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locationPermissionAllowed, setLocationPermissionAllowed] =
    useState(false);

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (session?.user?.access && profile?.role === 'employee') {
      getTodayCheckInCheckOutDetails(session?.user?.access ?? '');
    }
  }, [reload, session?.user, profile]);

  const getUserLocation = () => {
    return new Promise<{ longitude: number; latitude: number }>(
      (resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocationPermissionAllowed(true);
              resolve({
                longitude: position.coords.longitude,
                latitude: position.coords.latitude,
              });
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
      }
    );
  };

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
      getTodayCheckInCheckOutDetails(session?.user?.access ?? '');
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
      getTodayCheckInCheckOutDetails(session?.user?.access ?? '');
      setIsLoading(false);
    }
  };
  return (
    <div className="flex w-full items-center justify-between rounded-t-3xl px-3 md:px-6">
      <div>
        <h1 className="text-lg font-bold md:text-xl">
          {profile?.role === 'employee' ? 'Check In' : 'Attendances'}
        </h1>
      </div>
      {profile?.role === 'employee' && locationPermissionAllowed ? (
        <div className="flex gap-2">
          <Button
            variant="custom"
            size="sm"
            onClick={handleCheckIn}
            disabled={loading || !!todayCheckIn}
          >
            {loading && !todayCheckOut ? <Loader /> : null}
            {!!todayCheckIn ? 'Checked In' : 'Check In'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckOut}
            disabled={loading || !todayCheckIn || !!todayCheckOut}
          >
            {isLoading && !todayCheckOut ? <Loader /> : null}

            {!todayCheckIn || !!todayCheckOut ? 'Checked Out' : 'Check Out'}
          </Button>
        </div>
      ) : profile?.role === 'employee' ? (
        <Badge variant={'destructive'}>
          <AlertCircle className="size-4" /> Allow Location Permission
        </Badge>
      ) : (
        <Link href={'/attendances'}>
          <Button size={'sm'} variant={'custom'}>
            View <ExternalLink className="size-4" />
          </Button>
        </Link>
      )}
    </div>
  );
};

export default CheckinCard;
