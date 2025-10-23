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
import { BlockchainStatusBadge } from "@/components/blockchain-status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ContractForm } from "@/components/contract-form";
import { ContractDetails } from "@/components/contract-details";
import { contractsApi } from "@/lib/api";
import { AuthGuard } from "@/components/auth-guard";

type ContractRow = {
  id: number;
  contract_number: string;
  title: string;
  contractor_name?: string;
  value: number;
  start_date: string;
  end_date: string;
  status: string;
  progress?: number;
  category?: string;
};

export default function ContractsPage() {
  const { collapsed } = useSidebar();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    | "all"
    | "pending"
    | "approved"
    | "active"
    | "completed"
    | "rejected"
    | "cancelled"
    | "expired"
  >("all");
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<any>(null);
  const [items, setItems] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const load = async () => {
    try {
      const res = await contractsApi.getAll({ page: 1, limit: 100 });
      console.log('Contracts API response:', res);
      if (res?.success) {
        const list: any = (res as any).data?.contracts || (res as any).data || [];
        console.log('Contracts list:', list);
        setItems(Array.isArray(list) ? list : []);
        setError("");
      } else {
        setError((res as any)?.message || "Không thể tải dữ liệu hợp đồng. Hãy đăng nhập lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await load();
      
      // Check for edit parameter in URL
      const urlParams = new URLSearchParams(window.location.search);
      const editId = urlParams.get('edit');
      if (editId) {
        const contractToEdit = items.find(item => item.id === parseInt(editId));
        if (contractToEdit) {
          setSelectedContract(contractToEdit);
          setIsEditDialogOpen(true);
        }
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [items]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Chờ phê duyệt
          </Badge>
        );
      case "pending_approval":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Chờ phê duyệt
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Đã phê duyệt
          </Badge>
        );
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Đang thực hiện
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Hoàn thành
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Đã hủy
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Hết hạn
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

  const filteredContracts = items.filter((contract) => {
    const matchesSearch =
      (contract.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contract.contractor_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contract.contract_number || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "all") return true;

    const status = (contract.status || "").toLowerCase();
    switch (statusFilter) {
      case "pending":
        return status === "pending_approval" || status === "draft";
      case "approved":
        return status === "approved";
      case "active":
        return status === "active";
      case "completed":
        return status === "completed";
      case "rejected":
        return status === "rejected";
      case "cancelled":
        return status === "cancelled";
      case "expired":
        return status === "expired";
      default:
        return true;
    }
  });

  // Xử lý xóa hợp đồng
  const handleDeleteContract = async () => {
    if (!contractToDelete) return;

    try {
      const response = await contractsApi.delete(contractToDelete.id);
      
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Đã xóa hợp đồng thành công",
        });
        
        // Cập nhật danh sách
        setItems(items.filter(item => item.id !== contractToDelete.id));
        setIsDeleteDialogOpen(false);
        setContractToDelete(null);
      } else {
        toast({
          title: "Lỗi",
          description: response.message || "Không thể xóa hợp đồng",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Delete contract error:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xóa hợp đồng",
        variant: "destructive",
      });
    }
  };

  // Xử lý tải xuống hợp đồng
  const handleDownloadContract = async (contract: any) => {
    try {
      // Tạo nội dung PDF đơn giản
      const contractData = {
        title: contract.title,
        contractNumber: contract.contract_number,
        contractor: contract.contractor_name,
        value: contract.value,
        startDate: contract.start_date,
        endDate: contract.end_date,
        status: contract.status,
        category: contract.category,
      };

      // Tạo nội dung HTML cho PDF
      const htmlContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>Hợp đồng ${contractData.contractNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { text-align: center; margin-bottom: 30px; }
              .contract-info { margin-bottom: 20px; }
              .info-row { margin-bottom: 10px; }
              .label { font-weight: bold; display: inline-block; width: 150px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>HỢP ĐỒNG DỰ ÁN</h1>
              <h2>${contractData.title}</h2>
            </div>
            
            <div class="contract-info">
              <div class="info-row">
                <span class="label">Mã hợp đồng:</span>
                <span>${contractData.contractNumber}</span>
              </div>
              <div class="info-row">
                <span class="label">Nhà thầu:</span>
                <span>${contractData.contractor || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="label">Giá trị:</span>
                <span>${formatCurrency(contractData.value)}</span>
              </div>
              <div class="info-row">
                <span class="label">Ngày bắt đầu:</span>
                <span>${new Date(contractData.startDate).toLocaleDateString('vi-VN')}</span>
              </div>
              <div class="info-row">
                <span class="label">Ngày kết thúc:</span>
                <span>${new Date(contractData.endDate).toLocaleDateString('vi-VN')}</span>
              </div>
              <div class="info-row">
                <span class="label">Trạng thái:</span>
                <span>${contractData.status}</span>
              </div>
              <div class="info-row">
                <span class="label">Danh mục:</span>
                <span>${contractData.category || 'N/A'}</span>
              </div>
            </div>
            
            <div style="margin-top: 50px; text-align: center;">
              <p><em>Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}</em></p>
            </div>
          </body>
        </html>
      `;

      // Tạo blob và tải xuống
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hop-dong-${contractData.contractNumber}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Thành công",
        description: "Đã tải xuống hợp đồng thành công",
      });
    } catch (error) {
      console.error("Download contract error:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tải xuống hợp đồng",
        variant: "destructive",
      });
    }
  };

  // Xử lý xuất Excel
  const handleExportExcel = () => {
    try {
      // Tạo CSV content
      const headers = ['Mã HĐ', 'Tên dự án', 'Nhà thầu', 'Giá trị', 'Ngày bắt đầu', 'Ngày kết thúc', 'Trạng thái', 'Danh mục'];
      const csvContent = [
        headers.join(','),
        ...filteredContracts.map(contract => [
          contract.contract_number,
          `"${contract.title}"`,
          `"${contract.contractor_name || ''}"`,
          contract.value,
          new Date(contract.start_date).toLocaleDateString('vi-VN'),
          new Date(contract.end_date).toLocaleDateString('vi-VN'),
          contract.status,
          `"${contract.category || ''}"`
        ].join(','))
      ].join('\n');

      // Tạo blob và tải xuống
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `danh-sach-hop-dong-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Thành công",
        description: "Đã xuất danh sách hợp đồng thành công",
      });
    } catch (error) {
      console.error("Export Excel error:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xuất danh sách",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="layout-container bg-background">
          <Sidebar />
          <div className={cn("main-content", collapsed && "sidebar-collapsed")}>
            <Header />
            <main className="p-6">
              <div className="text-sm text-muted-foreground">Đang tải dữ liệu hợp đồng...</div>
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
                <Button className="bg-[#7C3AED] hover:bg-[#7C3AED]/90">
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
                <ContractForm
                  onClose={() => setIsCreateDialogOpen(false)}
                  onSuccess={async (created) => {
                    // Thêm ngay vào danh sách để không cần refresh
                    if (created?.id) {
                      setItems((prev) => [{
                        id: created.id,
                        contract_number: created.contractNumber,
                        title: created.title,
                        value: Number(created.value) || 0,
                        start_date: created.startDate,
                        end_date: created.endDate,
                        status: created.status || "draft",
                      } as any, ...prev]);
                    }
                    // Đồng bộ lại từ server để đảm bảo nhất quán
                    setLoading(true);
                    await load();
                  }}
                />
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
                <div className="flex items-center">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="h-9 rounded-md border px-2 text-sm bg-background"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ phê duyệt</option>
                    <option value="approved">Đã phê duyệt</option>
                    <option value="active">Đang thực hiện</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="rejected">Đã từ chối</option>
                    <option value="cancelled">Đã hủy</option>
                    <option value="expired">Hết hạn</option>
                  </select>
                </div>
                <Button variant="outline" onClick={handleExportExcel}>
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
                  {error && (
                    <div className="mb-4 text-sm text-red-600">
                      {error}
                    </div>
                  )}
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
                        {contract.contract_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{contract.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {contract.category || ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{contract.contractor_name || ""}</TableCell>
                      <TableCell>{formatCurrency(Number(contract.value) || 0)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>
                            {new Date(contract.start_date).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                          <p className="text-muted-foreground">
                            đến{" "}
                            {new Date(contract.end_date).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(contract.status)}</TableCell>
                      <TableCell>
                        <BlockchainStatusBadge 
                          contractId={contract.contract_number}
                          contractData={contract}
                          onStatusChange={(isOnBlockchain) => {
                            // Update contract status in local state
                            setItems((prev: any[]) => prev.map((c: any) => 
                              c.id === contract.id 
                                ? { ...c, is_blockchain_verified: isOnBlockchain }
                                : c
                            ))
                          }}
                        />
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
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedContract(contract);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadContract(contract)}>
                              <Download className="h-4 w-4 mr-2" />
                              Tải xuống
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setContractToDelete(contract);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
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

          {/* Edit Contract Dialog */}
          <Dialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa hợp đồng</DialogTitle>
                <DialogDescription>
                  Cập nhật thông tin hợp đồng
                </DialogDescription>
              </DialogHeader>
              {selectedContract && (
                <ContractForm
                  contract={selectedContract}
                  onClose={() => setIsEditDialogOpen(false)}
                  onSuccess={async () => {
                    setLoading(true);
                    await load();
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa hợp đồng</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa hợp đồng "{contractToDelete?.title}" không? 
                  Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteContract}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
