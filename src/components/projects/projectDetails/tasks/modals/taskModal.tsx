import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CreateTask from '../createTask';

interface TaskModalProps {
  handleCloseCreateModal: () => void;
  setTaskCreated: (value: boolean) => void;
  taskCreated: boolean;
  startDate?: Date;
}

const TaskModal = ({
  handleCloseCreateModal,
  setTaskCreated,
  taskCreated,
  startDate,
}: TaskModalProps) => {
  return (
    <Dialog open={true} onOpenChange={handleCloseCreateModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Create Task
          </DialogTitle>
        </DialogHeader>
        {/* create task modal */}
        <CreateTask
          handleCloseCreateModal={handleCloseCreateModal}
          setTaskCreated={setTaskCreated}
          taskCreated={taskCreated}
          startDate={startDate}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
