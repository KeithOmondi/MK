// src/pages/Addresses.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../../redux/slices/addressSlice";
import { Plus, Trash2, Edit } from "lucide-react";
import type { AppDispatch, RootState } from "../../redux/store";

// 📦 Import from react-country-state-city
import {
  CountrySelect,
  StateSelect,
  CitySelect,
} from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";

const Addresses: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { addresses, loading, error } = useSelector(
    (state: RootState) => state.address
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  // ✅ Store both IDs and Names
  const [form, setForm] = useState({
    street: "",
    postalCode: "",
    country: "",
    countryId: "",
    state: "",
    stateId: "",
    city: "",
  });

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const payload = {
      street: form.street,
      postalCode: form.postalCode,
      country: form.country,
      state: form.state,
      city: form.city,
    };

    if (editingAddress) {
      dispatch(updateAddress({ id: editingAddress._id, ...payload }));
    } else {
      dispatch(addAddress(payload));
    }

    setFormOpen(false);
    setEditingAddress(null);
    setForm({
      street: "",
      postalCode: "",
      country: "",
      countryId: "",
      state: "",
      stateId: "",
      city: "",
    });
  };

  const handleEdit = (address: any) => {
    setEditingAddress(address);
    setForm({
      ...address,
      countryId: "", // if you stored IDs in DB, set them here
      stateId: "",
    });
    setFormOpen(true);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Addresses</h1>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" /> Add Address
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {addresses.length > 0 ? (
          addresses.map((address: any) => (
            <div
              key={address._id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
            >
              <p className="font-semibold">{address.street}</p>
              <p>
                {address.city}, {address.state}
              </p>
              <p>
                {address.postalCode}, {address.country}
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleEdit(address)}
                  className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-100"
                >
                  <Edit className="h-4 w-4" /> Edit
                </button>
                <button
                  onClick={() => dispatch(deleteAddress(address._id))}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No addresses found.</p>
        )}
      </div>

      {/* Add/Edit Form */}
      {formOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingAddress ? "Edit Address" : "Add Address"}
            </h2>
            <div className="space-y-3">
              <input
                name="street"
                placeholder="Street"
                value={form.street}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />

              {/* Country/State/City Selects */}
              <CountrySelect
                onChange={(country: any) =>
                  setForm({
                    ...form,
                    country: country.name,
                    countryId: country.id,
                    state: "",
                    stateId: "",
                    city: "",
                  })
                }
                placeHolder="Select Country"
              />
              <StateSelect
                countryid={Number(form.countryId)} // ✅ ensure it's a number
                onChange={(state: any) =>
                  setForm({
                    ...form,
                    state: state.name,
                    stateId: state.id, // ✅ keep numeric ID
                    city: "", // reset city when state changes
                  })
                }
                placeHolder="Select State"
              />

              <CitySelect
                countryid={Number(form.countryId)} // ✅ convert string → number
                stateid={Number(form.stateId)} // ✅ convert string → number
                onChange={(city: any) => setForm({ ...form, city: city.name })}
                placeHolder="Select City"
              />

              <input
                name="postalCode"
                placeholder="Postal Code"
                value={form.postalCode}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingAddress ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addresses;
