"use client";

import React, { useEffect } from "react";
import { useGetAuthUserQuery } from "@/state/api";
import ChatInterface from "@/components/ChatInterface";

const MessagesPage: React.FC = () => {
  const { data: authUser, isLoading } = useGetAuthUserQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to access messages</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-gray-600">Communicate with your property manager or tenants</p>
      </div>
      
      <ChatInterface
        currentUserId={authUser.cognitoInfo.userId}
        currentUserType={authUser.userRole?.toLowerCase() || "tenant"}
      />
    </div>
  );
};

export default MessagesPage; 