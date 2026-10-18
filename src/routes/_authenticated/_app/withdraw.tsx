import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Card, PageTitle, StatusBadge } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { errMsg, maskAccount, money, useBalances, useSettings } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/_app/withdraw")({
  head: () => ({ meta: [{ title: "Withdrawal — Earn to Each Other" }, { name: "description", content: "Withdraw your earnings." }, { property: "og:title", content: "Withdrawal — Earn to Each Other" }, { property: "og:description", content: "Withdraw your earnings." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: WithdrawPage,
});

function WithdrawPage() {
  const qc = useQueryClient();
  const { data: b } = useBalances();
  const { data: s } = useSettings();
  const { data: methods } = useQuery({ queryKey: ["payout-methods"], queryFn: async () => (await supabase.from("payout_methods").select("*").order("created_at", { ascending: false })).data ?? [] });
  const { data: history } = useQuery({ queryKey: ["withdrawals"], queryFn: async () => (await supabase.from("withdrawals").select("*").order("created_at", { ascending: false })).data ?? [] });
  const [sel, setSel] = useState<string>();
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const methodId = sel ?? methods?.[0]?.id;
  const amt = Number(amount) || 0;
  const fee = s ? Math.round((amt * Number(s.fee_percent ?? 0) / 100 + Number(s.fee_flat ?? 0)) * 100) / 100 : 0;

  async function request() {
    if (!methodId) { toast.error("Add a payout account first"); return; }
    setBusy(true);
    const { error } = await supabase.rpc("request_withdrawal", { _amount: amt, _payout_method_id: methodId });
    setBusy(false);
    if (error) { toast.error(errMsg(error)); return; }
    toast.success("Withdrawal requested");
    setAmount("");
    ["balances", "withdrawals"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
  }

  return (
    <div className="space-y-5">
      <PageTitle title="Withdrawal" sub={`Minimum ${money(s?.min_withdrawal)} · Fee ${s?.fee_percent ?? 0}%`} />
      <div className="rounded-3xl bg-hero p-5 text-primary-foreground shadow-elegant">
        <p className="text-sm opacity-85">Available to withdraw</p>
        <p className="font-display text-3xl font-bold">{money(b?.available)}</p>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Payout account</h2><Button variant="soft" size="sm" onClick={() => setAdding((x) => !x)}>{adding ? "Cancel" : "+ Add"}</Button></div>
        {adding && <AddMethod onDone={() => { setAdding(false); qc.invalidateQueries({ queryKey: ["payout-methods"] }); }} />}
        <div className="space-y-2">
          {methods?.map((m) => (
            <button key={m.id} onClick={() => setSel(m.id)} className={cn("flex w-full items-center justify-between rounded-xl border p-3 text-left", methodId === m.id && "border-primary bg-primary-soft")}>
              <span><span className="block text-sm font-semibold">{m.holder_name}</span><span className="text-xs text-muted-foreground">{m.method_type === "upi" ? m.upi_id : `${m.bank_name} ${maskAccount(m.account_number)}`}</span></span>
              <StatusBadge status={m.verification_status} />
            </button>
          ))}
          {!methods?.length && !adding && <p className="text-sm text-muted-foreground">No payout account yet.</p>}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold">Amount</h2>
        <Input inputMode="decimal" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} />
        {amt > 0 && <p className="mt-2 text-sm text-muted-foreground">Fee {money(fee)} · You receive <b className="text-foreground">{money(Math.max(0, amt - fee))}</b></p>}
        <Button className="mt-4 w-full" disabled={busy || amt <= 0} onClick={request}>{busy ? "Requesting…" : "Request withdrawal"}</Button>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold">History</h2>
        {history?.length ? history.map((w) => (
          <div key={w.id} className="flex items-center justify-between border-b py-3 last:border-0">
            <div><p className="font-semibold">{money(w.amount, w.currency)}</p><p className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleString()}{w.provider_reference && ` · Ref ${w.provider_reference}`}</p></div>
            <StatusBadge status={w.status} />
          </div>
        )) : <p className="text-sm text-muted-foreground">No withdrawals yet.</p>}
      </Card>
    </div>
  );
}

function AddMethod({ onDone }: { onDone: () => void }) {
  const [type, setType] = useState<"upi" | "bank">("upi");
  const [f, setF] = useState({ holder_name: "", upi_id: "", bank_name: "", account_number: "", ifsc: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  async function save() {
    if (f.holder_name.trim().length < 2) { toast.error("Enter account holder name"); return; }
    if (type === "upi" && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(f.upi_id)) { toast.error("Enter a valid UPI ID"); return; }
    if (type === "bank" && (!/^\d{9,18}$/.test(f.account_number) || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(f.ifsc.toUpperCase()))) { toast.error("Check account number and IFSC"); return; }
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("payout_methods").insert({
      user_id: u.user!.id, method_type: type, holder_name: f.holder_name.trim(),
      ...(type === "upi" ? { upi_id: f.upi_id } : { bank_name: f.bank_name, account_number: f.account_number, ifsc: f.ifsc.toUpperCase() }),
    });
    if (error) { toast.error(errMsg(error)); return; }
    toast.success("Payout account added — pending verification");
    onDone();
  }
  return (
    <div className="mb-4 space-y-2 rounded-xl bg-muted p-3">
      <div className="grid grid-cols-2 gap-2">
        {(["upi", "bank"] as const).map((t) => <Button key={t} size="sm" variant={type === t ? "default" : "outline"} onClick={() => setType(t)}>{t === "upi" ? "UPI" : "Bank"}</Button>)}
      </div>
      <Input placeholder="Account holder name" value={f.holder_name} onChange={set("holder_name")} />
      {type === "upi" ? <Input placeholder="UPI ID (name@bank)" value={f.upi_id} onChange={set("upi_id")} /> : (
        <>
          <Input placeholder="Bank name" value={f.bank_name} onChange={set("bank_name")} />
          <Input inputMode="numeric" placeholder="Account number" value={f.account_number} onChange={set("account_number")} />
          <Input placeholder="IFSC code" value={f.ifsc} onChange={set("ifsc")} />
        </>
      )}
      <Button className="w-full" size="sm" onClick={save}>Save</Button>
    </div>
  );
}
