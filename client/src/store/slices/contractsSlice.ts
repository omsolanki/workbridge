import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { contractsAPI, Contract } from "../../services/api";

interface ContractsState {
  contracts: Contract[];
  currentContract: Contract | null;
  loading: boolean;
  error: string | null;
}

const initialState: ContractsState = {
  contracts: [],
  currentContract: null,
  loading: false,
  error: null,
};

export const fetchContracts = createAsyncThunk(
  "contracts/fetchContracts",
  async () => {
    const response = await contractsAPI.getContracts();
    return response;
  }
);

export const fetchContract = createAsyncThunk(
  "contracts/fetchContract",
  async (id: string) => {
    const response = await contractsAPI.getContract(id);
    return response;
  }
);

const contractsSlice = createSlice({
  name: "contracts",
  initialState,
  reducers: {
    clearCurrentContract: (state) => {
      state.currentContract = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContracts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContracts.fulfilled, (state, action) => {
        state.loading = false;
        state.contracts = action.payload;
      })
      .addCase(fetchContracts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch contracts";
      })
      .addCase(fetchContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContract.fulfilled, (state, action) => {
        state.loading = false;
        state.currentContract = action.payload;
      })
      .addCase(fetchContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch contract";
      });
  },
});

export const { clearCurrentContract, clearError } = contractsSlice.actions;
export default contractsSlice.reducer;
