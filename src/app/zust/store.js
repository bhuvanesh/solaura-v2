import {create} from 'zustand';

const useStore = create(set => ({
  processedDataParam: '',
  setProcessedDataParam: (data) => set({ processedDataParam: data }),
}));

export default useStore;
