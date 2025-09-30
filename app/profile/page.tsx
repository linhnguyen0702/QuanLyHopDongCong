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
import {
  User,
  Building2,
  Phone,
  Calendar,
  Mail,
  Edit,
  Save,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    department: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        company: user.company || "",
        department: user.department || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        toast({
          title: "Thành công",
          description: "Cập nhật thông tin thành công",
        });
        setIsEditing(false);
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Cập nhật thông tin thất bại",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật thông tin",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
  };

  if (!user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">
                Thông tin cá nhân
              </h1>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Chỉnh sửa
                </Button>
              )}
            </div>

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
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
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Vai trò</p>
                        <p className="font-medium">
                          {user.role === "admin"
                            ? "Quản trị viên"
                            : user.role === "manager"
                            ? "Quản lý"
                            : "Nhân viên"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
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
                          {user.fullName || "Chưa có thông tin"}
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
                          {user.company || "Chưa có thông tin"}
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
                          {user.department || "Chưa có thông tin"}
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
                          {user.phone || "Chưa có thông tin"}
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
