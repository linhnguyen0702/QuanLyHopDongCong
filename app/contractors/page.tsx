"use client";

import { useState } from "react";
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

// Mock data for contractors
const contractors = [
  {
    id: "CT-001",
    name: "Công ty TNHH ABC Construction",
    shortName: "ABC Construction",
    taxCode: "0123456789",
    address: "123 Đường Láng, Đống Đa, Hà Nội",
    phone: "024-3456-7890",
    email: "contact@abc-construction.vn",
    website: "www.abc-construction.vn",
    representative: "Nguyễn Văn A",
    representativePosition: "Giám đốc",
    establishedDate: "2010-05-15",
    registrationNumber: "0123456789",
    category: "Xây dựng",
    specialization: [
      "Xây dựng cầu đường",
      "Công trình dân dụng",
      "Hạ tầng kỹ thuật",
    ],
    status: "active",
    rating: 4.8,
    totalContracts: 15,
    totalValue: 2500000000,
    completedContracts: 12,
    ongoingContracts: 3,
    lastContractDate: "2024-01-15",
    certifications: ["ISO 9001:2015", "ISO 14001:2015", "OHSAS 18001:2007"],
    bankAccount: "1234567890",
    bankName: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
  },
  {
    id: "CT-002",
    name: "Tập đoàn Điện lực XYZ",
    shortName: "XYZ Power",
    taxCode: "0987654321",
    address: "456 Phố Huế, Hai Bà Trưng, Hà Nội",
    phone: "024-9876-5432",
    email: "info@xyz-power.vn",
    website: "www.xyz-power.vn",
    representative: "Trần Thị B",
    representativePosition: "Tổng Giám đốc",
    establishedDate: "2008-03-20",
    registrationNumber: "0987654321",
    category: "Điện lực",
    specialization: ["Hệ thống điện", "Năng lượng tái tạo", "Truyền tải điện"],
    status: "active",
    rating: 4.6,
    totalContracts: 8,
    totalValue: 1800000000,
    completedContracts: 6,
    ongoingContracts: 2,
    lastContractDate: "2024-02-01",
    certifications: ["ISO 9001:2015", "ISO 50001:2018"],
    bankAccount: "0987654321",
    bankName: "Ngân hàng TMCP Ngoại thương Việt Nam",
  },
  {
    id: "CT-003",
    name: "Công ty Xây dựng DEF",
    shortName: "DEF Construction",
    taxCode: "0456789123",
    address: "789 Giải Phóng, Hoàng Mai, Hà Nội",
    phone: "024-4567-8912",
    email: "contact@def-construction.vn",
    website: "www.def-construction.vn",
    representative: "Lê Văn C",
    representativePosition: "Giám đốc",
    establishedDate: "2015-08-10",
    registrationNumber: "0456789123",
    category: "Xây dựng",
    specialization: [
      "Công trình giáo dục",
      "Nhà ở xã hội",
      "Công trình công cộng",
    ],
    status: "active",
    rating: 4.5,
    totalContracts: 6,
    totalValue: 950000000,
    completedContracts: 5,
    ongoingContracts: 1,
    lastContractDate: "2024-01-01",
    certifications: ["ISO 9001:2015"],
    bankAccount: "4567891230",
    bankName: "Ngân hàng TMCP Công thương Việt Nam",
  },
  {
    id: "CT-004",
    name: "Công ty Cấp nước GHI",
    shortName: "GHI Water",
    taxCode: "0789123456",
    address: "321 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    phone: "024-7891-2345",
    email: "info@ghi-water.vn",
    website: "www.ghi-water.vn",
    representative: "Phạm Thị D",
    representativePosition: "Giám đốc",
    establishedDate: "2012-11-25",
    registrationNumber: "0789123456",
    category: "Hạ tầng",
    specialization: [
      "Hệ thống cấp nước",
      "Xử lý nước thải",
      "Hạ tầng kỹ thuật",
    ],
    status: "pending",
    rating: 4.2,
    totalContracts: 4,
    totalValue: 720000000,
    completedContracts: 3,
    ongoingContracts: 1,
    lastContractDate: "2024-03-01",
    certifications: ["ISO 9001:2015", "ISO 14001:2015"],
    bankAccount: "7891234560",
    bankName: "Ngân hàng TMCP Á Châu",
  },
];

export default function ContractorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContractor, setSelectedContractor] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

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

  const filteredContractors = contractors.filter(
    (contractor) =>
      contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.taxCode.includes(searchTerm) ||
      contractor.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="layout-container bg-background">
      <Sidebar />
      <div className="main-content">
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
                    Tổng cộng {filteredContractors.length} nhà thầu được tìm
                    thấy
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                              <p className="font-medium">
                                {contractor.shortName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {contractor.taxCode}
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
                            <Badge variant="outline">
                              {contractor.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              {getRatingStars(contractor.rating)}
                              <span className="text-sm ml-1">
                                {contractor.rating}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">
                                {contractor.totalContracts} hợp đồng
                              </p>
                              <p className="text-muted-foreground">
                                {formatCurrency(contractor.totalValue)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(contractor.status)}
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
                    <div className="text-2xl font-bold">
                      {contractors.filter((c) => c.status === "active").length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(
                        (contractors.filter((c) => c.status === "active")
                          .length /
                          contractors.length) *
                          100
                      )}
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
                    <div className="text-2xl font-bold">
                      {(
                        contractors.reduce((sum, c) => sum + c.rating, 0) /
                        contractors.length
                      ).toFixed(1)}
                    </div>
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
                    <div className="text-2xl font-bold">
                      {formatCurrency(
                        contractors.reduce((sum, c) => sum + c.totalValue, 0)
                      )}
                    </div>
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
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(
                        (contractors.reduce(
                          (sum, c) => sum + c.completedContracts,
                          0
                        ) /
                          contractors.reduce(
                            (sum, c) => sum + c.totalContracts,
                            0
                          )) *
                          100
                      )}
                      %
                    </div>
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
                    {contractors
                      .sort((a, b) => b.rating - a.rating)
                      .slice(0, 5)
                      .map((contractor, index) => (
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
                              <p className="font-medium">
                                {contractor.shortName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {contractor.category}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1 mb-1">
                              {getRatingStars(contractor.rating)}
                              <span className="text-sm ml-1">
                                {contractor.rating}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {contractor.completedContracts}/
                              {contractor.totalContracts} hoàn thành
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
                    {Object.entries(
                      contractors.reduce((acc, contractor) => {
                        acc[contractor.category] =
                          (acc[contractor.category] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([category, count]) => (
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
                                width: `${(count / contractors.length) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {count}
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
                    {contractors
                      .sort(
                        (a, b) =>
                          new Date(b.lastContractDate).getTime() -
                          new Date(a.lastContractDate).getTime()
                      )
                      .slice(0, 5)
                      .map((contractor) => (
                        <div
                          key={contractor.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {contractor.shortName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Hợp đồng gần nhất
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {new Date(
                                contractor.lastContractDate
                              ).toLocaleDateString("vi-VN")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {contractor.ongoingContracts} đang thực hiện
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
  );
}
