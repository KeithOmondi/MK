// src/pages/Offers.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOffers } from "../../redux/slices/offersSlice";
import type { AppDispatch, RootState } from "../../redux/store";

export default function OffersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { coupons, rewards, loading, error } = useSelector(
    (state: RootState) => state.offers
  );
  const [activeTab, setActiveTab] = useState<"coupons" | "rewards">("coupons");

  useEffect(() => {
    dispatch(fetchOffers());
  }, [dispatch]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Offers & Rewards</h1>

      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "coupons"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("coupons")}
        >
          Coupons
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "rewards"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("rewards")}
        >
          Rewards
        </button>
      </div>

      {loading && <p>Loading offers...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {activeTab === "coupons" && (
        <div className="space-y-3">
          {coupons.length > 0 ? (
            coupons.map((c) => (
              <div
                key={c._id}
                className="p-4 border rounded-lg shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{c.code}</p>
                  <p className="text-sm text-gray-600">
                    {c.discount}% off • Expires {new Date(c.expiry).toDateString()}
                  </p>
                </div>
                <button className="bg-green-600 text-white px-3 py-1 rounded">
                  Apply
                </button>
              </div>
            ))
          ) : (
            <p>No coupons available</p>
          )}
        </div>
      )}

      {activeTab === "rewards" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Reward Points: {rewards.points}</h2>
          <div>
            <h3 className="font-medium mb-2">History</h3>
            {rewards.history.length > 0 ? (
              <ul className="space-y-2">
                {rewards.history.map((h, i) => (
                  <li key={i} className="text-sm text-gray-700">
                    {h.type === "earn" ? "Earned" : "Redeemed"} {h.points} points on{" "}
                    {new Date(h.date).toDateString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No reward history yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
