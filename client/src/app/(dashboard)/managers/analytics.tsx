"use client";

import Header from "@/components/header";
import Loading from "@/components/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useGetAuthUserQuery, useGetManagerAnalyticsQuery } from "@/state/api";

const AnalyticsPage = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data, isLoading } = useGetManagerAnalyticsQuery(
    authUser?.cognitoInfo?.userId ?? "",
    { skip: !authUser?.cognitoInfo?.userId }
  );

  if (isLoading) return <Loading />;

  const funnelData = Object.entries(data?.applicationFunnel ?? {}).map(
    ([status, count]) => ({ status, count })
  );

  return (
    <div className="dashboard-container">
      <Header
        title="Analytics Dashboard"
        subtitle="Track your property metrics"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>{data?.occupancyRate ?? 0}%</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>${data?.totalRevenue?.toFixed(2) ?? 0}</CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Application Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelData}>
              <XAxis dataKey="status" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
