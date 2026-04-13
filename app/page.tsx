
'use client'

import { useEffect, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import * as htmlToImage from 'html-to-image'
import Image from 'next/image'
import Link from 'next/link'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, CheckCircle2, Download, Car } from 'lucide-react'
import { toast } from 'sonner'
import { useFormDraftStore } from '@/stores/useFormDraftStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { apiRequest } from '@/lib/apiRequest'
import { z } from 'zod'
import {
  EVEventRegistrationSchema,
} from '@/validations/registrationSchema'



type FormInput = z.input<typeof EVEventRegistrationSchema>
type FormOutput = z.output<typeof EVEventRegistrationSchema>

export default function EVreadyRegistrationPage() {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [regNum, setRegNum] = useState<string | null>(null)
  const [showQr, setShowQr] = useState(false)
  const [agree, setAgree] = useState(false)
  const [termsError, setTermsError] = useState<string | null>(null)

  const DRAFT_KEY = 'ev-event-form'

  const webinarDraft = useFormDraftStore(
    (state) => state.drafts[DRAFT_KEY]
  )

  const setDraft = useFormDraftStore((state) => state.setDraft)
  const clearDraft = useFormDraftStore((state) => state.clearDraft)

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(EVEventRegistrationSchema),
    defaultValues: webinarDraft || {
      name: '',
      age: undefined,
      address: '',
      city: '',
      mobile: '',
      email: '',
      gender: undefined,
      profession: '',
      visitingDay: undefined,
    },
  })

  const watchedValues = useWatch({ control })

  /* -------- AUTO CITY -------- */
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        if (data?.city) setValue('city', data.city)
      })
      .catch(() => { })
  }, [setValue])

  useEffect(() => {
    if (!success) setDraft(DRAFT_KEY, watchedValues)
  }, [watchedValues, success, setDraft])

  const handleNewRegistration = () => {
    reset()
    clearDraft(DRAFT_KEY)
    setAgree(false)
    setTermsError(null)
    setSuccess(false)
    setShowQr(false)
  }

  const onSubmit = async (data: FormOutput) => {
    if (!agree) {
      setTermsError('Please accept Terms & Conditions.')
      return
    }

    setSubmitting(true)

    try {
      const response = await apiRequest({
        endpoint: '/api/registers',
        method: 'POST',
        body: data,
      })

      if (!response?.data?.regNum) {
        throw new Error('Invalid response from server')
      }

      setRegNum(response.data.regNum)
      setSuccess(true)
      clearDraft(DRAFT_KEY)

      toast.success('Registration successful ⚡')

      setTimeout(() => setShowQr(true), 1200)
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const downloadQrCard = async () => {
    const node = document.getElementById('evready-qr-card')

    if (!node) {
      toast.error('QR not ready yet')
      return
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 300))

      const dataUrl = await htmlToImage.toPng(node, {
        backgroundColor: '#ffffff',
        pixelRatio: 3,
        cacheBust: true,
      })

      const link = document.createElement('a')
      link.download = `${regNum}-ev-pass.png`
      link.href = dataUrl
      link.click()

    } catch (error) {
      console.error(error)
      toast.error('Download failed. Try again.')
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-gradient-to-b from-green-50 to-green-100">

      {/* Banner */}
      <div className="relative w-full h-[180px] md:h-[420px] overflow-hidden">
        <Image
          src="/2.png"
          loading="eager"
          alt="EV Event"
          fill
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md shadow-xl border-green-200">
          <CardContent className="p-6 space-y-5">

            {!success ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* 🔥 TOP HEADER */}
                <div className="text-center space-y-1 border-b pb-4">
                  <h1 className="text-xl font-bold text-green-800">
                    6th Edition of Times Property Expo
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    An EV Initiative by The Times of India
                  </p>
                  <p className="text-sm font-semibold text-green-700 mt-2">
                    Registration Form
                  </p>
                </div>

                <Field label="Full Name" error={errors.name?.message}>
                  <Controller name="name" control={control} render={({ field }) => (
                    <Input {...field} placeholder="Enter your full name" />
                  )} />
                </Field>

                <Field label="Age" error={errors.age?.message}>
                  <Controller
                    name="age"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Enter your age"
                        value={
                          typeof field.value === 'number' || typeof field.value === 'string'
                            ? field.value
                            : ''
                        }
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                </Field>

                <Field label="Address" error={errors.address?.message}>
                  <Controller name="address" control={control} render={({ field }) => (
                    <Input {...field} placeholder="Enter your address" />
                  )} />
                </Field>

                <Field label="City" error={errors.city?.message}>
                  <Controller name="city" control={control} render={({ field }) => (
                    <Input {...field} placeholder="Auto detected city" />
                  )} />
                </Field>

                <Field label="Mobile" error={errors.mobile?.message}>
                  <Controller name="mobile" control={control} render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter 10 digit mobile"
                      maxLength={10}
                      onChange={(e) =>
                        field.onChange(e.target.value.replace(/\D/g, ''))
                      }
                    />
                  )} />
                </Field>

                <Field label="Email" error={errors.email?.message}>
                  <Controller name="email" control={control} render={({ field }) => (
                    <Input {...field} placeholder="Enter your email" />
                  )} />
                </Field>

                <Field label="Gender" error={errors.gender?.message}>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className='w-full p-3'><SelectValue placeholder="Select gender" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>

                <Field label="Profession" error={errors.profession?.message}>
                  <Controller name="profession" control={control} render={({ field }) => (
                    <Input {...field} placeholder="Enter your profession" />
                  )} />
                </Field>

                <Field label="Visiting Day" error={errors.visitingDay?.message}>
                  <Controller
                    name="visitingDay"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ''}
                      >
                        <SelectTrigger className='w-full p-3'><SelectValue placeholder="Select visiting day" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day1">Saturday, 18 April 2026</SelectItem>
                          <SelectItem value="day2">Sunday, 19 April 2026</SelectItem>
                          <SelectItem value="all">Both Day (18–19 April 2026)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>

                {/* Terms */}
                <div className="flex gap-2">
                  <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} />
                  <Label className="text-sm">
                    I agree to <Link href="/term-and-condition" className="underline text-green-700">Terms and Conditions</Link>
                  </Label>
                </div>

                {termsError && <p className="text-red-500 text-sm">{termsError}</p>}

                <Button type="submit" disabled={submitting} className="w-full bg-green-700 hover:bg-green-800">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitting ? 'Registering...' : 'Register Now'}
                </Button>

              </form>
            ) : (
              <div className="text-center py-10 px-6">

                <div className="flex justify-center">
                  <div className="bg-green-100 rounded-full p-6">
                    <CheckCircle2 className="h-16 w-16 text-green-700" />
                  </div>
                </div>

                <h2 className="mt-6 text-2xl font-bold text-green-800">
                  Registration Successful 🎉
                </h2>

                <p className="mt-2 text-gray-600 text-sm">
                  Your pass for <span className="font-semibold">6th Edition of Times Property Expo 2026</span> is confirmed.
                </p>

                {regNum && (
                  <div className="mt-4 inline-block bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                    Registration No: {regNum}
                  </div>
                )}

                {showQr && (
                  <div className="mt-8 space-y-5">

                    {/* 🔥 WALLET STYLE CARD */}
                    <div
                      id="evready-qr-card"
                      className="relative mx-auto w-[320px] rounded-2xl overflow-hidden shadow-xl border bg-white"
                    >
                      {/* Header */}
                      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white py-3 text-center">
                        <p className="text-sm font-semibold">
                          6th Edition of Times Property Expo
                        </p>
                        <p className="text-xs opacity-80">
                          The Times of India Initiative
                        </p>
                      </div>

                      {/* Body */}
                      <div className="relative p-6 flex flex-col items-center space-y-4">

                        {/* 🔥 WATERMARK */}
                        <Image
                          src="/logo.png" // put your logo in public folder
                          alt="logo"
                          width={120}
                          height={120}
                          className="absolute opacity-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        />
                        {/* QR Container */}
                        <div className="mt-3 flex justify-center">
                          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <QRCodeCanvas value={regNum ?? ''} size={160} />
                          </div>
                        </div>



                        <p className="text-xs text-gray-500 text-center">
                          Scan at entry gate
                        </p>

                        {/* Divider */}
                        <div className="w-full border-t border-dashed"></div>

                        {/* Footer Info */}
                        <div className="text-xs text-gray-600 text-center">
                          Valid for entry • Do not share
                        </div>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={downloadQrCard}
                        className="w-full"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}

                <div className="my-8 border-t border-gray-200"></div>

                <Button
                  onClick={handleNewRegistration}
                  className="w-full bg-green-700 hover:bg-green-800"
                >
                  New Registration
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ✅ FOOTER RESTORED */}
      <footer className="border-t bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} All Rights Reserved. Powered by SaaScraft Studio (India) Pvt. Ltd.
        </div>
      </footer>
    </div>
  )
}

/* Reusable Field */
function Field({ label, error, children }: any) {
  return (
    <div className="grid gap-1">
      <Label>{label} *</Label>
      {children}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}