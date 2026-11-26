import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Flag, CreditCard, UserCheck, AlertTriangle } from "lucide-react";

export default function AdminModerationPage() {
  const reports = [
    {
      id: "rep-1",
      reportedUser: "Fake Profile Demo",
      reason: "fake_profile_or_id",
      status: "open",
      details: "Claimed to be licensed in Abuja without matching ID credentials.",
      time: "2 hours ago",
    },
    {
      id: "rep-2",
      reportedUser: "Unverified Artisan",
      reason: "misleading_service",
      status: "under_review",
      details: "Did not show up for scheduled plumbing appointment in Surulere.",
      time: "1 day ago",
    },
  ];

  const recentPayments = [
    {
      ref: "ASAP_SUB_173235001",
      provider: "Tunde Reliable Plumbing",
      amount: "₦1,000",
      status: "succeeded",
      date: "Today, 08:14",
    },
    {
      ref: "ASAP_SUB_173235002",
      provider: "Emeka Spark Solutions",
      amount: "₦1,000",
      status: "succeeded",
      date: "Yesterday, 19:30",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1000px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-text-primary">
              Operator Moderation & Oversight
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Safety reports, identity traceability audit, and Paystack subscription logs.
            </p>
          </div>
          <Badge variant="info">Admin Privileges Active</Badge>
        </div>

        {/* Safety Reports Queue */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-heading font-bold text-text-primary flex items-center gap-2">
              <Flag className="w-4 h-4 text-red-500" /> Community Safety Reports
            </h2>
            <Badge variant="danger">2 Open</Badge>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 rounded-xl border border-border-subtle bg-surface-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-text-primary">{rep.reportedUser}</span>
                    <Badge variant="warning">{rep.reason.replace(/_/g, " ")}</Badge>
                  </div>
                  <p className="text-xs text-text-secondary">{rep.details}</p>
                  <p className="text-[11px] text-text-muted">{rep.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" className="text-xs">
                    Inspect ID
                  </Button>
                  <Button variant="destructive" size="sm" className="text-xs">
                    Suspend User
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Paystack Webhook & Subscription Log */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-heading font-bold text-text-primary flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-accent-primary" /> Paystack Subscription Transactions
            </h2>
            <span className="text-xs text-text-muted">₦1,000 / month renewals</span>
          </div>

          <div className="divide-y divide-border-subtle text-xs">
            {recentPayments.map((p) => (
              <div key={p.ref} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-text-primary">{p.provider}</p>
                  <p className="text-[11px] text-text-muted font-mono">{p.ref}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent-primary tabular-nums">{p.amount}</p>
                  <Badge variant="success">Verified Webhook</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
