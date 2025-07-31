"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, CheckCircle, AlertTriangle, Plus, Settings, Repeat, Building, Wrench } from "lucide-react";
import { format, addMonths, addDays, isBefore, isAfter } from "date-fns";
import { cn } from "@/lib/utils";

interface ScheduledMaintenance {
  id: number;
  title: string;
  description: string;
  propertyId: number;
  propertyName: string;
  frequency: string; // "monthly", "quarterly", "yearly", "custom"
  interval: number; // number of days/months/years
  lastPerformed?: string;
  nextDue: string;
  estimatedCost: number;
  priority: string;
  category: string;
  isActive: boolean;
  assignedTo?: string;
  notes?: string;
  completedTasks: ScheduledMaintenanceTask[];
}

interface ScheduledMaintenanceTask {
  id: number;
  scheduledMaintenanceId: number;
  dueDate: string;
  completedDate?: string;
  status: string; // "pending", "completed", "overdue"
  notes?: string;
  cost?: number;
  performedBy?: string;
}

const ScheduledMaintenancePage: React.FC = () => {
  const [scheduledMaintenance, setScheduledMaintenance] = useState<ScheduledMaintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<ScheduledMaintenance | null>(null);

  useEffect(() => {
    fetchScheduledMaintenance();
  }, []);

  const fetchScheduledMaintenance = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/maintenance/scheduled");
      const data = await response.json();
      setScheduledMaintenance(data.scheduledMaintenance || []);
    } catch (error) {
      console.error("Failed to fetch scheduled maintenance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowForm(false);
    fetchScheduledMaintenance();
  };

  const getStatusBadge = (maintenance: ScheduledMaintenance) => {
    const now = new Date();
    const nextDue = new Date(maintenance.nextDue);
    
    if (isBefore(nextDue, now)) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    } else if (isBefore(nextDue, addDays(now, 7))) {
      return <Badge className="bg-orange-100 text-orange-800">Due Soon</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">On Track</Badge>;
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
      case "Critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getFrequencyText = (frequency: string, interval: number) => {
    switch (frequency) {
      case "monthly":
        return `Every ${interval} month${interval > 1 ? 's' : ''}`;
      case "quarterly":
        return `Every ${interval} quarter${interval > 1 ? 's' : ''}`;
      case "yearly":
        return `Every ${interval} year${interval > 1 ? 's' : ''}`;
      case "custom":
        return `Every ${interval} days`;
      default:
        return frequency;
    }
  };

  const filterMaintenanceByStatus = (status: string) => {
    const now = new Date();
    return scheduledMaintenance.filter(maintenance => {
      const nextDue = new Date(maintenance.nextDue);
      switch (status) {
        case "overdue":
          return isBefore(nextDue, now);
        case "due-soon":
          return isBefore(nextDue, addDays(now, 7)) && !isBefore(nextDue, now);
        case "upcoming":
          return isAfter(nextDue, addDays(now, 7));
        default:
          return true;
      }
    });
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
          <h1 className="text-2xl font-bold">Scheduled Maintenance</h1>
          <p className="text-gray-600">Manage preventive maintenance schedules</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Scheduled Maintenance</DialogTitle>
            </DialogHeader>
            <ScheduledMaintenanceForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Schedules</p>
                <p className="text-2xl font-bold">{scheduledMaintenance.length}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {filterMaintenanceByStatus("overdue").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Due This Week</p>
                <p className="text-2xl font-bold text-orange-600">
                  {filterMaintenanceByStatus("due-soon").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {scheduledMaintenance.filter(m => m.isActive).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Schedules</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="due-soon">Due Soon</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ScheduledMaintenanceList 
            maintenance={scheduledMaintenance} 
            onUpdate={fetchScheduledMaintenance}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            getFrequencyText={getFrequencyText}
          />
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <ScheduledMaintenanceList 
            maintenance={filterMaintenanceByStatus("overdue")} 
            onUpdate={fetchScheduledMaintenance}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            getFrequencyText={getFrequencyText}
          />
        </TabsContent>

        <TabsContent value="due-soon" className="space-y-4">
          <ScheduledMaintenanceList 
            maintenance={filterMaintenanceByStatus("due-soon")} 
            onUpdate={fetchScheduledMaintenance}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            getFrequencyText={getFrequencyText}
          />
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <ScheduledMaintenanceList 
            maintenance={filterMaintenanceByStatus("upcoming")} 
            onUpdate={fetchScheduledMaintenance}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            getFrequencyText={getFrequencyText}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ScheduledMaintenanceListProps {
  maintenance: ScheduledMaintenance[];
  onUpdate: () => void;
  getStatusBadge: (maintenance: ScheduledMaintenance) => React.ReactNode;
  getPriorityBadge: (priority: string) => React.ReactNode;
  getFrequencyText: (frequency: string, interval: number) => string;
}

const ScheduledMaintenanceList: React.FC<ScheduledMaintenanceListProps> = ({ 
  maintenance, 
  onUpdate,
  getStatusBadge,
  getPriorityBadge,
  getFrequencyText
}) => {
  const handleMarkComplete = async (maintenanceId: number) => {
    try {
      await fetch(`/api/maintenance/scheduled/${maintenanceId}/complete`, {
        method: "POST",
      });
      onUpdate();
    } catch (error) {
      console.error("Failed to mark maintenance as complete:", error);
    }
  };

  if (maintenance.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No scheduled maintenance found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {maintenance.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wrench className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(item)}
                {getPriorityBadge(item.priority)}
                {item.isActive ? (
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Property</p>
                <p className="font-medium">{item.propertyName}</p>
                <p className="text-sm text-gray-600">
                  {getFrequencyText(item.frequency, item.interval)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Next Due</p>
                <p className="font-medium">
                  {format(new Date(item.nextDue), "MMM d, yyyy")}
                </p>
                {item.lastPerformed && (
                  <p className="text-sm text-gray-600">
                    Last: {format(new Date(item.lastPerformed), "MMM d, yyyy")}
                  </p>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Estimated Cost</p>
                <p className="font-medium">${item.estimatedCost.toFixed(2)}</p>
                <p className="text-sm text-gray-600">{item.category}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Actions</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleMarkComplete(item.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark Complete
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {item.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-sm">{item.description}</p>
              </div>
            )}
            
            {item.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-sm">{item.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

interface ScheduledMaintenanceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ScheduledMaintenanceForm: React.FC<ScheduledMaintenanceFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyId: "",
    frequency: "",
    interval: 1,
    nextDue: new Date(),
    estimatedCost: 0,
    priority: "Medium",
    category: "",
    assignedTo: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/maintenance/scheduled", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create scheduled maintenance:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="propertyId">Property</Label>
          <Select value={formData.propertyId} onValueChange={(value) => setFormData({ ...formData, propertyId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Sunset Apartments</SelectItem>
              <SelectItem value="2">Downtown Lofts</SelectItem>
              <SelectItem value="3">Garden Villas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the maintenance task"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="frequency">Frequency</Label>
          <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="custom">Custom (Days)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="interval">Interval</Label>
          <Input
            id="interval"
            type="number"
            min="1"
            value={formData.interval}
            onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label htmlFor="nextDue">Next Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.nextDue && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.nextDue ? format(formData.nextDue, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.nextDue}
                onSelect={(date) => date && setFormData({ ...formData, nextDue: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="estimatedCost">Estimated Cost</Label>
          <Input
            id="estimatedCost"
            type="number"
            min="0"
            step="0.01"
            value={formData.estimatedCost}
            onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HVAC">HVAC</SelectItem>
              <SelectItem value="Plumbing">Plumbing</SelectItem>
              <SelectItem value="Electrical">Electrical</SelectItem>
              <SelectItem value="Pest Control">Pest Control</SelectItem>
              <SelectItem value="Cleaning">Cleaning</SelectItem>
              <SelectItem value="Landscaping">Landscaping</SelectItem>
              <SelectItem value="Safety">Safety</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes or instructions"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Schedule
        </Button>
      </div>
    </form>
  );
};

export default ScheduledMaintenancePage; 