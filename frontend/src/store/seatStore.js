import { create } from 'zustand'

export const useSeatStore = create((set) => ({
  seats: [],
  selectedSeat: null,

  setSeats: (seats) =>
    set({
      seats,
    }),

  addSeat: (seat) =>
    set((state) => ({
      seats: [...state.seats, seat],
    })),

  updateSeat: (updatedSeat) =>
    set((state) => ({
      seats: state.seats.map((seat) =>
        seat.id === updatedSeat.id
          ? updatedSeat
          : seat
      ),
    })),

  removeSeat: (id) =>
    set((state) => ({
      seats: state.seats.filter(
        (seat) => seat.id !== id
      ),
    })),

  setSelectedSeat: (seat) =>
    set({
      selectedSeat: seat,
    }),

  clearSelectedSeat: () =>
    set({
      selectedSeat: null,
    }),
}))