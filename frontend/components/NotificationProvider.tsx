"use client";

import { useBackendNotifications } from "@/lib/useBackendNotifications";

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
    useBackendNotifications();
    return <>{children}</>;
}
