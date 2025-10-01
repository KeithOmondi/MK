// src/pages/ForceChangePassword.tsx
import React, { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { changePassword, clearAuthState } from "../../redux/slices/authSlice";
import type { RootState, AppDispatch } from "../../redux/store";

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const ForceChangePassword: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const { user, loading, error, success, forcePasswordChange } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redirect if not required to change password
  useEffect(() => {
    if (!forcePasswordChange || !user) {
      navigate("/", { replace: true });
    }
  }, [forcePasswordChange, user, navigate]);

  // Handle success or error
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthState());
    }
    if (success) {
      toast.success(success);
      dispatch(clearAuthState());
      // Redirect to dashboard based on role
      if (!user) return;
      let path = "/dashboard";
      switch (user.role) {
        case "Admin":
          path = "/admin/dashboard";
          break;
        case "Supplier":
          path = "/supplier/dashboard";
          break;
        case "Customer":
        default:
          path = "/dashboard";
          break;
      }
      navigate(path, { replace: true });
    }
  }, [error, success, dispatch, navigate, user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = formData;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.warn("All fields are required.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.warn("New password and confirmation do not match.");
      return;
    }

    // Dispatch changePassword WITHOUT email
    dispatch(changePassword({ currentPassword, newPassword }))
      .unwrap()
      .catch((err) => toast.error(err));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl p-8 sm:p-10 space-y-7 border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">Change Your Password</h2>
          <p className="mt-2 text-gray-600 text-sm">
            You are required to change your temporary password before proceeding.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-800 mb-1">
              Temporary Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              placeholder="Enter temporary password"
              className="mt-1 block w-full px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 placeholder-gray-400 text-base"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-800 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              placeholder="Enter new password"
              className="mt-1 block w-full px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 placeholder-gray-400 text-base"
            />
          </div>

          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-semibold text-gray-800 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              required
              placeholder="Confirm new password"
              className="mt-1 block w-full px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 placeholder-gray-400 text-base"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-md transition duration-300 ease-in-out ${
              loading
                ? "bg-yellow-400 cursor-not-allowed flex items-center justify-center"
                : "bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForceChangePassword;
