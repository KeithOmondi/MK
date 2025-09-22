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
  clearMessages,
  selectSupplierLoading,
  selectSupplierError,
  selectSupplierSuccess,
} from "../redux/slices/supplierSlice";
import type { AppDispatch } from "../redux/store";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

type AccountStepData = {
  username: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  verificationCode: string;
  sellerType: "Individual" | "Company";
  email: string;
  referralCode?: string;
};

type SupplierStepData = {
  fullName: string;
  shopName: string;
  businessType: "wholesaler" | "retailer" | "manufacturer";
  address: string;
  idNumber: string;
  taxNumber?: string;
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
  const error = useSelector(selectSupplierError);
  const success = useSelector(selectSupplierSuccess);

  const [step, setStep] = useState(1);

  const [accountData, setAccountData] = useState<AccountStepData>({
    username: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    verificationCode: "",
    sellerType: "Individual",
    email: "",
    referralCode: "",
  });

  const [supplierData, setSupplierData] = useState<SupplierStepData>({
    fullName: "",
    shopName: "",
    businessType: "wholesaler",
    address: "",
    idNumber: "",
    taxNumber: "",
  });

  const [settlementData, setSettlementData] = useState<SettlementStepData>({
    bankName: "",
    accountNumber: "",
    accountName: "",
    branch: "",
  });

  // =====================
  // Toast notifications
  // =====================
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearMessages());
    }
    if (success) {
      toast.success(success);
      dispatch(clearMessages());
      resetForm();
    }
  }, [error, success, dispatch]);

  const resetForm = () => {
    setStep(1);
    setAccountData({
      username: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      verificationCode: "",
      sellerType: "Individual",
      email: "",
      referralCode: "",
    });
    setSupplierData({
      fullName: "",
      shopName: "",
      businessType: "wholesaler",
      address: "",
      idNumber: "",
      taxNumber: "",
    });
    setSettlementData({
      bankName: "",
      accountNumber: "",
      accountName: "",
      branch: "",
    });
  };

  // =====================
  // Input handlers
  // =====================
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    if (files) setSupplierData((prev) => ({ ...prev, [name]: files[0] }));
    else setSupplierData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSettlementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettlementData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // =====================
  // Submit handler
  // =====================
  const handleSubmit = () => {
    const formData = new FormData();

    Object.entries(accountData).forEach(([key, value]) => formData.append(key, value as string));
    Object.entries(supplierData).forEach(([key, value]) => {
      if (value instanceof File) formData.append(key, value);
      else formData.append(key, value as string);
    });
    Object.entries(settlementData).forEach(([key, value]) => formData.append(key, value as string));

    dispatch(registerSupplier(formData));
  };

  // =====================
  // Render
  // =====================
  return (
    <>
    <div><Header /></div>

    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Become a Supplier</CardTitle>
          <CardDescription>Join our network by filling out the application below.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress */}
          <div className="mb-6">
            <Progress value={(step / 4) * 100} className="w-full" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Account Info</span>
              <span>Supplier Info</span>
              <span>Settlement Info</span>
              <span>Review</span>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step === 4) handleSubmit();
              else nextStep();
            }}
            className="space-y-6"
          >
            {/* ================= Step 1: Account Info ================= */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Step 1: Account Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" value={accountData.username} onChange={handleAccountChange} placeholder="Username" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" name="email" value={accountData.email} onChange={handleAccountChange} placeholder="Email" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" name="password" value={accountData.password} onChange={handleAccountChange} placeholder="Password" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" name="confirmPassword" value={accountData.confirmPassword} onChange={handleAccountChange} placeholder="Confirm Password" required />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="space-y-2 flex-grow">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input id="phoneNumber" type="tel" name="phoneNumber" value={accountData.phoneNumber} onChange={handleAccountChange} placeholder="Phone Number" required />
                  </div>
                  <div className="space-y-2 flex-grow">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <div className="flex gap-2">
                      <Input id="verificationCode" type="text" name="verificationCode" value={accountData.verificationCode} onChange={handleAccountChange} placeholder="Verification Code" required />
                      <Button type="button" variant="outline">Send Code</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referralCode">Referral Code (optional)</Label>
                  <Input id="referralCode" type="text" name="referralCode" value={accountData.referralCode} onChange={handleAccountChange} placeholder="Referral Code" />
                </div>
              </div>
            )}

            {/* ================= Step 2: Supplier Info ================= */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Step 2: Supplier Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" value={supplierData.fullName} onChange={handleSupplierChange} placeholder="Full Name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shopName">Shop/Store Name</Label>
                    <Input id="shopName" name="shopName" value={supplierData.shopName} onChange={handleSupplierChange} placeholder="Shop/Store Name" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select
                    name="businessType"
                    value={supplierData.businessType}
                    onValueChange={(value) => setSupplierData((prev) => ({ ...prev, businessType: value as "wholesaler" | "retailer" | "manufacturer" }))}
                    options={[
                      { value: "wholesaler", label: "Wholesaler" },
                      { value: "retailer", label: "Retailer" },
                      { value: "manufacturer", label: "Manufacturer" },
                    ]}
                    placeholder="Select business type"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" value={supplierData.address} onChange={handleSupplierChange} placeholder="Address" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input id="idNumber" name="idNumber" value={supplierData.idNumber} onChange={handleSupplierChange} placeholder="ID Number" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxNumber">Tax Number (optional)</Label>
                    <Input id="taxNumber" name="taxNumber" value={supplierData.taxNumber} onChange={handleSupplierChange} placeholder="Tax Number (optional)" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="idDocument">ID Document</Label>
                    <Input id="idDocument" type="file" name="idDocument" accept=".jpg,.jpeg,.png,.pdf" onChange={handleSupplierChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessLicense">Business License</Label>
                    <Input id="businessLicense" type="file" name="businessLicense" accept=".jpg,.jpeg,.png,.pdf" onChange={handleSupplierChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passportPhoto">Passport Photo</Label>
                    <Input id="passportPhoto" type="file" name="passportPhoto" accept=".jpg,.jpeg,.png" onChange={handleSupplierChange} required />
                  </div>
                </div>
              </div>
            )}

            {/* ================= Step 3: Settlement Info ================= */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Step 3: Settlement Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input id="bankName" name="bankName" value={settlementData.bankName} onChange={handleSettlementChange} placeholder="Bank Name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input id="accountNumber" name="accountNumber" value={settlementData.accountNumber} onChange={handleSettlementChange} placeholder="Account Number" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input id="accountName" name="accountName" value={settlementData.accountName} onChange={handleSettlementChange} placeholder="Account Name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch (optional)</Label>
                    <Input id="branch" name="branch" value={settlementData.branch} onChange={handleSettlementChange} placeholder="Branch (optional)" />
                  </div>
                </div>
              </div>
            )}

            {/* ================= Step 4: Review ================= */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Step 4: Review & Submit</h2>
                <Card className="p-4">
                  <CardContent className="space-y-2">
                    <h3 className="font-bold">Account Details</h3>
                    <p>Username: {accountData.username}</p>
                    <p>Email: {accountData.email}</p>
                    <p>Phone: {accountData.phoneNumber}</p>
                    <p>Seller Type: {accountData.sellerType}</p>
                    <p>Referral Code: {accountData.referralCode || "N/A"}</p>

                    <Separator />

                    <h3 className="font-bold">Supplier Details</h3>
                    <p>Full Name: {supplierData.fullName}</p>
                    <p>Shop Name: {supplierData.shopName}</p>
                    <p>Business Type: {supplierData.businessType}</p>
                    <p>Address: {supplierData.address}</p>
                    <p>ID Number: {supplierData.idNumber}</p>
                    <p>Tax Number: {supplierData.taxNumber || "N/A"}</p>
                    <p>Documents Uploaded: {supplierData.idDocument?.name && supplierData.businessLicense?.name && supplierData.passportPhoto?.name ? "✅" : "❌"}</p>

                    <Separator />

                    <h3 className="font-bold">Settlement Details</h3>
                    <p>Bank Name: {settlementData.bankName}</p>
                    <p>Account Number: {settlementData.accountNumber}</p>
                    <p>Account Name: {settlementData.accountName}</p>
                    <p>Branch: {settlementData.branch || "N/A"}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ================= Navigation Buttons ================= */}
            <div className="flex justify-between mt-6">
              {step > 1 && <Button type="button" variant="outline" onClick={prevStep}>Back</Button>}
              <Button type="submit" className="ml-auto" disabled={loading}>
                {step === 4 ? (loading ? "Submitting..." : "Submit Application") : "Next"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>

    <div><Footer /></div>
    
    </>
  );
};

export default SupplierRegistrationForm;
