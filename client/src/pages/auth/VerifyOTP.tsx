import React, { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "../../redux/store";
import { verifyOTP, resendOTP, clearAuthState } from "../../redux/slices/authSlice";

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
  const [cooldown, setCooldown] = useState(0);

  const { loading, error, success } = useSelector(
    (state: RootState) => state.auth
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setOtp(e.target.value);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!otp || !email) {
      toast.error("Email and OTP are required.");
      return;
    }

    dispatch(verifyOTP({ email, otp }));
  };

  const handleResend = () => {
    if (!email) {
      toast.error("Email not found, please go back and register again.");
      return;
    }
    dispatch(resendOTP({ email }));
    setCooldown(30); // 30s cooldown
  };

  // Countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  // Handle success and error
  useEffect(() => {
    if (error) toast.error(error);
    if (success) {
      toast.success(success);

      // ✅ Redirect to login after successful OTP verification
      navigate("/login", { replace: true });
    }
  }, [error, success, navigate]);

  // Cleanup state on unmount
  useEffect(() => {
    return () => {
      dispatch(clearAuthState());
    };
  }, [dispatch]);

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

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleResend}
            className="text-blue-600 hover:underline disabled:text-gray-400"
            disabled={cooldown > 0 || loading}
          >
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VerifyOtp;
