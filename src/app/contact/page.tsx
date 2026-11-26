import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { AsapLogo } from "@/components/brand/asap-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-primary">
      <header className="sticky top-0 z-40 w-full bg-canvas/95 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-[1040px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center min-h-tap">
            <AsapLogo variant="horizontal" size="md" showTagline={true} />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-[820px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-accent-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-brand tracking-tight">
            Contact Us
          </h1>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            Have a question about finding a verified tradesperson or listing your service on ASSAP? Reach our Nigerian
            support desk through any of the channels below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-border-subtle bg-surface space-y-2">
            <Mail className="w-5 h-5 text-accent-primary" />
            <h2 className="font-heading font-bold text-sm text-brand">Email</h2>
            <p className="text-xs text-text-secondary">support@assap.ng</p>
          </div>
          <div className="p-5 rounded-2xl border border-border-subtle bg-surface space-y-2">
            <Phone className="w-5 h-5 text-accent-primary" />
            <h2 className="font-heading font-bold text-sm text-brand">Phone / WhatsApp</h2>
            <p className="text-xs text-text-secondary">+234 800 000 2727</p>
          </div>
          <div className="p-5 rounded-2xl border border-border-subtle bg-surface space-y-2">
            <MapPin className="w-5 h-5 text-accent-primary" />
            <h2 className="font-heading font-bold text-sm text-brand">Coverage</h2>
            <p className="text-xs text-text-secondary">36 States &amp; Abuja FCT</p>
          </div>
        </div>
      </main>
    </div>
  );
}
