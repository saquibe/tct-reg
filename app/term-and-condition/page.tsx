'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function TermsAndConditionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-sm p-6 flex flex-col">

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Registration
        </button>

        {/* Content */}
        <div className="flex-1">
          {loading ? <Skeleton /> : <TermsContent router={router} />}
        </div>

        {/* Footer */}
        {!loading && (
          <p className="text-xs text-gray-500 pt-6 border-t text-center mt-10">
            © {new Date().getFullYear()} SaaScraft Studio (India) Pvt. Ltd.
          </p>
        )}
      </div>
    </div>
  )
}

/* ---------------- Skeleton Loader ---------------- */

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-11/12" />
      <div className="h-4 bg-gray-200 rounded w-10/12" />
      <div className="h-4 bg-gray-200 rounded w-9/12" />
    </div>
  )
}

/* ---------------- Terms Content ---------------- */

function TermsContent({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-semibold text-gray-900">
        6th Edition of Times Property Expo <br />
        Registration – Terms & Conditions
      </h1>

      <p className="text-sm text-gray-600">
        By registering for the 6th Edition of Times Property Expo, an initiative by
        The Times of India, you agree to the following Terms & Conditions. Please
        review them carefully before proceeding with your registration.
      </p>

      <section>
        <h2 className="font-medium text-gray-800 mb-2">
          1. Event Registration
        </h2>
        <p className="text-sm text-gray-600">
          Registration is subject to availability and successful submission of
          the registration form. Completion of the form does not guarantee entry
          unless confirmed by the organizers.
        </p>
      </section>

      <section>
        <h2 className="font-medium text-gray-800 mb-2">
          2. Registration Validity
        </h2>
        <p className="text-sm text-gray-600">
          Each registration is valid for a single attendee and is non-transferable.
          The selected visiting day(s) will determine access to the event.
        </p>
      </section>

      <section>
        <h2 className="font-medium text-gray-800 mb-2">
          3. Email & Mobile Information
        </h2>
        <p className="text-sm text-gray-600">
          You must provide a valid email address and mobile number. All event-related
          communication, including confirmation, registration number, and QR code,
          will be sent to your registered contact details.
        </p>
      </section>

      <section>
        <h2 className="font-medium text-gray-800 mb-2">
          4. Entry & Verification
        </h2>
        <p className="text-sm text-gray-600">
          Upon successful registration, you will receive a unique registration
          number and QR code. This QR code must be presented at the venue for
          entry and verification.
        </p>
      </section>

      <section>
        <h2 className="font-medium text-gray-800 mb-2">
          5. Data Usage & Privacy
        </h2>
        <p className="text-sm text-gray-600">
          Personal information collected during registration will be used solely
          for event management, communication, analytics, and verification
          purposes. Your data will not be shared with third parties without
          consent, except where required by law.
        </p>
      </section>

      <section>
        <h2 className="font-medium text-gray-800 mb-2">
          6. Event Changes & Liability
        </h2>
        <p className="text-sm text-gray-600">
          The organizers reserve the right to modify event schedules, venue
          arrangements, or other details without prior notice. The organizers
          shall not be held liable for any loss, damage, or inconvenience caused
          due to unforeseen circumstances.
        </p>
      </section>

      <section>
        <h2 className="font-medium text-gray-800 mb-2">
          7. Amendments
        </h2>
        <p className="text-sm text-gray-600">
          These Terms & Conditions may be updated at any time. Continued use of
          the registration platform implies acceptance of the revised terms.
        </p>
      </section>

      {/* Accept Button */}
      <div className="pt-8 flex justify-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white px-6">
              I Accept Terms & Conditions
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Confirm Acceptance
              </AlertDialogTitle>
              <AlertDialogDescription>
                By confirming, you acknowledge that you have read and agree to
                the 6th Edition of Times Property Expo Registration Terms & Conditions.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => router.back()}
                >
                  Confirm
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

    </div>
  )
}
