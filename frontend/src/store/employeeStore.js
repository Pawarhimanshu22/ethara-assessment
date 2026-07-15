import { create } from 'zustand'

export const useEmployeeStore = create((set) => ({
  employees: [],
  selectedEmployee: null,

  setEmployees: (employees) =>
    set({
      employees,
    }),

  addEmployee: (employee) =>
    set((state) => ({
      employees: [...state.employees, employee],
    })),

  updateEmployee: (updatedEmployee) =>
    set((state) => ({
      employees: state.employees.map((employee) =>
        employee.id === updatedEmployee.id ? updatedEmployee : employee
      ),
    })),

  removeEmployee: (id) =>
    set((state) => ({
      employees: state.employees.filter(
        (employee) => employee.id !== id
      ),
    })),

  setSelectedEmployee: (employee) =>
    set({
      selectedEmployee: employee,
    }),

  clearSelectedEmployee: () =>
    set({
      selectedEmployee: null,
    }),
}))