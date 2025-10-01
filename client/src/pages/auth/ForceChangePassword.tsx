import React, { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
// Import the correct thunk
import { updatePassword, clearAuthState } from "../../redux/slices/authSlice";

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

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading, error, success, forcePasswordChange } = useSelector(
    (state: RootState) => state.auth
  );

  // Redirect if password change not required
  useEffect(() => {
    if (!forcePasswordChange) {
      navigate("/", { replace: true });
    }
  }, [forcePasswordChange, navigate]);

  // Show toast for success/error
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthState());
    }

    if (success) {
      toast.success(success);
      dispatch(clearAuthState());

      if (!user) return;

      const rolePaths: Record<string, string> = {
        Admin: "/admin/dashboard",
        Supplier: "/supplier/dashboard",
        User: "/dashboard",
      };
      navigate(rolePaths[user.role] || "/dashboard", { replace: true });
    }
  }, [error, success, user, dispatch, navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  const { currentPassword, newPassword, confirmNewPassword } = formData;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return toast.warn("All fields are required.");
  }

  if (newPassword !== confirmNewPassword) {
    return toast.warn("New password and confirmation do not match.");
  }

  try {
    const res = await dispatch(
      updatePassword({ currentPassword, newPassword, confirmNewPassword })
    ).unwrap();
    toast.success(res.message || "Password updated ✅");
  } catch (err: any) {
    toast.error(err || "Failed to change password");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl p-8 sm:p-10 space-y-7 border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
            Change Your Password
          </h2>
          <p className="mt-2 text-gray-600 text-sm">
            You are required to change your temporary password before proceeding.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {["currentPassword", "newPassword", "confirmNewPassword"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                {field === "currentPassword"
                  ? "Temporary Password"
                  : field === "newPassword"
                  ? "New Password"
                  : "Confirm New Password"}
              </label>
              <input
                type="password"
                name={field}
                value={formData[field as keyof FormData]}
                onChange={handleChange}
                required
                placeholder={
                  field === "currentPassword"
                    ? "Enter temporary password"
                    : field === "newPassword"
                    ? "Enter new password"
                    : "Confirm new password"
                }
                className="mt-1 block w-full px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 placeholder-gray-400 text-base"
                disabled={loading}
              />
            </div>
          ))}

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
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
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
