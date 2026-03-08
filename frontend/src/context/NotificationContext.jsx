import { createContext, useContext, useState, useCallback, ReactNode } from "react";

const NotificationContext = createContext(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    // Add a new notification (e.g., 'uploading', 'success', 'error', 'info')
    const addNotification = useCallback((notification) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(7);
        const newNotif = {
            id,
            timestamp: new Date().toISOString(),
            ...notification,
        };
        setNotifications((prev) => [newNotif, ...prev]);
        return id;
    }, []);

    // Update an existing notification (e.g., change 'uploading' to 'success')
    const updateNotification = useCallback((id, updates) => {
        setNotifications((prev) =>
            prev.map((notif) => (notif.id === id ? { ...notif, ...updates } : notif))
        );
    }, []);

    // Remove a single notification
    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, []);

    // Clear all notifications
    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                addNotification,
                updateNotification,
                removeNotification,
                clearNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
