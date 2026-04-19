"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  User,
  Mail,
  Phone,
  MapPin,
  LogOut,
  LayoutDashboard,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  city: z.string().min(2, "City is required"),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [regCode, setRegCode] = useState<string | null>(null);
  const [badgeUrl, setBadgeUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
  });

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const onSubmit = async (data: RegistrationForm) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      setRegCode(result.regCode);
      setBadgeUrl(result.badgeUrl);
      setSuccess(true);
      toast.success(
        "Registration successful! Check your SMS, Email, and WhatsApp.",
      );
      reset();
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewRegistration = () => {
    setSuccess(false);
    setRegCode(null);
    setBadgeUrl(null);
  };

  // Show loading while checking auth
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">
              TCT Registration System
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, <strong>{user.name}</strong>
              </span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-4 mt-4 border-b">
            <Link
              href="/"
              className="px-4 py-2 text-indigo-600 border-b-2 border-indigo-600 font-medium"
            >
              <ClipboardList className="inline-block w-4 h-4 mr-2" />
              Registration Form
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-600 hover:text-indigo-600 font-medium"
            >
              <LayoutDashboard className="inline-block w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Flex grow to push footer down */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-6 space-y-6">
            {!success ? (
              <>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-gray-800">
                    TCT Event Registration
                  </h2>
                  <p className="text-sm text-gray-500">
                    Register to get your event badge
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        {...register("name")}
                        placeholder="Enter your full name"
                        className="pl-10"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-sm">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        {...register("email")}
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>City *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        {...register("city")}
                        placeholder="Enter your city"
                        className="pl-10"
                      />
                    </div>
                    {errors.city && (
                      <p className="text-red-500 text-sm">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Mobile Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        {...register("mobile")}
                        placeholder="10-digit mobile number"
                        className="pl-10"
                        maxLength={10}
                      />
                    </div>
                    {errors.mobile && (
                      <p className="text-red-500 text-sm">
                        {errors.mobile.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {submitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {submitting ? "Registering..." : "Register Now"}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="flex justify-center mb-6">
                  <div className="bg-green-100 rounded-full p-4">
                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Registration Successful! 🎉
                </h2>
                <p className="text-gray-600 mb-4">
                  Your registration ID:{" "}
                  <strong className="text-indigo-600">{regCode}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  We've sent your badge link via SMS, Email, and WhatsApp. Click
                  the link to view and download your badge.
                </p>

                {badgeUrl && (
                  <Button
                    onClick={() => window.open(badgeUrl, "_blank")}
                    variant="outline"
                    className="mb-4"
                  >
                    View Badge
                  </Button>
                )}

                <div className="mt-6 pt-6 border-t">
                  <Button onClick={handleNewRegistration} variant="ghost">
                    Register Another Person
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer - Always at bottom */}
      <footer className="border-t bg-white/70">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} TCT Events. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
