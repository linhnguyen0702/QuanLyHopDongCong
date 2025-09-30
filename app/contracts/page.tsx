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
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Shield,
} from "lucide-react";
import { ContractForm } from "@/components/contract-form";
import { ContractDetails } from "@/components/contract-details";

// Mock data for contracts
const contracts = [
  {
    id: "HĐ-2024-001",
    title: "Xây dựng cầu Nhật Tân 2",
    contractor: "Công ty TNHH ABC Construction",
    value: 450000000,
    startDate: "2024-01-15",
    endDate: "2024-12-31",
    status: "active",
    progress: 75,
    blockchainHash: "0x1a2b3c4d5e6f7890abcdef1234567890",
    category: "Xây dựng",
  },
  {
    id: "HĐ-2024-002",
    title: "Nâng cấp hệ thống điện",
    contractor: "Tập đoàn Điện lực XYZ",
    value: 280000000,
    startDate: "2024-02-01",
    endDate: "2024-08-30",
    status: "pending",
    progress: 45,
    blockchainHash: "0x2b3c4d5e6f7890abcdef1234567890ab",
    category: "Điện lực",
  },
  {
    id: "HĐ-2024-003",
    title: "Xây dựng trường học",
    contractor: "Công ty Xây dựng DEF",
    value: 320000000,
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    status: "completed",
    progress: 100,
    blockchainHash: "0x3c4d5e6f7890abcdef1234567890abcd",
    category: "Giáo dục",
  },
  {
    id: "HĐ-2024-004",
    title: "Cải tạo hệ thống cấp nước",
    contractor: "Công ty Cấp nước GHI",
    value: 180000000,
    startDate: "2024-03-01",
    endDate: "2024-09-30",
    status: "draft",
    progress: 0,
    blockchainHash: null,
    category: "Hạ tầng",
  },
];

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Đang thực hiện
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Hoàn thành
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Chờ phê duyệt
          </Badge>
        );
      case "draft":
        return <Badge variant="outline">Bản nháp</Badge>;
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

  const filteredContracts = contracts.filter(
    (contract) =>
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="layout-container bg-background">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Quản lý Hợp đồng
              </h1>
              <p className="text-muted-foreground mt-2">
                Quản lý toàn bộ hợp đồng dự án với tích hợp blockchain
                Hyperledger
              </p>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-secondary hover:bg-secondary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo hợp đồng mới
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tạo hợp đồng mới</DialogTitle>
                  <DialogDescription>
                    Nhập thông tin chi tiết cho hợp đồng mới. Dữ liệu sẽ được
                    lưu trữ trên blockchain.
                  </DialogDescription>
                </DialogHeader>
                <ContractForm onClose={() => setIsCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên, mã hợp đồng, nhà thầu..."
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

          {/* Contracts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách hợp đồng</CardTitle>
              <CardDescription>
                Tổng cộng {filteredContracts.length} hợp đồng được tìm thấy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã HĐ</TableHead>
                    <TableHead>Tên dự án</TableHead>
                    <TableHead>Nhà thầu</TableHead>
                    <TableHead>Giá trị</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Blockchain</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        {contract.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{contract.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {contract.category}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{contract.contractor}</TableCell>
                      <TableCell>{formatCurrency(contract.value)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>
                            {new Date(contract.startDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                          <p className="text-muted-foreground">
                            đến{" "}
                            {new Date(contract.endDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(contract.status)}</TableCell>
                      <TableCell>
                        {contract.blockchainHash ? (
                          <div className="flex items-center space-x-1">
                            <Shield className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-600">
                              Đã xác thực
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Chưa lưu
                          </span>
                        )}
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
                                setSelectedContract(contract);
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
                              Tải xuống
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

          {/* Contract Details Dialog */}
          <Dialog
            open={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chi tiết hợp đồng</DialogTitle>
                <DialogDescription>
                  Thông tin chi tiết và lịch sử giao dịch blockchain
                </DialogDescription>
              </DialogHeader>
              {selectedContract && (
                <ContractDetails
                  contract={selectedContract}
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
