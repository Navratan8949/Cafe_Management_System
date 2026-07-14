"use client";

import { useState } from "react";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { createManager } from "@/src/service/auth.service";
import { useRouter } from "next/navigation";

export default function CreateManagerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    hotelName: "",
    hotelAddress: "",
    hotelPhone: "",
    managerName: "",
    managerEmail: "",
    managerPassword: "",
    latitude: "",
    longitude: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Unable to retrieve your location. Please ensure location access is allowed.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await createManager(formData);
      setSuccess("Hotel and manager created successfully!");
      setFormData({
        hotelName: "",
        hotelAddress: "",
        hotelPhone: "",
        managerName: "",
        managerEmail: "",
        managerPassword: "",
        latitude: "",
        longitude: ""
      });
      setTimeout(() => {
        router.push("/superadmin");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create manager");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-crema-50">New manager &amp; cafe</h1>
        <p className="text-crema-100/50 mt-1 text-sm">Provision a new instance on the platform.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-cherry-500/10 text-cherry-600 p-3 rounded-lg text-sm border border-cherry-500/30">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-leaf-500/10 text-leaf-600 p-3 rounded-lg text-sm border border-leaf-500/30">
                {success}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-primary-600 uppercase tracking-widest border-b border-espresso-900/10 pb-2">Cafe details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Cafe name"
                  id="hotelName"
                  value={formData.hotelName}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Cafe phone"
                  id="hotelPhone"
                  value={formData.hotelPhone}
                  onChange={handleChange}
                  required
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Cafe address"
                    id="hotelAddress"
                    value={formData.hotelAddress}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col sm:flex-row items-end gap-4">
                  <div className="flex-1 w-full">
                    <Input label="Latitude" id="latitude" type="number" step="any" value={formData.latitude} onChange={handleChange} />
                  </div>
                  <div className="flex-1 w-full">
                    <Input label="Longitude" id="longitude" type="number" step="any" value={formData.longitude} onChange={handleChange} />
                  </div>
                  <Button type="button" variant="secondary" onClick={handleGetLocation} className="mb-[2px] w-full sm:w-auto h-[42px]">
                    Get Current Location
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-semibold text-primary-600 uppercase tracking-widest border-b border-espresso-900/10 pb-2">Manager details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full name"
                  id="managerName"
                  value={formData.managerName}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email address"
                  type="email"
                  id="managerEmail"
                  value={formData.managerEmail}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  id="managerPassword"
                  value={formData.managerPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create instance"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
