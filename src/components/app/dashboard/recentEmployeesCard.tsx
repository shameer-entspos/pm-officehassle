'use client';

import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useEmployeeStore } from '@/zustand/employee/employeeStore';
import { ExternalLink } from 'lucide-react';

const RecentEmployeesTable = () => {
  const { employees } = useEmployeeStore();
  const router = useRouter();

  const recentEmployees = employees.slice(0, 6);

  return (
    <div className="space-y-4">
      {recentEmployees.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No recent employees found.
        </p>
      ) : (
        <div className="bg-bground-2 overflow-hidden rounded-2xl border shadow-none">
          <Table>
            <TableHeader>
              <TableRow className="bg-bground">
                <TableHead className="pl-4 text-left">Name</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEmployees.map((emp) => (
                <TableRow key={emp.id} className="h-10 cursor-pointer">
                  <TableCell className="pl-4 capitalize">
                    {emp.firstName + ' ' + emp.lastName}
                  </TableCell>
                  <TableCell
                    className="border-l text-center"
                    onClick={() => {
                      router.push(
                        `https://business.officehassle.com/employee-management/employee/${emp.id}`
                      );
                    }}
                  >
                    <Button variant="link" size="sm">
                      <ExternalLink />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default RecentEmployeesTable;
