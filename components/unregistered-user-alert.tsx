"use client";

import { useSession } from "next-auth/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function UnregisteredUserAlert() {
  const { data: session } = useSession();

  if (!session?.user || (session.user as any).isRegistered !== false) {
    return null;
  }

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <strong>Thông báo:</strong> Email {session.user.email} chưa được đăng ký
        trong hệ thống. Bạn có thể xem các trang công khai nhưng không thể truy
        cập các tính năng quản lý. Vui lòng liên hệ admin để được cấp quyền truy
        cập.
      </AlertDescription>
    </Alert>
  );
}
