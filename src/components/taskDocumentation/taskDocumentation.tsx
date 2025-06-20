import React from 'react';
import moment from 'moment';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash } from 'lucide-react';

const TaskDocumentation = ({ doc, setSelectedDoc, handleDeleteDoc }: any) => {
  return (
    <TableRow className="h-12">
      <TableCell className="pl-5">
        {moment(doc.created_at).format('MMMM Do YYYY')}
      </TableCell>
      <TableCell>{doc.employee}</TableCell>
      <TableCell>{doc.task}</TableCell>
      <TableCell>{doc.code_pushed ? 'Yes' : 'No'}</TableCell>
      <TableCell>{moment(doc.created_at).format('h:mm:ss A')}</TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              setSelectedDoc(doc);
            }}
          >
            <Pencil className="text-primary size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              handleDeleteDoc(doc);
            }}
          >
            <Trash className="text-destructive size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TaskDocumentation;
