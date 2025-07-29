"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  DollarSign, 
  CreditCard, 
  AlertCircle,
  CheckCircle,
  Clock,
  Download
} from "lucide-react";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { useGetAuthUserQuery } from "@/state/api";
import { format } from "date-fns";

const Payments = () => {
  const { data: authUser, isLoading } = useGetAuthUserQuery();

  if (isLoading) return <Loading />;

  // Mock payment data - in a real app, this would come from the API
  const paymentData = {
    upcomingPayments: [
      {
        id: 1,
        propertyName: "Sunset Apartments - Unit 3B",
        amountDue: 2500,
        dueDate: new Date(2024, 1, 15),
        status: "pending",
        leaseId: "lease-001"
      },
      {
        id: 2,
        propertyName: "Downtown Lofts - Unit 7A",
        amountDue: 3200,
        dueDate: new Date(2024, 1, 20),
        status: "pending",
        leaseId: "lease-002"
      }
    ],
    recentPayments: [
      {
        id: 3,
        propertyName: "Sunset Apartments - Unit 3B",
        amountPaid: 2500,
        paymentDate: new Date(2024, 0, 15),
        status: "paid",
        leaseId: "lease-001"
      },
      {
        id: 4,
        propertyName: "Downtown Lofts - Unit 7A",
        amountPaid: 3200,
        paymentDate: new Date(2024, 0, 20),
        status: "paid",
        leaseId: "lease-002"
      },
      {
        id: 5,
        propertyName: "Sunset Apartments - Unit 3B",
        amountPaid: 2500,
        paymentDate: new Date(2023, 11, 15),
        status: "paid",
        leaseId: "lease-001"
      }
    ],
    overduePayments: [
      {
        id: 6,
        propertyName: "Sunset Apartments - Unit 3B",
        amountDue: 2500,
        dueDate: new Date(2024, 0, 15),
        status: "overdue",
        leaseId: "lease-001",
        daysOverdue: 5
      }
    ]
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const PaymentCard = ({ payment, showActions = false }: { 
    payment: any; 
    showActions?: boolean;
  }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{payment.propertyName}</CardTitle>
          {getStatusIcon(payment.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="font-semibold">
              ${payment.amountDue || payment.amountPaid}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {payment.status === "paid" ? "Payment Date" : "Due Date"}
            </span>
            <span className="text-sm">
              {format(payment.dueDate || payment.paymentDate, "MMM dd, yyyy")}
            </span>
          </div>

          {payment.daysOverdue && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Days Overdue</span>
              <span className="text-sm text-red-600 font-medium">
                {payment.daysOverdue} days
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            {getStatusBadge(payment.status)}
          </div>

          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="flex-1">
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const SummaryCard = ({ title, value, icon: Icon, color }: {
    title: string;
    value: string;
    icon: React.ElementType;
    color: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="dashboard-container">
      <Header
        title="Payment Management"
        subtitle="Track your rent payments and payment history"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          title="Total Due"
          value={`$${paymentData.upcomingPayments.reduce((sum, p) => sum + p.amountDue, 0).toLocaleString()}`}
          icon={DollarSign}
          color="text-red-600"
        />
        <SummaryCard
          title="Upcoming Payments"
          value={paymentData.upcomingPayments.length.toString()}
          icon={Calendar}
          color="text-yellow-600"
        />
        <SummaryCard
          title="Overdue Payments"
          value={paymentData.overduePayments.length.toString()}
          icon={AlertCircle}
          color="text-red-600"
        />
        <SummaryCard
          title="Total Paid This Year"
          value={`$${paymentData.recentPayments.reduce((sum, p) => sum + p.amountPaid, 0).toLocaleString()}`}
          icon={CheckCircle}
          color="text-green-600"
        />
      </div>

      {/* Payment Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Payments</TabsTrigger>
          <TabsTrigger value="overdue">Overdue Payments</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentData.upcomingPayments.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} showActions />
            ))}
          </div>
          {paymentData.upcomingPayments.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming payments</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentData.overduePayments.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} showActions />
            ))}
          </div>
          {paymentData.overduePayments.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-muted-foreground">No overdue payments</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentData.recentPayments.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} />
            ))}
          </div>
          {paymentData.recentPayments.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No payment history</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Payments; 