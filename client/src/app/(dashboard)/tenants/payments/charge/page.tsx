"use client";
import React, { useState } from "react";
import Header from "@/components/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChargePaymentMutation } from "@/state/api";

const ChargePage = () => {
  const [amount, setAmount] = useState("");
  const [leaseId, setLeaseId] = useState("");
  const [chargePayment, { data }] = useChargePaymentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await chargePayment({ amount: Number(amount), leaseId: Number(leaseId) });
  };

  return (
    <div className="dashboard-container">
      <Header title="Make a Payment" subtitle="Charge your rent" />
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <Input
          placeholder="Lease ID"
          value={leaseId}
          onChange={(e) => setLeaseId(e.target.value)}
        />
        <Input
          placeholder="Amount (cents)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button type="submit">Create Charge</Button>
      </form>
      {data && <p className="pt-4">Client Secret: {data.clientSecret}</p>}
    </div>
  );
};

export default ChargePage;
