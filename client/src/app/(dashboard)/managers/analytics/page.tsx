"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp,
  Calendar,
  MapPin,
  Star
} from "lucide-react";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { useGetAuthUserQuery, useGetManagerPropertiesQuery } from "@/state/api";

const Analytics = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: properties, isLoading } = useGetManagerPropertiesQuery(
    authUser?.cognitoInfo?.userId || "",
    {
      skip: !authUser?.cognitoInfo?.userId,
    }
  );

  if (isLoading) return <Loading />;

  // Mock data for analytics - in a real app, this would come from the API
  const analyticsData = {
    totalProperties: properties?.length || 0,
    totalApplications: 24,
    totalRevenue: 45600,
    occupancyRate: 87,
    averageRating: 4.2,
    monthlyRevenue: [
      { month: "Jan", revenue: 12000 },
      { month: "Feb", revenue: 13500 },
      { month: "Mar", revenue: 14200 },
      { month: "Apr", revenue: 13800 },
      { month: "May", revenue: 15600 },
      { month: "Jun", revenue: 16200 },
    ],
    propertyTypes: [
      { name: "Apartment", value: 8, color: "#8884d8" },
      { name: "Townhouse", value: 3, color: "#82ca9d" },
      { name: "Villa", value: 2, color: "#ffc658" },
      { name: "Cottage", value: 1, color: "#ff7300" },
    ],
    applicationStatus: [
      { status: "Pending", count: 8, color: "#fbbf24" },
      { status: "Approved", count: 12, color: "#10b981" },
      { status: "Denied", count: 4, color: "#ef4444" },
    ],
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue 
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: "up" | "down";
    trendValue?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && trendValue && (
          <p className={`text-xs flex items-center gap-1 ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}>
            <TrendingUp className="h-3 w-3" />
            {trendValue}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="dashboard-container">
      <Header
        title="Analytics Dashboard"
        subtitle="Track your property performance and business metrics"
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Properties"
          value={analyticsData.totalProperties}
          icon={Building2}
          trend="up"
          trendValue="+2 this month"
        />
        <StatCard
          title="Total Applications"
          value={analyticsData.totalApplications}
          icon={Users}
          trend="up"
          trendValue="+5 this week"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${analyticsData.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          trendValue="+12% vs last month"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${analyticsData.occupancyRate}%`}
          icon={Calendar}
          trend="up"
          trendValue="+3% vs last month"
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="properties">Property Distribution</TabsTrigger>
          <TabsTrigger value="applications">Application Status</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Property Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.propertyTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.propertyTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Average Rating</span>
                  </div>
                  <Badge variant="secondary">{analyticsData.averageRating}/5.0</Badge>
                </div>
                
                <div className="space-y-2">
                  {properties?.map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{property.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">${property.pricePerMonth}/mo</Badge>
                        <Badge variant="secondary">{property.averageRating || 0}/5</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.applicationStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {analyticsData.applicationStatus.map((status) => (
                  <div key={status.status} className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm font-medium">{status.status}</span>
                    <Badge variant="secondary">{status.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics; 