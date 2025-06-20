'use client';

import React from 'react';
import moment from 'moment';
import { TableRow, TableCell } from '@/components/ui/table';
import { MapPin } from 'lucide-react';
import { formatSecondsToHoursMinutes } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import CheckInOutMap from './checkInOutMap';

const CheckIn = ({ checkin }: any) => {
  const getPinLocationIn = (check: any) => {
    if (check?.in_longitude && check?.in_latitude) {
      return (
        <a
          href={`https://maps.google.com/?q=${check.in_latitude},${check.in_longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          <MapPin className="h-5 w-5" />
        </a>
      );
    }
    return '...';
  };

  const getPinLocationOut = (check: any) => {
    if (check?.in_longitude && check?.in_latitude) {
      return (
        <a
          href={`https://maps.google.com/?q=${check.out_latitude},${check.out_longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          <MapPin className="h-5 w-5" />
        </a>
      );
    }
    return '...';
  };

  const checkinTime = checkin.checkin_time
    ? moment(checkin.checkin_time).isSame(moment(), 'day')
      ? 'Today'
      : moment(checkin.checkin_time).format('MMMM Do, YYYY')
    : '-';

  const checkoutTime = checkin.checkout_time
    ? moment(checkin.checkout_time).isSame(moment(), 'day')
      ? 'Today'
      : moment(checkin.checkout_time).format('MMMM Do, YYYY')
    : '-';

  return (
    <TableRow className="h-12">
      <TableCell className="pl-5 text-sm">
        {checkin?.checkin_time
          ? moment(checkin.checkin_time).isSame(moment(), 'day')
            ? 'Today'
            : moment(checkin.checkin_time).format('MMMM Do, YYYY')
          : '-'}
      </TableCell>
      <TableCell className="text-sm">{checkin?.employee || '-'}</TableCell>
      <TableCell className="text-sm">{checkinTime}</TableCell>
      <TableCell className="text-sm">{checkoutTime}</TableCell>
      <TableCell className="text-sm">
        {checkin?.total_time_spend
          ? formatSecondsToHoursMinutes(checkin.total_time_spend)
          : '-'}
      </TableCell>
      <TableCell>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-auto md:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="font-semibold">
                Check-in Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <p className="text-lg">
                  <span className="font-semibold">Check-in Time:</span>{' '}
                  {checkinTime}
                </p>
                <p className="flex items-center justify-between text-lg">
                  <span className="font-semibold">Check-in Location:</span>{' '}
                  {getPinLocationIn(checkin)}
                </p>
                {checkin?.in_latitude && checkin?.in_longitude && (
                  <CheckInOutMap
                    latitude={checkin.in_latitude}
                    longitude={checkin.in_longitude}
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-lg">
                  <span className="font-semibold">Check-out Time:</span>{' '}
                  {checkoutTime}
                </p>
                <p className="flex items-center justify-between text-lg">
                  <span className="font-semibold">Check-out Location:</span>{' '}
                  {getPinLocationOut(checkin)}
                </p>
                {checkin?.out_latitude && checkin?.out_longitude && (
                  <CheckInOutMap
                    latitude={checkin.out_latitude}
                    longitude={checkin.out_longitude}
                  />
                )}
              </div>
              <p className="flex justify-between text-center text-lg">
                <span className="font-semibold">Total Time Spent:</span>
                <span>
                  {checkin?.total_time_spend
                    ? formatSecondsToHoursMinutes(checkin.total_time_spend)
                    : '-'}
                </span>
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
};

export default CheckIn;
