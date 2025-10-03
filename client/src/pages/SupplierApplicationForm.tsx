// src/pages/SupplierRegistrationForm.tsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/Card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import Button from "../components/ui/Button";

import {
  registerSupplier,
  clearMessages as clearSupplierMessages,
  selectSupplierLoading,
  selectSupplierError,
  selectSupplierSuccess,
} from "../redux/slices/supplierSlice";
import {
  register as registerUser,
  verifyOTP as verifyUserOTP,
  resendOTP as resendUserOTP,
  clearAuthState,
} from "../redux/slices/authSlice";

import type { AppDispatch } from "../redux/store";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

type AccountStepData = {
  username: string;
  fullName: string; // used for auth.register name
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  sellerType: "Individual" | "Company";
  referralCode?: string;
};

type SupplierStepData = {
  shopName: string;
  businessType: "wholesaler" | "retailer" | "manufacturer";
  address: string;
  idNumber: string;
  taxNumber?: string;
  website?: string;
  idDocument?: File;
  businessLicense?: File;
  passportPhoto?: File;
};

type SettlementStepData = {
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch?: string;
};

const SupplierRegistrationForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(selectSupplierLoading);
  const supplierError = useSelector(selectSupplierError);
  const supplierSuccess = useSelector(selectSupplierSuccess);

  // auth slice states (optional: use for feedback)
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [step, setStep] = useState(1);

  const [accountData, setAccountData] = useState<AccountStepData>({
    username: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    sellerType: "Individual",
    referralCode: "",
  });

  const [otp, setOtp] = useState("");

  const [supplierData, setSupplierData] = useState<SupplierStepData>({
    shopName: "",
    businessType: "wholesaler",
    address: "",
    idNumber: "",
    taxNumber: "",
    website: "",
  });

  const [settlementData, setSettlementData] = useState<SettlementStepData>({
    bankName: "",
    accountNumber: "",
    accountName: "",
    branch: "",
  });

  // Clear success/error messages and reset auth state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearSupplierMessages());
      dispatch(clearAuthState());
    };
  }, [dispatch]);

  // Show supplier notifications
  useEffect(() => {
    if (supplierError) {
      toast.error(supplierError);
      dispatch(clearSupplierMessages());
    }
    if (supplierSuccess) {
      toast.success(supplierSuccess);
      dispatch(clearSupplierMessages());
      // Optionally reset the whole form (or redirect to a "thank you" page)
      resetForm();
    }
  }, [supplierError, supplierSuccess, dispatch]);

  const resetForm = () => {
    setStep(1);
    setOtp("");
    setOtpSent(false);
    setEmailVerified(false);
    setAccountData({
      username: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      sellerType: "Individual",
      referralCode: "",
    });
    setSupplierData({
      shopName: "",
      businessType: "wholesaler",
      address: "",
      idNumber: "",
      taxNumber: "",
      website: "",
    });
    setSettlementData({
      bankName: "",
      accountNumber: "",
      accountName: "",
      branch: "",
    });
  };

  // ---------------- Handlers ----------------
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountData((p) => ({ ...p, [name]: value }));
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    if (files) {
      setSupplierData((p) => ({ ...p, [name]: files[0] }));
    } else {
      setSupplierData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSettlementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettlementData((p) => ({ ...p, [name]: value }));
  };

  const nextStep = () => {
    // Prevent moving from step 1 unless email verified
    if (step === 1 && !emailVerified) {
      toast.error("Please verify your email before continuing.");
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  };
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  // ---------------- Auth (step1) actions ----------------
  const handleSendOtp = async () => {
    // Validate required account fields for creating user
    if (!accountData.email || !accountData.password || !accountData.confirmPassword || !accountData.fullName) {
      toast.error("Please provide Full name, Email and Password to create account and receive OTP.");
      return;
    }
    if (accountData.password !== accountData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setAuthLoading(true);
      setAuthError(null);
      // Use auth.register thunk to create user + send OTP
      await dispatch(
        registerUser({
          name: accountData.fullName,
          email: accountData.email,
          password: accountData.password,
        })
      ).unwrap();
      setOtpSent(true);
      toast.success("OTP sent to your email. Check your inbox.");
    } catch (err: any) {
      setAuthError(err?.message || String(err) || "Failed to send OTP / create account");
      toast.error(err?.message || String(err) || "Failed to send OTP / create account");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !accountData.email) {
      toast.error("Enter the OTP sent to your email");
      return;
    }
    try {
      setAuthLoading(true);
      setAuthError(null);
      await dispatch(verifyUserOTP({ email: accountData.email, otp })).unwrap();
      setEmailVerified(true);
      toast.success("Email verified. You may continue with supplier details.");
    } catch (err: any) {
      setAuthError(err?.message || String(err) || "OTP verification failed");
      toast.error(err?.message || String(err) || "OTP verification failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!accountData.email) {
      toast.error("Please enter the email to resend OTP.");
      return;
    }
    try {
      setAuthLoading(true);
      await dispatch(resendUserOTP({ email: accountData.email })).unwrap();
      toast.success("OTP resent to your email.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to resend OTP");
    } finally {
      setAuthLoading(false);
    }
  };

  // ---------------- Final submit ----------------
  // ---------------- Final submit ----------------
const handleSubmit = async () => {
  if (!emailVerified) {
    toast.error("Please verify your email first (Step 1).");
    return;
  }

  if (!supplierData.shopName || !supplierData.address || !settlementData.bankName) {
    toast.error("Please fill required supplier & settlement details.");
    return;
  }

  const formData = new FormData();

  // ✅ Account details
  formData.append("username", accountData.username || "");
  formData.append("fullName", accountData.fullName);
  formData.append("email", accountData.email);  // to link supplier to existing user
  formData.append("phoneNumber", accountData.phoneNumber); // <-- 🔥 FIX HERE
  formData.append("sellerType", accountData.sellerType);
  if (accountData.referralCode) formData.append("referralCode", accountData.referralCode);

  // ✅ Supplier info
  formData.append("shopName", supplierData.shopName);
  formData.append("businessType", supplierData.businessType);
  formData.append("address", supplierData.address);
  formData.append("idNumber", supplierData.idNumber);
  if (supplierData.taxNumber) formData.append("taxNumber", supplierData.taxNumber);
  if (supplierData.website) formData.append("website", supplierData.website);

  // ✅ Files
  if (supplierData.idDocument) formData.append("idDocument", supplierData.idDocument);
  if (supplierData.businessLicense) formData.append("businessLicense", supplierData.businessLicense);
  if (supplierData.passportPhoto) formData.append("passportPhoto", supplierData.passportPhoto);

  // ✅ Settlement
  formData.append("bankName", settlementData.bankName);
  formData.append("accountNumber", settlementData.accountNumber);
  formData.append("accountName", settlementData.accountName);
  if (settlementData.branch) formData.append("branch", settlementData.branch);

  try {
    await dispatch(registerSupplier(formData)).unwrap();
  } catch (err: any) {
    toast.error(err?.message || "Failed to submit supplier application");
  }
};


  // ---------------- Render ----------------
  return (
    <>
      <Header />

      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Become a Supplier</CardTitle>
            <CardDescription>
              Create an account, verify your email, then complete your supplier application.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="mb-6">
              <Progress value={(step / 4) * 100} className="w-full" />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Account</span>
                <span>Supplier Info</span>
                <span>Settlement</span>
                <span>Review</span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (step === 4) {
                  handleSubmit();
                } else {
                  nextStep();
                }
              }}
              className="space-y-6"
            >
              {/* Step 1 - Account & Email Verification */}
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Step 1 — Account & Email Verification</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full name</Label>
                      <Input id="fullName" name="fullName" value={accountData.fullName} onChange={handleAccountChange} required />
                    </div>

                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" name="username" value={accountData.username} onChange={handleAccountChange} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" name="email" value={accountData.email} onChange={handleAccountChange} required />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone number</Label>
                      <Input id="phoneNumber" type="tel" name="phoneNumber" value={accountData.phoneNumber} onChange={handleAccountChange} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" name="password" value={accountData.password} onChange={handleAccountChange} required />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" name="confirmPassword" value={accountData.confirmPassword} onChange={handleAccountChange} required />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="sellerType">Seller Type</Label>
                    <Select
                      name="sellerType"
                      value={accountData.sellerType}
                      onValueChange={(v) => setAccountData((p) => ({ ...p, sellerType: v as "Individual" | "Company" }))}
                      options={[
                        { value: "Individual", label: "Individual" },
                        { value: "Company", label: "Company" },
                      ]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="referralCode">Referral Code (optional)</Label>
                    <Input id="referralCode" name="referralCode" value={accountData.referralCode} onChange={handleAccountChange} />
                  </div>

                  {/* OTP controls */}
                  <div className="mt-4 flex items-start gap-3">
                    {!otpSent ? (
                      <Button type="button" onClick={handleSendOtp} disabled={authLoading}>
                        {authLoading ? "Sending..." : "Send verification code"}
                      </Button>
                    ) : (
                      <>
                        <div className="flex-1">
                          <Label htmlFor="otp">Enter OTP</Label>
                          <Input id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" />
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button type="button" onClick={handleVerifyOtp} disabled={authLoading || emailVerified}>
                            {authLoading ? "Verifying..." : emailVerified ? "Verified" : "Verify"}
                          </Button>
                          <Button variant="outline" type="button" onClick={handleResendOtp} disabled={authLoading}>
                            Resend
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  {emailVerified && <p className="text-sm text-green-600 mt-2">Email verified ✓ — you can continue</p>}
                </div>
              )}

              {/* Step 2 - Supplier Info */}
              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Step 2 — Supplier Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shopName">Shop / Store Name</Label>
                      <Input id="shopName" name="shopName" value={supplierData.shopName} onChange={handleSupplierChange} required />
                    </div>
                    <div>
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select
                        name="businessType"
                        value={supplierData.businessType}
                        onValueChange={(v) => setSupplierData((p) => ({ ...p, businessType: v as any }))}
                        options={[
                          { value: "wholesaler", label: "Wholesaler" },
                          { value: "retailer", label: "Retailer" },
                          { value: "manufacturer", label: "Manufacturer" },
                        ]}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" value={supplierData.address} onChange={handleSupplierChange} required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="idNumber">ID Number</Label>
                      <Input id="idNumber" name="idNumber" value={supplierData.idNumber} onChange={handleSupplierChange} required />
                    </div>
                    <div>
                      <Label htmlFor="taxNumber">Tax Number (optional)</Label>
                      <Input id="taxNumber" name="taxNumber" value={supplierData.taxNumber} onChange={handleSupplierChange} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="website">Website (optional)</Label>
                    <Input id="website" name="website" value={supplierData.website} onChange={handleSupplierChange} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="idDocument">ID Document</Label>
                      <Input id="idDocument" name="idDocument" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleSupplierChange} required />
                    </div>
                    <div>
                      <Label htmlFor="businessLicense">Business License</Label>
                      <Input id="businessLicense" name="businessLicense" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleSupplierChange} required />
                    </div>
                    <div>
                      <Label htmlFor="passportPhoto">Passport Photo</Label>
                      <Input id="passportPhoto" name="passportPhoto" type="file" accept=".jpg,.jpeg,.png" onChange={handleSupplierChange} required />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 - Settlement */}
              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Step 3 — Settlement Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input id="bankName" name="bankName" value={settlementData.bankName} onChange={handleSettlementChange} required />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input id="accountNumber" name="accountNumber" value={settlementData.accountNumber} onChange={handleSettlementChange} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="accountName">Account Name</Label>
                      <Input id="accountName" name="accountName" value={settlementData.accountName} onChange={handleSettlementChange} required />
                    </div>
                    <div>
                      <Label htmlFor="branch">Branch (optional)</Label>
                      <Input id="branch" name="branch" value={settlementData.branch} onChange={handleSettlementChange} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4 - Review */}
              {step === 4 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Step 4 — Review & Submit</h2>
                  <Card className="p-4">
                    <CardContent className="space-y-2">
                      <h3 className="font-bold">Account</h3>
                      <p>Full name: {accountData.fullName}</p>
                      <p>Username: {accountData.username || "N/A"}</p>
                      <p>Email: {accountData.email}</p>
                      <p>Phone: {accountData.phoneNumber}</p>
                      <p>Seller Type: {accountData.sellerType}</p>
                      <Separator />

                      <h3 className="font-bold">Supplier</h3>
                      <p>Shop name: {supplierData.shopName}</p>
                      <p>Business type: {supplierData.businessType}</p>
                      <p>Address: {supplierData.address}</p>
                      <p>ID number: {supplierData.idNumber}</p>
                      <p>Website: {supplierData.website || "N/A"}</p>
                      <p>Docs uploaded: {supplierData.idDocument?.name && supplierData.businessLicense?.name && supplierData.passportPhoto?.name ? "✅" : "❌"}</p>
                      <Separator />

                      <h3 className="font-bold">Settlement</h3>
                      <p>Bank: {settlementData.bankName}</p>
                      <p>Account number: {settlementData.accountNumber}</p>
                      <p>Account name: {settlementData.accountName}</p>
                      <p>Branch: {settlementData.branch || "N/A"}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                )}
                <div>
                  {step < 4 ? (
                    <Button type="button" className="ml-auto" onClick={nextStep} disabled={step === 1 && !emailVerified}>
                      {step === 1 ? (emailVerified ? "Continue" : "Verify email first") : "Next"}
                    </Button>
                  ) : (
                    <Button type="submit" className="ml-auto" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Application"}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </>
  );
};

export default SupplierRegistrationForm;
