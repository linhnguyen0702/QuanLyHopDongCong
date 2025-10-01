"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useSidebar } from "@/hooks/use-sidebar";
import {
  User,
  Building2,
  Phone,
  Calendar,
  Mail,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user, updateProfile, loading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [showLoadingBanner, setShowLoadingBanner] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    department: "",
    phone: "",
  });

  useEffect(() => {
    console.log("📊 Profile page - User state changed:", user);
    if (user) {
      const newFormData = {
        fullName: user.fullName || "",
        company: user.company || "",
        department: user.department || "",
        phone: user.phone || "",
      };

      // Only update if data actually changed to avoid unnecessary re-renders
      if (JSON.stringify(formData) !== JSON.stringify(newFormData)) {
        setFormData(newFormData);
        console.log("📊 FormData updated with new user data:", newFormData);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowLoadingBanner(true);
    setShowSuccessBanner(false); // Ẩn banner thành công cũ nếu có

    // Thông báo bắt đầu lưu
    toast({
      title: "Đang lưu...",
      description: "Đang cập nhật thông tin cá nhân của bạn",
    });

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        // Ẩn loading banner và hiển thị success banner
        setShowLoadingBanner(false);
        setShowSuccessBanner(true);

        // Thông báo toast thành công
        toast({
          title: "✅ Cập nhật thành công!",
          description: "Thông tin cá nhân của bạn đã được cập nhật và lưu trữ",
          className: "border-green-200 bg-green-50 text-green-800",
          duration: 5000,
        });

        setIsEditing(false);
        console.log("📊 Profile update successful");

        // Tự động ẩn banner sau 10 giây
        setTimeout(() => {
          setShowSuccessBanner(false);
        }, 5000);
      } else {
        toast({
          title: "❌ Cập nhật thất bại",
          description:
            result.error || "Không thể cập nhật thông tin. Vui lòng thử lại.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Lỗi hệ thống",
        description:
          "Có lỗi xảy ra khi kết nối với máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowLoadingBanner(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || "",
      company: user?.company || "",
      department: user?.department || "",
      phone: user?.phone || "",
    });
    setIsEditing(false);

    // Thông báo hủy chỉnh sửa
    toast({
      title: "📝 Đã hủy chỉnh sửa",
      description: "Các thay đổi của bạn đã được hoàn tác",
      className: "border-orange-200 bg-orange-50 text-orange-800",
    });
  };

  if (loading || !user) {
    return (
      <div className="layout-container bg-gray-50">
        <Sidebar />
        <div className="main-content">
          <Header />
          <main className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-48 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-container bg-gray-50" suppressHydrationWarning>
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="p-6">
          <div className="max-w-4xl mx-auto space-y-6" suppressHydrationWarning>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">
                Thông tin cá nhân
              </h1>
              {!isEditing && (
                <Button
                  onClick={() => {
                    setIsEditing(true);
                    toast({
                      title: "✏️ Chế độ chỉnh sửa",
                      description:
                        "Bạn có thể chỉnh sửa thông tin cá nhân. Nhớ nhấn 'Lưu thay đổi' khi hoàn tất.",
                      className: "border-blue-200 bg-blue-50 text-blue-800",
                    });
                  }}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Chỉnh sửa
                </Button>
              )}
            </div>

            {/* Loading Banner */}
            {showLoadingBanner && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 shadow-sm animate-in slide-in-from-top duration-300">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800">
                      Đang lưu thông tin...
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Vui lòng chờ trong giây lát, hệ thống đang cập nhật thông
                      tin của bạn.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Banner */}
            {showSuccessBanner && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 shadow-sm animate-in slide-in-from-top duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">
                        Cập nhật thành công!
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        Thông tin cá nhân của bạn đã được lưu và cập nhật thành
                        công. Các thay đổi sẽ có hiệu lực ngay lập tức.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSuccessBanner(false)}
                    className="flex-shrink-0 text-green-600 hover:text-green-800 transition-colors"
                    aria-label="Đóng thông báo"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* User Overview Card */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Tổng quan tài khoản
                </CardTitle>
                <CardDescription>
                  Thông tin tổng quan về tài khoản của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Cột trái */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Họ và tên</p>
                        <p className="font-medium text-lg">
                          {user.fullName || "Chưa có thông tin"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Vai trò</p>
                        <p className="font-medium">
                          {user.role === "admin"
                            ? "Quản trị viên"
                            : user.role === "manager"
                            ? "Quản lý"
                            : user.role === "approver"
                            ? "Người phê duyệt"
                            : "Nhân viên"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cột phải */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Phone className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Số điện thoại</p>
                        <p className="font-medium">
                          {user.phone || "Chưa có thông tin"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Ngày tạo</p>
                        <p className="font-medium">
                          {(() => {
                            if (!user?.createdAt) return "Chưa có thông tin";
                            try {
                              const date = new Date(user.createdAt);
                              if (isNaN(date.getTime()))
                                return "Ngày không hợp lệ";
                              return date.toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              });
                            } catch (error) {
                              return "Lỗi định dạng ngày";
                            }
                          })()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Phòng ban</p>
                        <p className="font-medium">
                          {user.department || "Chưa có thông tin"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Thông tin chi tiết
                </CardTitle>
                <CardDescription>
                  Thông tin công việc và liên hệ
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên</Label>
                      {isEditing ? (
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              fullName: e.target.value,
                            })
                          }
                          placeholder="Nhập họ và tên"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 border rounded-md">
                          {formData.fullName ||
                            user.fullName ||
                            "Chưa có thông tin"}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Công ty</Label>
                      {isEditing ? (
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              company: e.target.value,
                            })
                          }
                          placeholder="Nhập tên công ty"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 border rounded-md">
                          {formData.company ||
                            user.company ||
                            "Chưa có thông tin"}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">Phòng ban</Label>
                      {isEditing ? (
                        <Input
                          id="department"
                          value={formData.department}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              department: e.target.value,
                            })
                          }
                          placeholder="Nhập phòng ban"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 border rounded-md">
                          {formData.department ||
                            user.department ||
                            "Chưa có thông tin"}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="Nhập số điện thoại"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 border rounded-md flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {formData.phone || user.phone || "Chưa có thông tin"}
                        </div>
                      )}
                    </div>

                    {/* Read-only fields */}
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="p-3 bg-gray-50 border rounded-md flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {user.email}
                        <span className="text-xs text-gray-500 ml-auto">
                          (Không thể thay đổi)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Vai trò</Label>
                      <div className="p-3 bg-gray-50 border rounded-md">
                        {user.role === "admin"
                          ? "Quản trị viên"
                          : user.role === "manager"
                          ? "Quản lý"
                          : "Nhân viên"}
                        <span className="text-xs text-gray-500 ml-2">
                          (Không thể thay đổi)
                        </span>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-4 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Hủy
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
