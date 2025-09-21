import React, { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "../../redux/store";
import { verifyOTP, clearAuthState } from "../../redux/slices/authSlice";

interface LocationState {
  email?: string;
}

const VerifyOtp: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const email = state?.email;

  const [otp, setOtp] = useState("");

  const { user, loading, error, success } = useSelector(
    (state: RootState) => state.auth
  );

  const isAuthenticated = !!user;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setOtp(e.target.value);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!otp || !email) {
      toast.error("Email and OTP are required.");
      return;
    }

    dispatch(verifyOTP({ email, otp }));
  };

  useEffect(() => {
    if (error) toast.error(error);
    if (success) toast.success(success);
  }, [error, success]);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");

    return () => {
      dispatch(clearAuthState());
    };
  }, [isAuthenticated, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Verify OTP</h2>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded mb-4 focus:outline-none focus:ring focus:border-blue-400"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
};

export default VerifyOtp;
