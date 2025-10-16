"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Building2,
  Star,
  Phone,
  Mail,
  TrendingUp,
} from "lucide-react";
import { ContractorForm } from "@/components/contractor-form";
import { ContractorDetails } from "@/components/contractor-details";
import { contractorsApi } from "@/lib/api";
import { AuthGuard } from "@/components/auth-guard";

type ContractorRow = {
  id: number;
  name: string;
  contact_person?: string;
  email: string;
  phone: string;
  address?: string;
  tax_code?: string;
  status?: string;
  created_at?: string;
  stats?: {
    total_contracts: number;
    active_contracts: number;
    completed_contracts: number;
    total_value: number;
  };
};

export default function ContractorsPage() {
  const { collapsed } = useSidebar();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContractor, setSelectedContractor] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [items, setItems] = useState<ContractorRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // Lấy tất cả trạng thái: truyền status = "" để tránh default 'active' ở backend
        const res = await contractorsApi.getAll({ page: 1, limit: 100, status: "" as any });
        if (mounted && res?.success) {
          const data: any = (res as any).data;
          const list = data?.contractors || data || [];
          setItems(Array.isArray(list) ? list : []);
          setError("");
        } else if (mounted) {
          setError((res as any)?.message || "Không thể tải dữ liệu nhà thầu. Hãy đăng nhập lại.");
        }
      } finally {
        mounted && setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Hoạt động
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Chờ duyệt
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Tạm dừng
          </Badge>
        );
      case "blacklisted":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Danh sách đen
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const filteredContractors = items.filter(
    (contractor) =>
      (contractor.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contractor.tax_code || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Derived stats based on available backend fields
  const activeCount = items.filter((c) => (c.status || "active") === "active").length;
  const totalContractValue = items.reduce((sum, c) => sum + (c.stats?.total_value || 0), 0);
  const totalContracts = items.reduce((sum, c) => sum + (c.stats?.total_contracts || 0), 0);
  const totalCompleted = items.reduce((sum, c) => sum + (c.stats?.completed_contracts || 0), 0);
  const completionRate = totalContracts > 0 ? Math.round((totalCompleted / totalContracts) * 100) : 0;

  const topByValue = [...items]
    .sort((a: ContractorRow, b: ContractorRow) => (b.stats?.total_value || 0) - (a.stats?.total_value || 0))
    .slice(0, 5);

  const statusDistribution = items.reduce((acc: Record<string, number>, c) => {
    const key = (c.status || "active").toString();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <AuthGuard>
        <div className="layout-container bg-background">
          <Sidebar />
          <div className={cn("main-content", collapsed && "sidebar-collapsed")}> 
            <Header />
            <main className="flex-1 p-6">
              <div className="text-sm text-muted-foreground">Đang tải dữ liệu nhà thầu...</div>
            </main>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="layout-container bg-background">
      <Sidebar />
      <div className={cn("main-content", collapsed && "sidebar-collapsed")}>
        <Header />
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Quản lý Nhà thầu
              </h1>
              <p className="text-muted-foreground mt-2">
                Quản lý thông tin các nhà thầu và đối tác
              </p>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-[#7C3AED] hover:bg-[#7C3AED]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm nhà thầu
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Thêm nhà thầu mới</DialogTitle>
                  <DialogDescription>
                    Nhập thông tin chi tiết về nhà thầu mới
                  </DialogDescription>
                </DialogHeader>
                <ContractorForm onClose={() => setIsCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="list">Danh sách nhà thầu</TabsTrigger>
              <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
              <TabsTrigger value="analytics">Phân tích</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-6">
              {/* Filters and Search */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm theo tên, mã số thuế, danh mục..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Bộ lọc
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Xuất Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Contractors Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Danh sách nhà thầu</CardTitle>
                  <CardDescription>
                    Tổng cộng {filteredContractors.length} nhà thầu được tìm thấy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="mb-4 text-sm text-red-600">{error}</div>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Thông tin nhà thầu</TableHead>
                        <TableHead>Liên hệ</TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>Đánh giá</TableHead>
                        <TableHead>Hợp đồng</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContractors.map((contractor) => (
                        <TableRow key={contractor.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{contractor.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {contractor.tax_code}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">
                                  {contractor.phone}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">
                                  {contractor.email}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">—</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">—</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">
                                {contractor.stats?.total_contracts || 0} hợp đồng
                              </p>
                              <p className="text-muted-foreground">
                                {formatCurrency(contractor.stats?.total_value || 0)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(contractor.status || "active")}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedContractor(contractor);
                                    setIsDetailsDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Xuất hồ sơ
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              {/* Performance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Nhà thầu hoạt động
                    </CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activeCount}</div>
                    <p className="text-xs text-muted-foreground">
                      {items.length > 0 ? Math.round((activeCount / items.length) * 100) : 0}
                      % tổng số nhà thầu
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Đánh giá trung bình
                    </CardTitle>
                    <Star className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">—</div>
                    <p className="text-xs text-muted-foreground">
                      Trên thang điểm 5
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Tổng giá trị
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalContractValue)}</div>
                    <p className="text-xs text-muted-foreground">
                      Tổng giá trị hợp đồng
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Tỷ lệ hoàn thành
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      Hợp đồng hoàn thành
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle>Nhà thầu xuất sắc</CardTitle>
                  <CardDescription>
                    Xếp hạng theo đánh giá và hiệu suất
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topByValue.map((contractor: ContractorRow, index: number) => (
                        <div
                          key={contractor.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{contractor.name}</p>
                              <p className="text-sm text-muted-foreground">
                                —
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1 mb-1">—</div>
                            <p className="text-sm text-muted-foreground">
                              {contractor.stats?.completed_contracts || 0}/
                              {contractor.stats?.total_contracts || 0} hoàn thành
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Phân bố theo danh mục</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(statusDistribution).map(([category, count]: [string, number]) => (
                      <div
                        key={category}
                        className="flex items-center justify-between"
                      >
                        <span className="font-medium">{category}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div
                              className="bg-secondary h-2 rounded-full"
                              style={{
                                width: `${items.length > 0 ? (Number(count) / items.length) * 100 : 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {Number(count)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Hoạt động gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...items]
                      .sort((a: ContractorRow, b: ContractorRow) => {
                        const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
                        const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
                        return tb - ta;
                      })
                      .slice(0, 5)
                      .map((contractor: ContractorRow) => (
                        <div
                          key={contractor.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{contractor.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Hợp đồng đang thực hiện
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {contractor.created_at
                                ? new Date(contractor.created_at).toLocaleDateString("vi-VN")
                                : "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {contractor.stats?.active_contracts || 0} đang thực hiện
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Contractor Details Dialog */}
          <Dialog
            open={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chi tiết nhà thầu</DialogTitle>
                <DialogDescription>
                  Thông tin chi tiết và lịch sử hợp đồng
                </DialogDescription>
              </DialogHeader>
              {selectedContractor && (
                <ContractorDetails
                  contractor={selectedContractor}
                  onClose={() => setIsDetailsDialogOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
