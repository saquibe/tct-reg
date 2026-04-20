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
  AlertCircle,
  Check,
  XCircle,
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

  // Real-time validation states
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [checkingMobile, setCheckingMobile] = useState(false);
  const [mobileExists, setMobileExists] = useState(false);
  const [mobileMessage, setMobileMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
  });

  const watchedEmail = watch("email");
  const watchedMobile = watch("mobile");

  // Check if email already exists (debounced)
  useEffect(() => {
    if (!watchedEmail || watchedEmail.length < 5) {
      setEmailExists(false);
      setEmailMessage("");
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      checkEmailExists(watchedEmail);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [watchedEmail]);

  // Check if mobile already exists (debounced)
  useEffect(() => {
    if (!watchedMobile || watchedMobile.length < 10) {
      setMobileExists(false);
      setMobileMessage("");
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      checkMobileExists(watchedMobile);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [watchedMobile]);

  const checkEmailExists = async (email: string) => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return;

    setCheckingEmail(true);
    try {
      const response = await fetch(
        `/api/check-registration?email=${encodeURIComponent(email)}`,
      );
      const data = await response.json();

      if (data.exists) {
        setEmailExists(true);
        setEmailMessage(`This email is already registered`);
        setError("email", {
          type: "manual",
          message: `This email is already registered`,
        });
      } else {
        setEmailExists(false);
        setEmailMessage("");
        clearErrors("email");
      }
    } catch (error) {
      console.error("Error checking email:", error);
    } finally {
      setCheckingEmail(false);
    }
  };

  const checkMobileExists = async (mobile: string) => {
    if (mobile.length !== 10) return;

    setCheckingMobile(true);
    try {
      const response = await fetch(`/api/check-registration?mobile=${mobile}`);
      const data = await response.json();

      if (data.exists) {
        setMobileExists(true);
        setMobileMessage(`This mobile number is already registered`);
        setError("mobile", {
          type: "manual",
          message: `This mobile number is already registered`,
        });
      } else {
        setMobileExists(false);
        setMobileMessage("");
        clearErrors("mobile");
      }
    } catch (error) {
      console.error("Error checking mobile:", error);
    } finally {
      setCheckingMobile(false);
    }
  };

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
    // Double check if email or mobile exists before submitting
    if (emailExists || mobileExists) {
      toast.error("Email or mobile number is already registered");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          if (result.existingRegCode) {
            toast.error(
              `${result.error}. Your existing registration ID is: ${result.existingRegCode}`,
            );
          } else {
            toast.error(result.error);
          }
        } else {
          throw new Error(result.error);
        }
        return;
      }

      setRegCode(result.regCode);
      setBadgeUrl(result.badgeUrl);
      setSuccess(true);
      toast.success("Registration successful! Check your SMS and Email.");
      reset();
      // Reset validation states
      setEmailExists(false);
      setMobileExists(false);
      setEmailMessage("");
      setMobileMessage("");
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
    reset();
    setEmailExists(false);
    setMobileExists(false);
    setEmailMessage("");
    setMobileMessage("");
  };

  // Show loading while checking auth
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Check if form is valid and no duplicates
  const isFormValid =
    !emailExists &&
    !mobileExists &&
    !errors.name &&
    !errors.email &&
    !errors.city &&
    !errors.mobile &&
    watchedEmail &&
    watchedMobile &&
    watchedEmail.length > 0 &&
    watchedMobile.length === 10;

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
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
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
                        className={`pl-10 pr-10 ${emailExists ? "border-red-500" : emailExists === false && watchedEmail ? "border-green-500" : ""}`}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {checkingEmail && (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        )}
                        {!checkingEmail && emailExists && (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        {!checkingEmail &&
                          !emailExists &&
                          watchedEmail &&
                          watchedEmail.length > 5 && (
                            <Check className="w-4 h-4 text-green-500" />
                          )}
                      </div>
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email.message}
                      </p>
                    )}
                    {emailMessage && !errors.email && (
                      <p className="text-amber-600 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {emailMessage}
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
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
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
                        className={`pl-10 pr-10 ${mobileExists ? "border-red-500" : mobileExists === false && watchedMobile?.length === 10 ? "border-green-500" : ""}`}
                        maxLength={10}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {checkingMobile && (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        )}
                        {!checkingMobile && mobileExists && (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        {!checkingMobile &&
                          !mobileExists &&
                          watchedMobile?.length === 10 && (
                            <Check className="w-4 h-4 text-green-500" />
                          )}
                      </div>
                    </div>
                    {errors.mobile && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.mobile.message}
                      </p>
                    )}
                    {mobileMessage && !errors.mobile && (
                      <p className="text-amber-600 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {mobileMessage}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting || !isFormValid}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  We've sent your badge link via SMS and Email. Click the link
                  to view and download your badge.
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
