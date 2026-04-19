"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Users,
  Calendar,
  Download,
  Search,
  ClipboardList,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Registration {
  _id: string;
  regCode: string;
  name: string;
  email: string;
  mobile: string;
  city: string;
  createdAt: string;
  badgeUrl: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
    fetchRegistrations();
  }, [router]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/registrations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      // Ensure data is an array
      if (Array.isArray(data)) {
        setRegistrations(data);
      } else if (data.data && Array.isArray(data.data)) {
        setRegistrations(data.data);
      } else if (data.registrations && Array.isArray(data.registrations)) {
        setRegistrations(data.registrations);
      } else {
        console.error("Unexpected API response format:", data);
        setRegistrations([]);
        toast.error("Failed to load registrations: Invalid data format");
      }
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
      setRegistrations([]);
      toast.error("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const exportToCSV = () => {
    const headers = ["Reg ID", "Name", "Email", "Mobile", "City", "Date"];
    const csvData = filteredRegistrations.map((reg) => [
      reg.regCode,
      reg.name,
      reg.email,
      reg.mobile,
      reg.city,
      new Date(reg.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tct-registrations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  const filteredRegistrations = Array.isArray(registrations)
    ? registrations.filter(
        (reg) =>
          reg.name?.toLowerCase().includes(search.toLowerCase()) ||
          reg.regCode?.toLowerCase().includes(search.toLowerCase()) ||
          reg.mobile?.includes(search),
      )
    : [];

  const todayRegistrations = Array.isArray(registrations)
    ? registrations.filter(
        (r) =>
          new Date(r.createdAt).toDateString() === new Date().toDateString(),
      ).length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">
              TCT Registration System
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, <strong>{user?.name}</strong>
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
              className="px-4 py-2 text-gray-600 hover:text-indigo-600 font-medium"
            >
              <ClipboardList className="inline-block w-4 h-4 mr-2" />
              Registration Form
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-indigo-600 border-b-2 border-indigo-600 font-medium"
            >
              <LayoutDashboard className="inline-block w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - grows to push footer down */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Registrations</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      {registrations.length}
                    </p>
                  </div>
                  <Users className="h-12 w-12 text-indigo-200" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Today's Registrations
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {todayRegistrations}
                    </p>
                  </div>
                  <Calendar className="h-12 w-12 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Export Data</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={exportToCSV}
                      disabled={filteredRegistrations.length === 0}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Registrations Table */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recent Registrations</h2>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, ID, or mobile"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {filteredRegistrations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No registrations found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          Reg ID
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          Mobile
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          City
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredRegistrations.map((reg) => (
                        <tr key={reg._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-mono text-indigo-600">
                            {reg.regCode}
                          </td>
                          <td className="px-4 py-3 text-sm">{reg.name}</td>
                          <td className="px-4 py-3 text-sm">{reg.email}</td>
                          <td className="px-4 py-3 text-sm">{reg.mobile}</td>
                          <td className="px-4 py-3 text-sm">{reg.city}</td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(reg.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                window.open(reg.badgeUrl, "_blank")
                              }
                            >
                              View Badge
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
