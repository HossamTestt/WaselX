/**
 * Shipments Store — Zustand
 */
import { create } from 'zustand';
import { shipmentsAPI } from '../services/api';

const useShipmentsStore = create((set, get) => ({
  shipments: [],
  currentShipment: null,
  loading: false,
  error: null,
  pagination: {},

  fetchShipments: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await shipmentsAPI.list(params);
      set({ shipments: data.data, pagination: data.pagination });
    } catch (e) {
      set({ error: e.response?.data?.message || 'Failed to load shipments' });
    } finally {
      set({ loading: false });
    }
  },

  fetchShipment: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data } = await shipmentsAPI.get(id);
      set({ currentShipment: data.data });
      return data.data;
    } catch (e) {
      set({ error: e.response?.data?.message || 'Failed to load shipment' });
    } finally {
      set({ loading: false });
    }
  },

  createShipment: async (shipmentData) => {
    const { data } = await shipmentsAPI.create(shipmentData);
    return data.data;
  },

  updateStatus: async (id, status, notes) => {
    await shipmentsAPI.updateStatus(id, status, notes);
    // Refresh current shipment
    const current = get().currentShipment;
    if (current?.id === id) {
      set((state) => ({
        currentShipment: { ...state.currentShipment, status },
      }));
    }
  },

  clearCurrent: () => set({ currentShipment: null }),
}));

export default useShipmentsStore;
