'use client';

import React, { useState } from 'react';
import Header from '@/components/header';
import NotificationCenter from '@/components/notification-center';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [prefs, setPrefs] = useState({ email: true, sms: false });

  const markAsRead = (id: string) =>
    setNotifications((n) => n.map((m) => (m.id === id ? { ...m, read: true } : m)));
  const markAllAsRead = () => setNotifications((n) => n.map((m) => ({ ...m, read: true })));
  const deleteNotification = (id: string) => setNotifications((n) => n.filter((m) => m.id !== id));

  return (
    <div className="dashboard-container space-y-6">
      <Header title="Notifications" subtitle="View alerts and manage your preferences" />
      <NotificationCenter
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
      />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email">Email</Label>
            <Switch
              id="email"
              checked={prefs.email}
              onCheckedChange={(c) => setPrefs((p) => ({ ...p, email: c }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sms">SMS</Label>
            <Switch
              id="sms"
              checked={prefs.sms}
              onCheckedChange={(c) => setPrefs((p) => ({ ...p, sms: c }))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
