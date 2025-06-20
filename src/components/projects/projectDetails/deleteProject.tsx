import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteItemProps {
  item: string;
  deleteItem: () => void;
  cancelDeleteItem: () => void;
}

const DeleteItem = ({
  item,
  deleteItem,
  cancelDeleteItem,
}: DeleteItemProps) => {
  return (
    <Dialog open={true} onOpenChange={cancelDeleteItem}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Delete {item} Permanently?
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          <i className="icofont-ui-delete text-danger mt-2 text-center text-6xl" />
          <p className="mt-4 text-center text-lg">
            You are about to permanently delete this{' '}
            <span className="lowercase">{item}</span>. This action cannot be
            undone.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={cancelDeleteItem}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={deleteItem}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteItem;
