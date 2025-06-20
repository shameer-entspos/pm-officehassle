import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { assignProjectEmployeeRoleAPI } from '@/lib/api';
import Loader from '@/components/app/loading/loading';

interface Project {
  id: string;
}

const AssignRoleModal = ({
  show,
  project,
  handleClose,
  selectedEmployee,
  handleReload,
  token,
}: {
  show: boolean;
  project: Project;
  handleClose: () => void;
  selectedEmployee: any;
  handleReload: () => void;
  token: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(selectedEmployee?.role?.role || '');

  const assignProjectEmployeeRole = () => {
    if (role.length <= 2) {
      toast.error('Role must be greater than or equal to 3 characters.');
      return;
    }

    setLoading(true);

    const reqData = {
      project_id: project.id,
      employee_id: selectedEmployee?.employee?.id,
      role: role,
    };

    assignProjectEmployeeRoleAPI(reqData, token ?? '')
      .then((res) => {
        toast.success(res.data.message);
        handleReload();
        handleClose();
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

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {selectedEmployee?.role?.role ? 'Change Role' : 'Assign Role'}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-4">
            <Loader />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground text-sm">
              What is {selectedEmployee?.employee?.first_name}{' '}
              {selectedEmployee?.employee?.last_name}’s role on this project?
            </p>
            <Input
              type="text"
              placeholder="e.g. Project Owner, Contributor"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="custom" onClick={assignProjectEmployeeRole}>
                {selectedEmployee?.role?.role ? 'Change' : 'Assign'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssignRoleModal;
