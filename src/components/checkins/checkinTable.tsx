'use client';

import { useEffect, useState } from 'react';
import { getCheckInCheckOutsAPI } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import CheckIn from './checkin';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

const CheckInTable = ({ reload }: any) => {
  const { data: session } = useSession();
  const [allCheckIns, setAllCheckIns] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCheckInAndCheckOuts();
  }, [reload, session?.user?.access]);

  const getCheckInAndCheckOuts = () => {
    setLoading(true);
    getCheckInCheckOutsAPI(session?.user?.access ?? '')
      .then((res) => {
        console.log('-->', res.data.data);

        setAllCheckIns(res.data.data);

        // Combine check-ins and check-outs by matching IDs or timestamps
        handleRenderCheckIns(res.data.data);
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

  const handleRenderCheckIns = (checkins: any) => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    setCheckIns(checkins.slice(startIndex, startIndex + PAGE_SIZE));
    setTotalPages(Math.ceil(checkins.length / PAGE_SIZE));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const startIndex = currentPage * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      setCheckIns(allCheckIns.slice(startIndex, endIndex));
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const startIndex = (currentPage - 2) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      setCheckIns(allCheckIns.slice(startIndex, endIndex));
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      )}

      <h1 className="text-lg font-bold md:text-xl">Previous Check Ins</h1>

      {!loading && checkIns.length > 0 && (
        <div
          className="rounded-2xl"
          style={{
            boxShadow: '0px 0px 8px 0px #00000010',
          }}
        >
          <div className="overflow-x-auto">
            <Table className="bg-bground-2 overflow-hidden rounded-2xl">
              <TableHeader>
                <TableRow className="bg-bground h-12 rounded-t-3xl">
                  <TableHead className="pl-5 text-sm font-semibold">
                    Date
                  </TableHead>
                  <TableHead className="text-sm font-semibold">
                    Employee
                  </TableHead>
                  <TableHead className="text-sm font-semibold">
                    Check-in Time
                  </TableHead>
                  <TableHead className="text-sm font-semibold">
                    Check-out Time
                  </TableHead>
                  <TableHead className="text-sm font-semibold">
                    Total Time Spend
                  </TableHead>
                  <TableHead className="text-sm font-semibold">
                    Location
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkIns.map((checkin: any) => (
                  <CheckIn key={checkin.id} checkin={checkin} />
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t p-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-muted-foreground text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
      {!loading && checkIns.length === 0 && (
        <CardContent className="text-muted-foreground py-10 text-center">
          No check-in records found.
        </CardContent>
      )}
    </>
  );
};

export default CheckInTable;
