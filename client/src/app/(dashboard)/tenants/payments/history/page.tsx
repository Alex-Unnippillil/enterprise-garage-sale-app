"use client";
import React from "react";
import Header from "@/components/header";
import Loading from "@/components/loading";
import { useGetPaymentHistoryQuery } from "@/state/api";

const HistoryPage = () => {
  const { data, isLoading } = useGetPaymentHistoryQuery();

  if (isLoading) return <Loading />;

  return (
    <div className="dashboard-container">
      <Header title="Payment History" subtitle="Review your past payments" />
      <ul className="space-y-2">
        {data?.map((p) => (
          <li key={p.id} className="border p-2 rounded">
            <div>Lease: {p.leaseId}</div>
            <div>Amount Paid: {p.amountPaid}</div>
            <div>Status: {p.paymentStatus}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryPage;
