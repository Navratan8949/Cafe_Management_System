"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { Coffee } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { registerManager, user, loading } = useAuth();

  const [formData, setFormData] = useState({
    hotelName: "",
    hotelAddress: "",
    hotelPhone: "",
    managerName: "",
    managerEmail: "",
    managerPassword: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "SUPERADMIN") router.replace("/superadmin");
      else router.replace("/manager/dashboard");
    }
  }, [user, loading, router]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await registerManager(formData);
    if (!result.success) {
      setError(result.message);
      setIsLoading(false);
    } else {
      router.push("/manager/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-crema-50 p-4 py-12">
      <div className="w-full max-w-xl">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className=" rounded-md">
            <img src={"./images/logo.png"} alt="omnibite" className="w-10 h-10" />
          </div>
          <span className="text-lg font-display font-semibold text-espresso-900">
            Omni<span className="text-primary-600">&amp;Bite</span>
          </span>
        </Link>

        <div className="bg-crema-50 border border-espresso-900/10 rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-display font-semibold text-espresso-900 text-center">Open your cafe</h1>
          <p className="text-espresso-900/50 text-sm mt-1.5 text-center">Set up your counter in a couple of minutes</p>

          <form onSubmit={handleRegister} className="space-y-6 mt-7">
            {error && (
              <div className="bg-cherry-500/10 text-cherry-600 p-3 rounded-lg text-sm border border-cherry-500/30">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-primary-600 uppercase tracking-widest">Cafe details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Cafe name" id="hotelName" value={formData.hotelName} onChange={handleChange} required />
                <Input label="Cafe phone" id="hotelPhone" value={formData.hotelPhone} onChange={handleChange} required />
                <div className="md:col-span-2">
                  <Input label="Cafe address" id="hotelAddress" value={formData.hotelAddress} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-espresso-900/10">
              <h3 className="text-xs font-semibold text-primary-600 uppercase tracking-widest">Account details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Your name" id="managerName" value={formData.managerName} onChange={handleChange} required />
                <Input label="Email address" type="email" id="managerEmail" value={formData.managerEmail} onChange={handleChange} required />
                <div className="md:col-span-2">
                  <Input label="Password" type="password" id="managerPassword" value={formData.managerPassword} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2 py-3 text-base" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-espresso-900/50 mt-6">
          Already have an account? <Link href="/login" className="text-primary-600 font-semibold hover:underline">Sign in instead</Link>
        </p>
      </div>
    </div>
  );
}
