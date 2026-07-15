import api from './axios'

export const dashboardService = {
  summary: async () => {
    const { data } = await api.get('/dashboard/summary')
    return data
    // expected: { total_employees, total_seats, occupied_seats, available_seats,
    //             reserved_seats, pending_joiners }
  },

  projectUtilization: async () => {
    const { data } = await api.get('/dashboard/project-utilization')
    return data
    // expected: [{ project_id, project_name, allocated_seats, total_employees }]
  },

  floorUtilization: async () => {
    const { data } = await api.get('/dashboard/floor-utilization')
    return data
    // expected: [{ floor, total_seats, occupied_seats, occupancy_rate }]
  },
}