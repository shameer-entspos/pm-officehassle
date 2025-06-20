/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getAllEmployeesAPI } from '@/lib/api';
import AttendanceModal from './modals/attendanceModal';

const PAGE_SIZE = 10;

const AttendancesTable = ({
  reload,
  setReload,
}: {
  reload: boolean;
  setReload: (value: boolean) => void;
}) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const toggleModal = () => {
    setSelectedEmployee(null);
  };

  useEffect(() => {
    if (session?.user?.access) {
      getEmployees();
    }
  }, [reload, session?.user?.access]);

  const getEmployees = async () => {
    setLoading(true);
    try {
      const res = await getAllEmployeesAPI(session?.user?.access ?? '');
      handleRenderEmployees(res.data.data);
    } catch (error: any) {
      if (error.response) {
        const errMsg = `Unable to fetch employees. (${error.response.data.message})`;
        toast.error(errMsg);
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRenderEmployees = (employees: any[]) => {
    setAllEmployees(employees);
    setEmployees(employees.slice(0, PAGE_SIZE));
    setCurrentPage(1);
    setTotalPages(Math.ceil(employees.length / PAGE_SIZE));
  };

  return (
    <div className="w-full">
      {/* Loading Spinner */}
      {loading && (
        <div className="flex items-center justify-center py-5">
          <Loader2 className="text-primary h-12 w-12 animate-spin" />
        </div>
      )}

      {selectedEmployee && (
        <AttendanceModal
          toggleModal={toggleModal}
          employeeId={selectedEmployee}
        />
      )}

      {/* Employees Table */}
      <>
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
                  <TableHead className="pl-5 text-left">Employee</TableHead>
                  <TableHead className="text-left">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-gray-500"
                    >
                      No employees found.
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((doc: any) => (
                    <TableRow key={doc.id}>
                      <TableCell className="pl-5 text-left">
                        {doc.first_name} {doc.last_name}
                      </TableCell>
                      <TableCell className="text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEmployee(doc.id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                            />
                          </svg>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </>
    </div>
  );
};

export default AttendancesTable;
