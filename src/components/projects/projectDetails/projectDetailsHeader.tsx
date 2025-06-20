import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { HiQuestionMarkCircle } from 'react-icons/hi2';
import { useProjectTabs } from '@/zustand/projectTabs/projectTabsStore';
import { CiMenuFries } from 'react-icons/ci';
import { useProfile } from '@/zustand/user/userStore';

const tabLinks = [
  'Overview',
  'Tasks',
  'Board',
  'Timeline',
  'Calendar',
  'Messages',
  'Attachments',
];

interface Project {
  title?: string;
  status?: { status: string } | null;
  all_statuses?: [string, string][];
}

interface ProjectHeaderProps {
  project?: Project;
  updateProject: (data: { status: string }) => void;
  handleOpenDeleteItemModal: () => void;
}

const ProjectHeader = ({
  project,
  updateProject,
  handleOpenDeleteItemModal,
}: ProjectHeaderProps) => {
  const { profile } = useProfile();
  const { tab, changeTab } = useProjectTabs();
  const selectValue = project?.status?.status || null;

  return (
    <div className="flex h-16 w-full items-center justify-between rounded-t-3xl border-b px-3 md:h-20 md:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <h3 className="flex items-center text-lg font-semibold capitalize md:text-xl">
          {project?.title}
        </h3>
        <div className="flex items-center">
          <Popover>
            <PopoverTrigger>
              <button className="cursor-pointer !p-0">
                <HiQuestionMarkCircle className="mt-1 size-6 sm:size-8" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="space-y-4">
              <Label>Set Status</Label>
              <Select
                value={selectValue || undefined}
                onValueChange={(value) => {
                  if (value) {
                    updateProject({ status: value });
                  }
                }}
              >
                <SelectTrigger className="w-full capitalize">
                  <SelectValue placeholder="Set Status" />
                </SelectTrigger>
                <SelectContent>
                  {project?.all_statuses?.map(([value, label]) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="text-capitalize"
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {profile?.role === 'admin' && (
        <div className="hidden items-center gap-2 sm:flex">
          <Button variant="destructive" onClick={handleOpenDeleteItemModal}>
            <Trash2 className="h-4 w-4" />
            <span className="hidden md:inline">Delete</span>
          </Button>
        </div>
      )}

      <div className="block sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={'outline'}>
              <CiMenuFries className="size-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            {tabLinks.map((tb, index) => (
              <DropdownMenuItem
                key={index}
                // variant={tb === tab ? 'default' : 'ghost'}
                onClick={() => changeTab(tb)}
                className={
                  tb === tab
                    ? 'gradient-s hover:bg-primary text-primary-foreground'
                    : ''
                }
              >
                {tb}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleOpenDeleteItemModal}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ProjectHeader;
