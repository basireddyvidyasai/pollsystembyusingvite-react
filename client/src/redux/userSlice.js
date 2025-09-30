import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: null,
  name: '',
  role: null, // 'student' or 'teacher'
  participants: { teacher: null, students: [] },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.role = action.payload.role;
    },
    setParticipants: (state, action) => {
        state.participants = action.payload;
    },
    clearUser: (state) => {
        state.id = null;
        state.name = '';
        state.role = null;
    }
  },
});

export const { setUser, setParticipants, clearUser } = userSlice.actions;
export default userSlice.reducer;