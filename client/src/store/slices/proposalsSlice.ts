import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { proposalsAPI, Proposal } from "../../services/api";

interface ProposalsState {
  proposals: Proposal[];
  myProposals: Proposal[];
  currentProposal: Proposal | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProposalsState = {
  proposals: [],
  myProposals: [],
  currentProposal: null,
  loading: false,
  error: null,
};

export const fetchProposals = createAsyncThunk(
  "proposals/fetchProposals",
  async (jobId?: string) => {
    const response = await proposalsAPI.getProposals(jobId);
    return response;
  }
);

export const fetchProposal = createAsyncThunk(
  "proposals/fetchProposal",
  async (id: string) => {
    const response = await proposalsAPI.getProposal(id);
    return response;
  }
);

export const createProposal = createAsyncThunk(
  "proposals/createProposal",
  async (proposalData: {
    jobId: string;
    coverLetter: string;
    proposedAmount: number;
    estimatedDuration: number;
    attachments?: string[];
  }) => {
    const response = await proposalsAPI.createProposal(proposalData);
    return response;
  }
);

const proposalsSlice = createSlice({
  name: "proposals",
  initialState,
  reducers: {
    clearCurrentProposal: (state) => {
      state.currentProposal = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProposals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProposals.fulfilled, (state, action) => {
        state.loading = false;
        // Handle the new response structure: { success: true, data: [...] }
        state.proposals = action.payload.data || action.payload;
      })
      .addCase(fetchProposals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch proposals";
      })
      .addCase(fetchProposal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProposal.fulfilled, (state, action) => {
        state.loading = false;
        // Handle the new response structure: { success: true, data: {...} }
        state.currentProposal = action.payload.data || action.payload;
      })
      .addCase(fetchProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch proposal";
      })
      .addCase(createProposal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProposal.fulfilled, (state, action) => {
        state.loading = false;
        // Handle the new response structure: { success: true, data: {...} }
        const newProposal = action.payload.data || action.payload;
        state.myProposals.unshift(newProposal);
      })
      .addCase(createProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create proposal";
      });
  },
});

export const { clearCurrentProposal, clearError } = proposalsSlice.actions;
export default proposalsSlice.reducer;
