"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  EyeOff,
  Building2,
  Check,
  UserCheck,
  Users,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AuthGuard } from "@/components/auth-guard";
import { toast } from "sonner";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    role: "user",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu không khớp!");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        company: formData.company,
        role: formData.role,
      });
      toast.success("Đăng ký thành công!");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { text: "Ít nhất 8 ký tự", met: formData.password.length >= 8 },
    {
      text: "Có chữ hoa và chữ thường",
      met: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password),
    },
    { text: "Có số", met: /\d/.test(formData.password) },
    {
      text: "Có ký tự đặc biệt (@$!%*?&)",
      met: /[@$!%*?&]/.test(formData.password),
    },
  ];

  const roleOptions = [
    {
      value: "user",
      label: "Nhân viên",
      description: "Tạo và quản lý hợp đồng cơ bản",
      icon: Users,
    },
    {
      value: "manager",
      label: "Quản lý",
      description: "Quản lý nhóm và phê duyệt hợp đồng",
      icon: UserCheck,
    },
    {
      value: "approver",
      label: "Người phê duyệt",
      description: "Phê duyệt hợp đồng cấp cao",
      icon: Shield,
    },
  ];

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Contract Manager
            </h1>
            <p className="text-gray-600 mt-1">Tạo tài khoản mới</p>
          </div>

          <Card className="border-gray-200 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Đăng ký
              </CardTitle>
              <CardDescription className="text-gray-600">
                Tạo tài khoản để bắt đầu quản lý hợp đồng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Register Form */}
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-700">
                      Họ và tên
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Nhập họ và tên "
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      required
                      className="h-11 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-gray-700">
                      Công ty/Tổ chức
                    </Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="Nhập tên công ty hoặc tổ chức"
                      value={formData.company}
                      onChange={(e) =>
                        handleInputChange("company", e.target.value)
                      }
                      required
                      className="h-11 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Nhập email "
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                      className="h-11 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-gray-700">
                      Vai trò
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        handleInputChange("role", value)
                      }
                    >
                      <SelectTrigger className="h-11 border-gray-300 focus:border-violet-500 focus:ring-violet-500">
                        <SelectValue placeholder="Chọn vai trò của bạn" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => {
                          const IconComponent = role.icon;
                          return (
                            <SelectItem
                              key={role.value}
                              value={role.value}
                              className="py-3"
                            >
                              <div className="flex items-start space-x-3">
                                <IconComponent className="w-4 h-4 mt-0.5 text-gray-500" />
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {role.label}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {role.description}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">
                      Mật khẩu
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        required
                        className="h-11 pr-10 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>

                    {/* Password Requirements */}
                    {formData.password && (
                      <div className="space-y-1 text-xs">
                        {passwordRequirements.map((req, index) => (
                          <div
                            key={index}
                            className={`flex items-center space-x-2 ${
                              req.met
                                ? "text-green-600"
                                : "text-muted-foreground"
                            }`}
                          >
                            <Check
                              className={`w-3 h-3 ${
                                req.met
                                  ? "text-green-600"
                                  : "text-muted-foreground"
                              }`}
                            />
                            <span>{req.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700">
                      Xác nhận mật khẩu
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Nhập lại mật khẩu"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        required
                        className="h-11 pr-10 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 font-medium bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                </Button>
              </form>

              <div className="text-center text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <Link
                  href="/login"
                  className="text-violet-600 hover:text-violet-700 font-medium"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8 text-xs text-gray-500">
            © 2025 Contract Manager. Bảo mật và tin cậy.
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
