import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../api/axios";

export type AppRole = "User" | "Admin";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  charityId: string;
  contributionPercent: number;
};

type AuthState = {
  token: string | null;
  user: AppUser | null;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: null,
  loading: false,
  error: null,
};

export const signup = createAsyncThunk(
  "auth/signup",
  async (params: {
    email: string;
    password: string;
    name: string;
    charityId: string;
    contributionPercent: number;
  }) => {
    const res = await api.post("/api/auth/signup", params);
    return res.data as { token: string; user: AppUser };
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (params: { email: string; password: string }) => {
    const res = await api.post("/api/auth/login", params);
    return res.data as { token: string; user: AppUser };
  }
);

export const fetchMe = createAsyncThunk("auth/fetchMe", async () => {
  const res = await api.get("/api/auth/me");
  return res.data as { user: AppUser };
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("token");
    },
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      if (action.payload) localStorage.setItem("token", action.payload);
      else localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(signup.fulfilled, (s, action) => {
        s.loading = false;
        s.token = action.payload.token;
        s.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(signup.rejected, (s, action) => {
        s.loading = false;
        s.error = action.error.message ?? "Signup failed";
      })
      .addCase(login.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(login.fulfilled, (s, action) => {
        s.loading = false;
        s.token = action.payload.token;
        s.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, (s, action) => {
        s.loading = false;
        s.error = action.error.message ?? "Login failed";
      })
      .addCase(fetchMe.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchMe.fulfilled, (s, action) => {
        s.loading = false;
        s.user = action.payload.user;
      })
      .addCase(fetchMe.rejected, (s, action) => {
        s.loading = false;
        s.user = null;
        s.error = action.error.message ?? "Failed to load profile";
      });
  },
});

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;

