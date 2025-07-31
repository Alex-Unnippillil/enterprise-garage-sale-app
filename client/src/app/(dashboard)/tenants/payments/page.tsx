"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Calendar, DollarSign, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import PaymentForm from "@/components/PaymentForm";
import { format } from "date-fns";

interface Payment {
  id: number;
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  paymentDate?: string;
  paymentStatus: string;
  paymentMethod?: string;
  lateFee: number;
  description?: string;
  lease: {
    id: number;
    property: {
      name: string;
      location: {
        address: string;
        city: string;
        state: string;
      };
    };
  };
}

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    fetchPaymentHistory();
    fetchUpcomingPayments();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch("/api/payments/history");
      const data = await response.json();
      setPayments(data.payments || []);
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingPayments = async () => {
    try {
      const response = await fetch("/api/payments/upcoming");
      const data = await response.json();
      setUpcomingPayments(data || []);
    } catch (error) {
      console.error("Failed to fetch upcoming payments:", error);
    }
  };

  const handlePaymentSuccess = (payment: any) => {
    setShowPaymentForm(false);
    setSelectedPayment(null);
    fetchPaymentHistory();
    fetchUpcomingPayments();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "Overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case "Failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method?: string) => {
    switch (method) {
      case "CreditCard":
      case "DebitCard":
        return <CreditCard className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payments</h1>
        <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
          <DialogTrigger asChild>
            <Button>
              <CreditCard className="w-4 h-4 mr-2" />
              Make Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Make Payment</DialogTitle>
            </DialogHeader>
            {selectedPayment && (
              <PaymentForm
                amount={selectedPayment.amountDue}
                leaseId={selectedPayment.lease.id}
                onSuccess={handlePaymentSuccess}
                onError={(error) => console.error("Payment error:", error)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Payments</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingPayments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming payments</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingPayments.map((payment) => (
                <Card key={payment.id} className="relative">
                  {isOverdue(payment.dueDate) && (
                    <div className="absolute top-2 right-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{payment.lease.property.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(payment.paymentStatus)}
                        {isOverdue(payment.dueDate) && (
                          <Badge variant="destructive">Overdue</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Amount Due</p>
                        <p className="text-xl font-semibold">${payment.amountDue.toFixed(2)}</p>
                        {payment.lateFee > 0 && (
                          <p className="text-sm text-red-600">+${payment.lateFee.toFixed(2)} late fee</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Due Date</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <p className="font-medium">
                            {format(new Date(payment.dueDate), "MMM d, yyyy")}
                          </p>
                        </div>
                        {!isOverdue(payment.dueDate) && (
                          <p className="text-sm text-gray-500">
                            {getDaysUntilDue(payment.dueDate)} days remaining
                          </p>
                        )}
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowPaymentForm(true);
                          }}
                          className="w-full"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay Now
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      <p>{payment.lease.property.location.address}</p>
                      <p>{payment.lease.property.location.city}, {payment.lease.property.location.state}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {payments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No payment history</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{payment.lease.property.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(payment.paymentStatus)}
                        {payment.paymentMethod && getPaymentMethodIcon(payment.paymentMethod)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="text-lg font-semibold">${payment.amountPaid.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">of ${payment.amountDue.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Due Date</p>
                        <p className="font-medium">
                          {format(new Date(payment.dueDate), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Date</p>
                        <p className="font-medium">
                          {payment.paymentDate 
                            ? format(new Date(payment.paymentDate), "MMM d, yyyy")
                            : "Not paid"
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="font-medium">
                          {payment.description || "Rent payment"}
                        </p>
                      </div>
                    </div>
                    {payment.lateFee > 0 && (
                      <Alert className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Late fee of ${payment.lateFee.toFixed(2)} was applied
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentsPage; 