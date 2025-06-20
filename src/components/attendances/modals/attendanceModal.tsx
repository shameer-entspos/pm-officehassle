'use client';

import React, { useEffect, useState } from 'react';
import { getEmployeeAttendanceAPI } from '@/lib/api';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

const AttendanceModal = ({ toggleModal, employeeId }: any) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [attendances, setAttendances] = useState<any>();

  useEffect(() => {
    getEmployeeAttendanceAPI(employeeId, session?.user?.access ?? '')
      .then((res) => {
        setAttendances(res.data.data);
        console.log(res.data.data);
      })
      .catch((error) => {
        if (error.response) {
          const err = `Unable to fetch Projects. error(${error.response.data.message})`;
          toast.error(err);
        } else {
          toast.error(error.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [employeeId, session?.user]);

  return (
    <Dialog open={true} onOpenChange={toggleModal}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Attendance</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="text-primary h-10 w-10 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-bground-1 p-0 text-white">
                <CardContent className="flex items-center p-4">
                  <div className="text-2xl">✔</div>
                  <div className="ml-3">
                    <h6 className="text-sm font-medium">Presents</h6>
                    <span className="text-lg">{attendances?.present || 0}</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-bground-1 p-0 text-white">
                <CardContent className="flex items-center p-4">
                  <div className="text-2xl">📈</div>
                  <div className="ml-3">
                    <h6 className="text-sm font-medium">Performance</h6>
                    <span className="text-lg">
                      {attendances?.performance || 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-bground-1 p-0 text-white">
                <CardContent className="flex items-center p-4">
                  <div className="text-2xl">❌</div>
                  <div className="ml-3">
                    <h6 className="text-sm font-medium">Absents</h6>
                    <span className="text-lg">{attendances?.absent || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-0">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  weekends={true}
                  height="auto"
                  events={attendances?.attendance_details?.map((item: any) => ({
                    date: item.date,
                    title: `${item.attendance_status}`,
                    backgroundColor:
                      item.attendance_status === 'present'
                        ? '#fca311'
                        : '#dc3545',
                  }))}
                />
              </CardContent>
            </Card>

            <>
              <div className="bg-bground-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-sm font-medium">
                        Month
                      </TableHead>
                      <TableHead className="text-sm font-medium">
                        Avg. Performance
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendances?.monthly_avg &&
                    Array.isArray(attendances.monthly_avg) ? (
                      attendances.monthly_avg.map((record: any) => (
                        <TableRow key={record.month}>
                          <TableCell>{record.month}</TableCell>
                          <TableCell>{record.avg_performance || 0}%</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-muted-foreground text-center"
                        >
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={toggleModal}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceModal;
