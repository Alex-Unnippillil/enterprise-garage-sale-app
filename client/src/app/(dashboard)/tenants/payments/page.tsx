"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import Loading from "@/components/loading";
import { useGetAuthUserQuery, useGetPaymentsQuery } from "@/state/api";
import { format } from "date-fns";

const Payments = () => {
  const { data: authUser, isLoading: userLoading } = useGetAuthUserQuery();
  const leaseId = (authUser as any)?.userInfo?.leaseId;
  const { data: payments, isLoading: paymentsLoading } = useGetPaymentsQuery(leaseId!, {
    skip: !leaseId,
  });

  if (userLoading || paymentsLoading) return <Loading />;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "Overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="dashboard-container space-y-4">
      <Header
        title="Payment Management"
        subtitle="Track your rent payments and payment history"
      />
      {payments?.map((payment) => (
        <Card key={payment.id}>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Payment #{payment.id}</CardTitle>
            {getStatusBadge(payment.paymentStatus)}
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Amount Due</span>
              <span>${payment.amountDue}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Due Date</span>
              <span>{format(new Date(payment.dueDate), "MMM dd, yyyy")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Amount Paid</span>
              <span>${payment.amountPaid}</span>
            </div>
          </CardContent>
        </Card>
      ))}
      {payments && payments.length === 0 && (
        <p className="text-center text-muted-foreground">No payments found.</p>
      )}
    </div>
  );
};

export default Payments;
