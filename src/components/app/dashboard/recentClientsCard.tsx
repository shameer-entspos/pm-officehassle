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
import { ExternalLink } from 'lucide-react';
import { useClientStore } from '@/zustand/client/clientStore';

const RecentClientsTable = () => {
  const router = useRouter();
  const { clients } = useClientStore();

  const recentClients = clients.slice(0, 6);

  return (
    <div className="space-y-4">
      {recentClients.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No recent clients found.
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
              {recentClients.map((client: any) => (
                <TableRow key={client.id} className="h-10 cursor-pointer">
                  <TableCell className="pl-4 capitalize">
                    {client.first_name + ' ' + client.last_name}
                  </TableCell>
                  <TableCell
                    className="border-l text-center"
                    onClick={() => {
                      router.push(
                        `https://business.officehassle.com/client-management/client/${client.id}`
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

export default RecentClientsTable;
