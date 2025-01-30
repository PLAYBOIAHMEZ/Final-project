import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          "http://localhost:5000/api/users/notifications",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.success) {
          setNotifications(response.data.notifications);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <Card className="w-96 p-5">
        <CardContent>
          <p className="text-center">Loading notifications...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-96">
      <CardContent>
        <h2 className="text-xl font-bold mb-4">Notifications</h2>
        {notifications.length === 0 ? (
          <p className="text-center text-gray-500">No new notifications</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className="p-3 border-b last:border-b-0"
              >
                <p className="font-medium">{notification.message}</p>
                <p className="text-sm text-gray-500">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
