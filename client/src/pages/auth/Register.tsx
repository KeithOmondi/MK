// src/pages/auth/Signup.tsx
import React, { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { register, clearAuthState } from "../../redux/slices/authSlice";
import type { AppDispatch, RootState } from "../../redux/store";

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error, success } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<SignupForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    dispatch(
      register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
    );
  };

  useEffect(() => {
    if (error) toast.error(error);
    if (success && !error) {
      toast.success(success);
      navigate("/verify-otp", { state: { email: formData.email } });
    }

    return () => {
      dispatch(clearAuthState());
    };
  }, [error, success, navigate, formData.email, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 space-y-6 border border-gray-200">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Create Your Account
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              required
              onChange={handleChange}
              value={formData.name}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              onChange={handleChange}
              value={formData.email}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              minLength={6}
              onChange={handleChange}
              value={formData.password}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 6 characters.
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              required
              onChange={handleChange}
              value={formData.confirmPassword}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="••••••••"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-md text-white bg-teal-600 hover:bg-teal-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
