"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { LocationSelector } from "@/components/location/location-selector";
import { ServiceAreasEditor } from "@/components/providers/service-areas-editor";
import { SERVICE_CATEGORIES } from "@/lib/constants/service-categories";
import type { SelectedLocation } from "@/lib/constants/nigeria-locations";
import {
  Camera,
  Upload,
  CheckCircle2,
  RotateCcw,
  Trash2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  X,
} from "lucide-react";

export function SelfieIdCapture() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "provider";

  // Selfie camera & preview state
  const selfieVideoRef = useRef<HTMLVideoElement | null>(null);
  const selfieStreamRef = useRef<MediaStream | null>(null);
  const [selfieCameraOpen, setSelfieCameraOpen] = useState(false);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [selfieError, setSelfieError] = useState<string | null>(null);

  // Valid ID camera/upload & preview state
  const idVideoRef = useRef<HTMLVideoElement | null>(null);
  const idStreamRef = useRef<MediaStream | null>(null);
  const [idCameraOpen, setIdCameraOpen] = useState(false);
  const [idType, setIdType] = useState("nin");
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [idFileName, setIdFileName] = useState<string | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idCameraError, setIdCameraError] = useState<string | null>(null);

  // Location & Provider Business Card fields
  const [location, setLocation] = useState<SelectedLocation>({ state: "lagos", city: "", lga: "" });
  const [locationArea, setLocationArea] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceCategory, setServiceCategory] = useState("electrician");
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [serviceDescription, setServiceDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  // Submission & completion confirmation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);
  const [completedRedirect, setCompletedRedirect] = useState<string>("/provider/dashboard?trial=started");

  const stopStream = (streamRef: React.MutableRefObject<MediaStream | null>) => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  // Attach MediaStream AFTER the <video> element mounts
  useEffect(() => {
    if (selfieCameraOpen && selfieVideoRef.current && selfieStreamRef.current) {
      selfieVideoRef.current.srcObject = selfieStreamRef.current;
      selfieVideoRef.current.play().catch(() => undefined);
    }
  }, [selfieCameraOpen]);

  useEffect(() => {
    if (idCameraOpen && idVideoRef.current && idStreamRef.current) {
      idVideoRef.current.srcObject = idStreamRef.current;
      idVideoRef.current.play().catch(() => undefined);
    }
  }, [idCameraOpen]);

  // Clean up any active camera streams on unmount
  useEffect(() => {
    return () => {
      stopStream(selfieStreamRef);
      stopStream(idStreamRef);
    };
  }, []);

  const startSelfieCamera = async () => {
    setSelfieError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API is not supported in this browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      selfieStreamRef.current = stream;
      setSelfieCameraOpen(true);
    } catch (err) {
      setSelfieError(
        err instanceof Error
          ? `${err.message} You can also upload a clear selfie photo below.`
          : "Unable to access camera. You can upload a clear selfie photo below."
      );
    }
  };

  const snapSelfie = () => {
    const video = selfieVideoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setSelfiePreview(dataUrl);
    }
    stopStream(selfieStreamRef);
    setSelfieCameraOpen(false);
  };

  const handleSelfieFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setSelfiePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const startIdCamera = async () => {
    setIdCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API is not supported in this browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      idStreamRef.current = stream;
      setIdCameraOpen(true);
    } catch (err) {
      setIdCameraError(
        err instanceof Error ? err.message : "Could not open camera for ID capture. Please upload an image file."
      );
    }
  };

  const snapIdPhoto = () => {
    const video = idVideoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 960;
    canvas.height = video.videoHeight || 600;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setIdPreview(dataUrl);
      setIdFile(null);
      setIdFileName("captured-id-document.jpg");
    }
    stopStream(idStreamRef);
    setIdCameraOpen(false);
  };

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdFile(file);
    setIdFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setIdPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selfiePreview) {
      setError("Please capture or upload a live selfie photo before completing registration.");
      return;
    }
    if (!idPreview) {
      setError("Please snap or upload a clear photo of your valid government ID.");
      return;
    }
    if (role === "provider" && serviceAreas.length === 0) {
      setError("Please add at least one service area/task under your Service Business Card.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("role", role);
      formData.append("state", location.state || "lagos");
      if (location.city) formData.append("city", location.city);
      if (location.lga) formData.append("lga", location.lga);
      formData.append("locationArea", locationArea);
      formData.append("businessName", businessName);
      formData.append("serviceTitle", serviceTitle || businessName);
      formData.append("serviceCategory", serviceCategory);
      formData.append("serviceAreas", JSON.stringify(serviceAreas));
      formData.append("serviceDescription", serviceDescription);
      formData.append("phone", phone);
      formData.append("whatsapp", whatsapp || phone);
      formData.append("idType", idType);
      formData.append("selfieImage", selfiePreview);
      if (idFile) {
        formData.append("idDocumentImage", idFile);
      } else {
        formData.append("idDocumentImage", idPreview);
      }

      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Failed to complete onboarding. Please ensure you are signed in.");
      }

      const dest =
        json.data?.redirect ||
        (role === "provider" ? "/provider/dashboard?trial=started" : "/explore");
      setCompletedRedirect(dest);
      setCompletedMessage(
        role === "provider"
          ? "You have successfully completed your profile setup as a service provider. Your 30-day free trial is now active!"
          : "You have successfully completed your ASSAP profile setup!"
      );
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completedMessage) {
    return (
      <Card className="max-w-[560px] w-full mx-auto p-6 sm:p-8 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-surface-subtle text-accent-primary flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-pale/25 border border-gold-brushed/40 text-brand text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Setup Complete</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-text-primary">
            Profile Setup Completed!
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{completedMessage}</p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={completedRedirect} className="w-full sm:w-auto">
            <Button className="w-full gap-2">
              <span>{role === "provider" ? "Go to Service Provider Dashboard" : "Explore Services"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-[640px] w-full mx-auto p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-heading font-bold text-text-primary">Identity Record &amp; Profile Setup</h2>
        <p className="text-xs text-text-secondary mt-1 leading-relaxed">
          Take a live selfie, capture or upload your government ID, and set up your Service Business Card.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-status-danger-bg/50 text-status-danger-text text-xs border border-status-danger-border flex items-start gap-2 leading-relaxed">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Live Selfie Camera + Snapshot Preview Window */}
        <div className="p-4 rounded-2xl border border-border-subtle bg-surface-subtle/40 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold text-text-primary flex items-center gap-2">
              <Camera className="w-4 h-4 text-accent-primary" />
              <span>1. Live Selfie Snapshot</span>
            </label>
            {selfiePreview && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-secondary">
                <CheckCircle2 className="w-3.5 h-3.5" /> Captured
              </span>
            )}
          </div>

          {selfieError && (
            <p className="text-[11px] text-brand bg-gold-pale/25 p-2.5 rounded-lg border border-gold-brushed/40">
              {selfieError}
            </p>
          )}

          {selfiePreview ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border-2 border-accent-secondary/60 bg-black aspect-[4/3] max-h-64 mx-auto">
                <img
                  src={selfiePreview}
                  alt="Captured selfie preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-accent-primary/90 text-white text-[10px] font-bold">
                  Selfie Preview
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelfiePreview(null);
                    startSelfieCamera();
                  }}
                  className="flex-1 gap-1.5 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake Selfie
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelfiePreview(null)}
                  className="gap-1.5 text-xs text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </Button>
              </div>
            </div>
          ) : selfieCameraOpen ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-black border border-border-subtle aspect-[4/3] max-h-64 mx-auto">
                <video
                  ref={selfieVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" onClick={snapSelfie} className="flex-1 gap-1.5">
                  <Camera className="w-4 h-4" /> Capture Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    stopStream(selfieStreamRef);
                    setSelfieCameraOpen(false);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="secondary" onClick={startSelfieCamera} className="flex-1 text-xs gap-1.5">
                <Camera className="w-4 h-4" /> Open Live Camera
              </Button>
              <label className="flex-1 inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle text-xs font-medium text-text-secondary cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Selfie Photo</span>
                <input type="file" accept="image/*" onChange={handleSelfieFileUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Step 2: Valid ID Document Snap / Upload + Preview Window */}
        <div className="p-4 rounded-2xl border border-border-subtle bg-surface-subtle/40 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold text-text-primary flex items-center gap-2">
              <Upload className="w-4 h-4 text-accent-primary" />
              <span>2. Valid Government ID Document</span>
            </label>
            {idPreview && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-secondary">
                <CheckCircle2 className="w-3.5 h-3.5" /> Attached
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "nin", label: "NIN Slip" },
              { id: "voters_card", label: "Voter Card" },
              { id: "drivers_license", label: "Driver License" },
              { id: "international_passport", label: "Passport" },
            ].map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => setIdType(doc.id)}
                className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition-colors ${
                  idType === doc.id
                    ? "bg-accent-primary text-text-inverted border-accent-primary"
                    : "bg-surface text-text-secondary border-border-subtle hover:bg-surface-hover"
                }`}
              >
                {doc.label}
              </button>
            ))}
          </div>

          {idCameraError && (
            <p className="text-[11px] text-brand bg-gold-pale/25 p-2.5 rounded-lg border border-gold-brushed/40">
              {idCameraError}
            </p>
          )}

          {idPreview ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border-2 border-accent-secondary/60 bg-surface aspect-[16/10] max-h-56 mx-auto">
                <img
                  src={idPreview}
                  alt="Valid ID preview"
                  className="w-full h-full object-contain bg-slate-950/80"
                />
                <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-accent-primary/90 text-white text-[10px] font-bold">
                  {idFileName || "ID Preview"}
                </span>
              </div>
              <div className="flex gap-2">
                <label className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle text-xs font-medium text-text-primary cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Replace Image</span>
                  <input type="file" accept="image/*" onChange={handleIdUpload} className="hidden" />
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIdPreview(null);
                    setIdFile(null);
                    setIdFileName(null);
                  }}
                  className="gap-1.5 text-xs text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </Button>
              </div>
            </div>
          ) : idCameraOpen ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-black border border-border-subtle aspect-[16/10] max-h-56 mx-auto">
                <video ref={idVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2">
                <Button type="button" onClick={snapIdPhoto} className="flex-1 gap-1.5">
                  <Camera className="w-4 h-4" /> Capture ID Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    stopStream(idStreamRef);
                    setIdCameraOpen(false);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="secondary" onClick={startIdCamera} className="flex-1 text-xs gap-1.5">
                <Camera className="w-4 h-4" /> Snap Photo of ID
              </Button>
              <label className="flex-1 inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl border border-dashed border-border-subtle hover:border-accent-primary bg-surface text-xs font-medium text-text-secondary cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload ID Image</span>
                <input type="file" accept="image/*" onChange={handleIdUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Step 3: Location & Service Business Card Details */}
        <div className="space-y-4">
          <LocationSelector value={location} onChange={setLocation} compact />

          <Input
            label="Town or Neighborhood"
            placeholder="e.g. Yaba, Ikeja, Maitama"
            value={locationArea}
            onChange={(e) => setLocationArea(e.target.value)}
            required
          />

          {role === "provider" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Business or Trade Name"
                  placeholder="e.g. Tunde Professional Plumbing"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
                <Input
                  label="Service Title"
                  placeholder="e.g. Electrician, Fashion Designer"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="onb-category" className="block text-xs font-medium text-text-primary mb-1">
                  Trade Category
                </label>
                <select
                  id="onb-category"
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border-subtle bg-surface text-text-primary text-xs min-h-tap"
                >
                  {SERVICE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <ServiceAreasEditor
                value={serviceAreas}
                onChange={setServiceAreas}
                category={serviceCategory}
              />

              <Input
                label="Additional Service Summary (optional)"
                placeholder="Briefly describe your experience or availability..."
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Phone Number"
                  placeholder="+2348012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <Input
                  label="WhatsApp Number"
                  placeholder="+2348012345678"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                />
              </div>

              <p className="text-xs text-text-muted leading-relaxed">
                First month free. Your Service Business Card and direct contacts become visible immediately upon
                registration. Renewal is &#8358;1,000 monthly.
              </p>
            </>
          )}
        </div>

        <Button type="submit" className="w-full font-semibold" isLoading={isSubmitting}>
          {role === "provider" ? "Complete Registration and Start Free Trial" : "Complete Registration"}
        </Button>
      </form>
    </Card>
  );
}
