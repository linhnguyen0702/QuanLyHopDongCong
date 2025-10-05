"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AuthGuard } from "@/components/auth-guard";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  AlertCircle,
  Mail,
  Building2,
  Calendar,
  Eye,
  EyeOff,
  Check,
  Phone,
} from "lucide-react";
import { usersApi, authApi, apiClient } from "@/lib/api";

interface User {
  id: number;
  full_name: string;
  email: string;
  company: string;
  department?: string;
  phone?: string;
  role: string;
  created_at: string;
}

interface UserFormData {
  fullName: string;
  email: string;
  password: string;
  company: string;
  department: string;
  phone: string;
  role: string;
}

export default function UsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { collapsed } = useSidebar();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    fullName: "",
    email: "",
    password: "",
    company: "",
    department: "",
    phone: "",
    role: "user",
  });

  // Role options
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
    {
      value: "admin",
      label: "Quản trị viên",
      description: "Toàn quyền quản trị hệ thống",
      icon: Shield,
    },
  ];

  // Password requirements
  const passwordRequirements = [
    { text: "It nhất 8 ký tự", met: formData.password.length >= 8 },
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

  // Check if user is admin
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User not logged in - redirect to login
        console.log("User not authenticated, redirecting to login");
        router.push("/login");
        return;
      }

      console.log("Current user:", {
        id: user.id,
        email: user.email,
        role: user.role,
      });
      if (user.role !== "admin") {
        // User logged in but not admin - redirect to home with message
        console.log("Access denied - user role:", user.role, "required: admin");
        toast.error(
          `Bạn không có quyền truy cập trang này. Quyền hiện tại: ${user.role}, cần quyền admin.`
        );
        router.push("/");
        return;
      }

      console.log("User is admin, proceeding to load users");
    }
  }, [user, loading, router]);

  // Fetch users
  const fetchUsers = async (silent = false) => {
    try {
      setIsLoading(true);

      const params: any = {};
      if (search) params.search = search;
      if (roleFilter !== "all") params.role = roleFilter;

      console.log("Fetching users with params:", params);
      const response = await usersApi.getAll(params);
      console.log("Users API response:", response);

      if (response.success) {
        // Backend returns { data: { users, pagination } }
        const usersData = (response.data as any)?.users || [];
        setUsers(usersData);
      } else if (!silent) {
        let errorMessage =
          response.message || "Không thể tải danh sách người dùng";

        // Bỏ qua thông báo Internal server error
        if (errorMessage.toLowerCase().includes("internal server error")) {
          return; // Không hiển thị thông báo này
        }

        // Provide more specific error messages
        if (response.message?.includes("Access token required")) {
          errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
          // Redirect to login after showing error
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } else if (response.message?.includes("Access denied")) {
          errorMessage = "Bạn không có quyền truy cập chức năng này.";
        } else if (!response.message && Object.keys(response).length === 0) {
          errorMessage = "Server không phản hồi. Vui lòng thử lại sau.";
        }

        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Users fetch exception:", error);
      if (!silent) {
        toast.error(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (user && user.role === "admin") {
      fetchUsers();
    }
  }, [user, search, roleFilter]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for password requirements when creating new user
    if (!editingUser) {
      const allRequirementsMet = passwordRequirements.every((req) => req.met);
      if (!allRequirementsMet) {
        toast.error("Mật khẩu không đáp ứng đủ các yêu cầu bảo mật");
        return;
      }
    }

    try {
      let response;
      if (editingUser) {
        // Update user
        // Backend chỉ hỗ trợ cập nhật role, không hỗ trợ full update
        response = await usersApi.updateRole(editingUser.id, formData.role);
      } else {
        // Create new user
        response = await authApi.register({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          company: formData.company,
          department: formData.department,
          phone: formData.phone,
          role: formData.role,
        });
      }

      if (response.success) {
        toast.success(
          editingUser
            ? "Cập nhật người dùng thành công"
            : "Tạo người dùng thành công"
        );
        setIsDialogOpen(false);
        resetForm();
        fetchUsers(true); // silent mode to avoid error notifications
      } else {
        const errorMessage = response.message || "Có lỗi xảy ra";
        // Bỏ qua thông báo Internal server error
        if (!errorMessage.toLowerCase().includes("internal server error")) {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error("Error creating/updating user:", error);
      toast.error("Không thể kết nối đến server");
    }
  };

  // Handle deactivate user
  const handleDeactivate = async (userId: number) => {
    if (!confirm("Bạn có chắc chắn muốn vô hiệu hóa người dùng này?")) return;

    try {
      const response = await usersApi.deactivate(userId);
      if (response.success) {
        toast.success("Vô hiệu hóa người dùng thành công");
        fetchUsers(true); // silent mode to avoid error notifications
      } else {
        const errorMessage =
          response.message || "Không thể vô hiệu hóa người dùng";
        // Bỏ qua thông báo Internal server error
        if (!errorMessage.toLowerCase().includes("internal server error")) {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      toast.error("Không thể kết nối đến server");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      company: "",
      department: "",
      phone: "",
      role: "user",
    });
    setEditingUser(null);
  };

  // Handle edit user
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.full_name,
      email: user.email,
      password: "",
      company: user.company,
      department: user.department || "",
      phone: user.phone || "",
      role: user.role,
    });
    setIsDialogOpen(true);
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "manager":
        return "default";
      case "approver":
        return "default";
      default:
        return "secondary";
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-3 w-3" />;
      case "manager":
        return <UserCheck className="h-3 w-3" />;
      case "approver":
        return <Shield className="h-3 w-3" />;
      default:
        return <UserX className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Đang tải...
      </div>
    );
  }

  // This should not render as useEffect will redirect
  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="layout-container bg-background">
        <Sidebar />
        <div className={cn("main-content", collapsed && "sidebar-collapsed")}>
          <Header />
          <main className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Quản lý người dùng
                </h1>
                <p className="text-muted-foreground mt-2">
                  Quản lý tài khoản người dùng trong hệ thống
                </p>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm người dùng
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingUser
                        ? "Sửa thông tin người dùng"
                        : "Thêm người dùng mới"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingUser
                        ? "Cập nhật thông tin người dùng. Để trống mật khẩu nếu không muốn thay đổi."
                        : "Nhập thông tin để tạo tài khoản người dùng mới."}
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {editingUser && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Hiện tại chỉ có thể thay đổi vai trò của người dùng.
                          Để cập nhật thông tin khác, vui lòng liên hệ quản trị
                          viên hệ thống.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-gray-700">
                        Họ và tên
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        required
                        disabled={!!editingUser}
                        className="border border-gray-300 bg-transparent focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                        placeholder="Nhập họ và tên"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        disabled={!!editingUser}
                        className="border border-gray-300 bg-transparent focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                        placeholder="Nhập email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-gray-700">
                        Công ty
                      </Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                        required
                        disabled={!!editingUser}
                        className="border border-gray-300 bg-transparent focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                        placeholder="Nhập công ty"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-gray-700">
                        Phòng ban
                      </Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: e.target.value,
                          })
                        }
                        disabled={!!editingUser}
                        className="border border-gray-300 bg-transparent focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700">
                        Số điện thoại
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        disabled={!!editingUser}
                        className="border border-gray-300 bg-transparent focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700">
                        {editingUser
                          ? "Mật khẩu mới (không thể thay đổi qua trang này)"
                          : "Mật khẩu"}
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          required={!editingUser}
                          disabled={!!editingUser}
                          className="border border-gray-300 bg-transparent focus:border-violet-500 focus:ring-1 focus:ring-violet-500 pr-10"
                          placeholder="Nhập mật khẩu"
                        />
                        {!editingUser && (
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
                        )}
                      </div>

                      {/* Password Requirements */}
                      {!editingUser && formData.password && (
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
                      <Label htmlFor="role" className="text-gray-700">
                        Vai trò
                      </Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) =>
                          setFormData({ ...formData, role: value })
                        }
                      >
                        <SelectTrigger className="border border-gray-300 bg-transparent focus:border-violet-500 focus:ring-1 focus:ring-violet-500">
                          <SelectValue placeholder="Chọn vai trò" />
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

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Hủy
                      </Button>
                      <Button type="submit">
                        {editingUser ? "Cập nhật" : "Tạo mới"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Tìm kiếm và lọc
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="search" className="text-gray-700">
                        Tìm kiếm
                      </Label>
                      <Input
                        id="search"
                        placeholder="Tìm theo tên, email hoặc công ty..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-gray-300 bg-transparent focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="roleFilter" className="text-gray-700">
                        Vai trò
                      </Label>
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-40 border border-gray-300 bg-transparent focus:border-violet-500 focus:ring-1 focus:ring-violet-500">
                          <SelectValue placeholder="Tất cả vai trò" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          <SelectItem value="user">Nhân viên</SelectItem>
                          <SelectItem value="manager">Quản lý</SelectItem>
                          <SelectItem value="admin">Quản trị viên</SelectItem>
                          <SelectItem value="approver">
                            Người phê duyệt
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Danh sách người dùng ({users.length})
                </CardTitle>
                <CardDescription>
                  Quản lý tất cả người dùng trong hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground">Đang tải...</div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Không có người dùng
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {search || roleFilter !== "all"
                        ? "Không tìm thấy người dùng phù hợp với bộ lọc."
                        : "Chưa có người dùng nào trong hệ thống."}
                    </p>
                    <div className="text-xs text-gray-500 mt-4">
                      Debug: Không thể tải dữ liệu người dùng
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Người dùng</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Công ty</TableHead>
                          <TableHead>Phòng ban</TableHead>
                          <TableHead>Điện thoại</TableHead>
                          <TableHead>Vai trò</TableHead>
                          <TableHead>Ngày tạo</TableHead>
                          <TableHead className="w-[100px]">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((userItem) => (
                          <TableRow key={userItem.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                  <Users className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {userItem.full_name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    ID: {userItem.id}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                {userItem.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                {userItem.company}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                {userItem.department || "Chưa có"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                {userItem.phone || "Chưa có"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getRoleBadgeVariant(userItem.role)}
                                className="flex items-center gap-1 w-fit"
                              >
                                {getRoleIcon(userItem.role)}
                                {userItem.role === "admin"
                                  ? "Quản trị viên"
                                  : userItem.role === "manager"
                                  ? "Quản lý"
                                  : "Người dùng"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {new Date(
                                  userItem.created_at
                                ).toLocaleDateString("vi-VN")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(userItem)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeactivate(userItem.id)}
                                  disabled={user?.id === userItem.id} // Prevent self-deactivation
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
