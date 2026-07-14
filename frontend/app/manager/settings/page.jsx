"use client";

import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "@/src/service/manager.service";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    hotelName: "",
    address: "",
    phone: "",
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      if (data.success) {
        setFormData({
          username: data.data.user.username,
          hotelName: data.data.hotel.name,
          address: data.data.hotel.address,
          phone: data.data.hotel.phone,
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage("");
    try {
      const fd = new FormData();
      fd.append("username", formData.username);
      fd.append("hotelName", formData.hotelName);
      fd.append("address", formData.address);
      fd.append("phone", formData.phone);
      if (file) fd.append("logo", file);

      await updateProfile(fd);
      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      setMessage("Failed to update profile.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse text-crema-100/50 font-mono text-sm">Loading settings&hellip;</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-crema-50">Settings</h1>
        <p className="text-crema-100/50 mt-1 text-sm">Manage your cafe's public profile and account details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div className={`p-3 rounded-lg text-sm border ${message.includes("success") ? "bg-leaf-500/10 text-leaf-600 border-leaf-500/30" : "bg-cherry-500/10 text-cherry-600 border-cherry-500/30"}`}>
                {message}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Manager name"
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <Input
                label="Cafe name"
                id="hotelName"
                value={formData.hotelName}
                onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                required
              />
              <Input
                label="Phone number"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-espresso-900/60 mb-1.5">Cafe logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="block w-full text-sm text-espresso-900/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-500/15 file:text-primary-700 hover:file:bg-primary-500/25 border border-espresso-900/15 rounded-lg p-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Cafe address"
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-espresso-900/10">
              <Button type="submit" disabled={submitLoading}>
                {submitLoading ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
