"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wrench, Plus, Clock, CheckCircle, AlertTriangle, Calendar, DollarSign } from "lucide-react";
import MaintenanceRequestForm from "@/components/MaintenanceRequestForm";
import { format } from "date-fns";

interface MaintenanceRequest {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  propertyId: number;
  createdAt: string;
  updatedAt: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedCost?: number;
  photos: string[];
  property: {
    name: string;
    location: {
      address: string;
      city: string;
      state: string;
    };
  };
  tenant?: {
    name: string;
    email: string;
  };
  manager?: {
    name: string;
    email: string;
  };
}

const MaintenancePage: React.FC = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/maintenance");
      const data = await response.json();
      setMaintenanceRequests(data.maintenanceRequests || []);
    } catch (error) {
      console.error("Failed to fetch maintenance requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSuccess = (request: any) => {
    setShowForm(false);
    setSelectedPropertyId(null);
    fetchMaintenanceRequests();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "InProgress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "Completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "Cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      case "Medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "High":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case "Emergency":
        return <Badge className="bg-red-100 text-red-800">Emergency</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "Emergency":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "High":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "Medium":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "Low":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Wrench className="w-4 h-4" />;
    }
  };

  const filterRequestsByStatus = (status: string) => {
    return maintenanceRequests.filter(request => request.status === status);
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
        <div>
          <h1 className="text-2xl font-bold">Maintenance Requests</h1>
          <p className="text-gray-600">Manage property maintenance and repairs</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedPropertyId(1)}> {/* Default property ID */}
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Maintenance Request</DialogTitle>
            </DialogHeader>
            {selectedPropertyId && (
              <MaintenanceRequestForm
                propertyId={selectedPropertyId}
                onSuccess={handleRequestSuccess}
                onCancel={() => setShowForm(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="inprogress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <MaintenanceRequestsList 
            requests={maintenanceRequests} 
            getPriorityIcon={getPriorityIcon}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <MaintenanceRequestsList 
            requests={filterRequestsByStatus("Pending")} 
            getPriorityIcon={getPriorityIcon}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
          />
        </TabsContent>

        <TabsContent value="inprogress" className="space-y-4">
          <MaintenanceRequestsList 
            requests={filterRequestsByStatus("InProgress")} 
            getPriorityIcon={getPriorityIcon}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
          />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <MaintenanceRequestsList 
            requests={filterRequestsByStatus("Completed")} 
            getPriorityIcon={getPriorityIcon}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface MaintenanceRequestsListProps {
  requests: MaintenanceRequest[];
  getPriorityIcon: (priority: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
  getPriorityBadge: (priority: string) => React.ReactNode;
}

const MaintenanceRequestsList: React.FC<MaintenanceRequestsListProps> = ({ 
  requests, 
  getPriorityIcon, 
  getStatusBadge, 
  getPriorityBadge 
}) => {
  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No maintenance requests found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getPriorityIcon(request.priority)}
                <CardTitle className="text-lg">{request.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(request.status)}
                {getPriorityBadge(request.priority)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Property</p>
                <p className="font-medium">{request.property.name}</p>
                <p className="text-sm text-gray-600">
                  {request.property.location.address}
                </p>
                <p className="text-sm text-gray-600">
                  {request.property.location.city}, {request.property.location.state}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-sm">{request.description}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Timeline</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Created: {format(new Date(request.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  {request.scheduledDate && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        Scheduled: {format(new Date(request.scheduledDate), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                  {request.completedDate && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">
                        Completed: {format(new Date(request.completedDate), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Details</p>
                <div className="space-y-1">
                  {request.estimatedCost && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">
                        Est. Cost: ${request.estimatedCost.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {request.tenant && (
                    <p className="text-sm">
                      Tenant: {request.tenant.name}
                    </p>
                  )}
                  {request.manager && (
                    <p className="text-sm">
                      Manager: {request.manager.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {request.photos.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Photos</p>
                <div className="flex gap-2 overflow-x-auto">
                  {request.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Maintenance photo ${index + 1}`}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MaintenancePage; 