"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import * as htmlToImage from "html-to-image";
import { Download, Loader2, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";

export default function BadgePage() {
  const { regCode } = useParams();
  const router = useRouter();
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (regCode) {
      fetchRegistration();
    }
  }, [regCode]);

  const fetchRegistration = async () => {
    try {
      const response = await fetch(`/api/badge/${regCode}`);
      const data = await response.json();
      setRegistration(data);
    } catch (error) {
      toast.error("Failed to load badge");
    } finally {
      setLoading(false);
    }
  };

  const downloadBadge = async () => {
    const element = document.getElementById("badge-card");
    if (!element) return;

    try {
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `${regCode}-badge.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Badge downloaded!");
    } catch (error) {
      toast.error("Failed to download badge");
    }
  };

  const goHome = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-600">Registration not found</p>
            <Button onClick={goHome} className="mt-4 w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="fixed top-4 left-4 z-10 flex gap-2">
        <Button
          onClick={goHome}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur"
        >
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
      </div>

      <div
        id="badge-card"
        className="bg-white rounded-2xl shadow-2xl overflow-hidden w-[400px]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-6 text-center">
          <h2 className="text-xl font-bold">TCT Event Pass</h2>
          <p className="text-sm opacity-90">Tech Conference & Training</p>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {registration.name}
          </h3>

          <div className="space-y-2 mb-6">
            <p className="text-gray-600">
              <span className="font-semibold">Reg ID:</span>{" "}
              {registration.regCode}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">City:</span> {registration.city}
            </p>
          </div>

          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-xl border-2 border-indigo-200">
              <QRCodeCanvas value={registration.regCode} size={120} />
            </div>
          </div>

          <p className="text-xs text-gray-500">Scan QR code at event entry</p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 text-center border-t">
          <p className="text-xs text-gray-500">
            Valid for single entry • Non-transferable
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          onClick={downloadBadge}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Badge
        </Button>
        <Button
          onClick={goHome}
          variant="outline"
          className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
        >
          Register Another
        </Button>
      </div>
    </div>
  );
}
