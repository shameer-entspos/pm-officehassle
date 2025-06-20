import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  city?: string;
  mobileNumber?: string;
  bankName?: string;
  accountNo?: string;
  branchName?: string;
  swiftCode?: string;
  accountType?: string;
  bankAddress?: string;
  address?: string;
  provience?: string;
  country?: string;
  position?: string;
  cnic?: string;
  joiningDate?: string;
  resigningDate?: string;
  isPmEmployee?: boolean;
  createdAt?: string;
  addedBy?: string;
}

interface EmployeeState {
  employee: Employee | null;
  employees: Employee[];
  setEmployee: (employee: Employee) => void;
  clearEmployee: () => void;
  addEmployee: (employee: Employee) => void;
  removeEmployee: (id: string) => void;
  setEmployees: (employees: Employee[]) => void;
  clearEmployees: () => void;
}

export const useEmployeeStore = create<EmployeeState>()(
  devtools(
    persist(
      (set) => ({
        employee: null,
        employees: [],

        setEmployee: (employee) => set({ employee }),
        clearEmployee: () => set({ employee: null }),

        addEmployee: (employee) =>
          set((state) => {
            const exists = state.employees.some((e) => e.id === employee.id);
            if (exists) return state;
            return { employees: [...state.employees, employee] };
          }),

        removeEmployee: (id) =>
          set((state) => ({
            employees: state.employees.filter((e) => e.id !== id),
          })),

        setEmployees: (employees) => set({ employees }),

        clearEmployees: () => set({ employees: [] }),
      }),
      {
        name: 'employee-storage',
      }
    )
  )
);
