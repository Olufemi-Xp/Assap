import React from "react";
import { Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ProviderContactGateProps {
  canContact: boolean;
  phoneNumber?: string;
  whatsappNumber?: string;
  businessName: string;
}

export function ProviderContactGate({
  canContact,
  phoneNumber,
  whatsappNumber,
  businessName,
}: ProviderContactGateProps) {
  if (!canContact || (!phoneNumber && !whatsappNumber)) {
    return (
      <div className="py-2.5 px-3 rounded-lg bg-surface-subtle border border-border-subtle text-[11px] text-text-muted text-center">
        Contact details unavailable. Subscription is currently inactive.
      </div>
    );
  }

  const cleanPhone = phoneNumber ? phoneNumber.replace(/\s+/g, "") : "";
  const cleanWhatsapp = whatsappNumber ? whatsappNumber.replace(/[^\d]/g, "") : "";
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    `Hello ${businessName}, I found your listing on ASAP Nigeria and would like to ask about your services.`
  )}`;

  return (
    <div className="grid grid-cols-2 gap-2 pt-2">
      {phoneNumber && (
        <a href={`tel:${cleanPhone}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
            <Phone className="w-3.5 h-3.5" /> Call
          </Button>
        </a>
      )}
      {whatsappNumber && (
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button variant="primary" size="sm" className="w-full gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700">
            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
          </Button>
        </a>
      )}
    </div>
  );
}
