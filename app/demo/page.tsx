"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function GoogleLoginDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            🎯 Demo Google Login với Email Whitelist
          </CardTitle>
          <CardDescription className="text-center">
            Chức năng đăng nhập Google chỉ cho phép những email đã được đăng ký
            trước
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">
              ✅ Email được phép đăng nhập
            </h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li>
                • <strong>linhyang0702@gmail.com</strong> - Linh Nguyễn
                (Manager, ABC Construction Company)
              </li>
              <li>
                • <strong>admin@example.com</strong> - System Admin (Admin, IT
                Department)
              </li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">
              ❌ Email chưa đăng ký
            </h3>
            <p className="text-sm text-red-700">
              Các email khác sẽ bị từ chối đăng nhập và hiển thị thông báo:
              <em>
                "Email này chưa được đăng ký trong hệ thống! Bạn cần đăng ký tài
                khoản trước khi có thể đăng nhập bằng Google."
              </em>
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              🔄 Cách hoạt động
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
              <li>User nhấn "Đăng nhập với Google"</li>
              <li>Authenticate với Google thành công</li>
              <li>Hệ thống kiểm tra email trong database (signIn callback)</li>
              <li>
                Nếu email tồn tại: Cho phép đăng nhập + hiển thị thông tin từ
                database
              </li>
              <li>
                Nếu email không tồn tại: Từ chối đăng nhập + redirect về login
                với thông báo lỗi
              </li>
              <li>User phải đăng ký trước rồi mới có thể đăng nhập Google</li>
            </ol>
          </div>

          <div className="text-center">
            <a
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Đi đến trang đăng nhập để test
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
