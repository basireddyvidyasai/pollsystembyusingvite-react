import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPoll: null,
  pollHistory: [],
  hasVoted: false,
};

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setPoll: (state, action) => {
      // When a new poll starts, reset the voted status
      if (state.currentPoll?.id !== action.payload?.id) {
          state.hasVoted = false;
      }
      state.currentPoll = action.payload;
    },
    updateResults: (state, action) => {
      if (state.currentPoll) {
        state.currentPoll.liveResults = action.payload;
      }
    },
    setVoted: (state) => {
        state.hasVoted = true;
    },
    setPollHistory: (state, action) => {
        state.pollHistory = action.payload;
    },
    // UPDATED: This reducer handles the live timer update from the server
    setTimeRemaining: (state, action) => {
      if (state.currentPoll) {
        state.currentPoll.timeRemaining = action.payload;
      }
    },
  },
});

// UPDATED: Export the new action
export const { setPoll, updateResults, setVoted, setPollHistory, setTimeRemaining } = pollSlice.actions;
export default pollSlice.reducer;