"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AuthGuard } from "@/components/auth-guard";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";
import { contractsApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  User,
  Calendar,
  DollarSign,
  Building2,
  MessageSquare,
  Shield,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Contract {
  id: number;
  contract_number: string;
  title: string;
  description: string;
  value: number;
  status: string;
  submitted_date: string;
  category: string;
  priority: string;
  contractor_name: string;
  contact_person: string;
  contractor_email: string;
  created_by_name: string;
  created_by_email: string;
  currentStep: number;
  totalSteps: number;
  approvalStatus: string;
  approvers: Array<{
    name: string;
    role: string;
    status: string;
    date: string | null;
    comments: string | null;
  }>;
  documents: string[];
  attachments: string[];
}

export default function ApprovalsPage() {
  const { collapsed } = useSidebar();
  const [selectedTab, setSelectedTab] = useState("pending");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<Contract[]>([]);
  const [approvedContracts, setApprovedContracts] = useState<Contract[]>([]);
  const [rejectedContracts, setRejectedContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from API
  useEffect(() => {
    loadApprovalData();
  }, []);

  const loadApprovalData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load pending approvals
      const pendingResponse = await contractsApi.getForApproval('pending_approval');
      if (pendingResponse.success && pendingResponse.data) {
        setPendingApprovals(pendingResponse.data as Contract[]);
      }

      // Load approved contracts
      const approvedResponse = await contractsApi.getForApproval('approved');
      if (approvedResponse.success && approvedResponse.data) {
        setApprovedContracts(approvedResponse.data as Contract[]);
      }

      // Load rejected contracts
      const rejectedResponse = await contractsApi.getForApproval('rejected');
      if (rejectedResponse.success && rejectedResponse.data) {
        setRejectedContracts(rejectedResponse.data as Contract[]);
      }
    } catch (err) {
      console.error('Error loading approval data:', err);
      setError('Không thể tải dữ liệu phê duyệt');
    } finally {
      setLoading(false);
    }
  };


  const handleApprove = async (contractId: number, comment: string) => {
    try {
      const response = await contractsApi.approve(contractId, comment);
      if (response.success) {
        // Reload data after approval
        await loadApprovalData();
        alert('Phê duyệt hợp đồng thành công!');
      } else {
        alert('Lỗi khi phê duyệt hợp đồng: ' + response.message);
      }
    } catch (error) {
      console.error('Error approving contract:', error);
      alert('Lỗi khi phê duyệt hợp đồng');
    }
  };

  const handleReject = async (contractId: number, reason: string) => {
    try {
      const response = await contractsApi.reject(contractId, reason);
      if (response.success) {
        // Reload data after rejection
        await loadApprovalData();
        alert('Từ chối hợp đồng thành công!');
      } else {
        alert('Lỗi khi từ chối hợp đồng: ' + response.message);
      }
    } catch (error) {
      console.error('Error rejecting contract:', error);
      alert('Lỗi khi từ chối hợp đồng');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Khẩn cấp";
      case "high":
        return "Cao";
      case "medium":
        return "Trung bình";
      default:
        return "Thấp";
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="layout-container bg-background">
          <Sidebar />
          <div className={cn("main-content", collapsed && "sidebar-collapsed")}>
            <Header />
            <main className="flex-1 p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="layout-container bg-background">
          <Sidebar />
          <div className={cn("main-content", collapsed && "sidebar-collapsed")}>
            <Header />
            <main className="flex-1 p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={loadApprovalData}>Thử lại</Button>
                </div>
              </div>
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
                Phê duyệt hợp đồng
              </h1>
              <p className="text-muted-foreground mt-2">
                Quản lý quy trình phê duyệt hợp đồng đa cấp
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                <Clock className="h-4 w-4 mr-2" />
                {pendingApprovals.length} chờ phê duyệt
              </Badge>
            </div>
          </div>

          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="pending"
                className="flex items-center space-x-2"
              >
                <Clock className="h-4 w-4" />
                <span>Chờ phê duyệt ({pendingApprovals.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Đã phê duyệt ({approvedContracts.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="flex items-center space-x-2"
              >
                <XCircle className="h-4 w-4" />
                <span>Đã từ chối ({rejectedContracts.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* Pending Approvals */}
            <TabsContent value="pending" className="space-y-6">
              <div className="grid gap-6">
                {pendingApprovals.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Không có hợp đồng nào chờ phê duyệt</p>
                  </div>
                ) : (
                  pendingApprovals.map((contract) => (
                  <Card
                    key={contract.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <CardTitle className="text-lg">
                              {contract.title}
                            </CardTitle>
                            <Badge
                              variant={getPriorityColor(contract.priority || 'medium')}
                            >
                              {getPriorityText(contract.priority || 'medium')}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <FileText className="h-4 w-4" />
                              <span>{contract.contract_number}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Building2 className="h-4 w-4" />
                              <span>{contract.contractor_name}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{contract.value?.toLocaleString('vi-VN')} VNĐ</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(new Date(contract.submitted_date), "dd/MM/yyyy", {
                                  locale: vi,
                                })}
                              </span>
                            </span>
                          </CardDescription>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedContract(contract)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{contract.title}</DialogTitle>
                              <DialogDescription>
                                Chi tiết hợp đồng và quy trình phê duyệt
                              </DialogDescription>
                            </DialogHeader>
                            {selectedContract && (
                              <div className="space-y-6">
                                {/* Contract Info */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Mã hợp đồng
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedContract.contract_number}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Nhà thầu
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedContract.contractor_name}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Giá trị
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedContract.value?.toLocaleString('vi-VN')} VNĐ
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Mức độ ưu tiên
                                    </Label>
                                    <Badge
                                      variant={getPriorityColor(
                                        selectedContract.priority || 'medium'
                                      )}
                                      className="mt-1"
                                    >
                                      {getPriorityText(
                                        selectedContract.priority || 'medium'
                                      )}
                                    </Badge>
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium">
                                    Mô tả dự án
                                  </Label>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {selectedContract.description}
                                  </p>
                                </div>

                                {/* Approval Progress */}
                                <div>
                                  <Label className="text-sm font-medium mb-3 block">
                                    Tiến trình phê duyệt (
                                    {selectedContract.currentStep}/
                                    {selectedContract.totalSteps})
                                  </Label>
                                  <Progress
                                    value={
                                      (selectedContract.currentStep /
                                        selectedContract.totalSteps) *
                                      100
                                    }
                                    className="mb-4"
                                  />
                                  <div className="space-y-3">
                                    {selectedContract.approvers.map(
                                      (approver, index: number) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                          <div className="flex items-center space-x-3">
                                            <Avatar className="h-8 w-8">
                                              <AvatarFallback>
                                                {approver.name.charAt(0)}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <p className="text-sm font-medium">
                                                {approver.name}
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                {approver.role}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            {approver.status === "approved" && (
                                              <>
                                                <Badge
                                                  variant="default"
                                                  className="bg-green-100 text-green-800"
                                                >
                                                  <CheckCircle className="h-3 w-3 mr-1" />
                                                  Đã phê duyệt
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                  {approver.date}
                                                </span>
                                              </>
                                            )}
                                            {approver.status === "pending" && (
                                              <Badge
                                                variant="secondary"
                                                className="bg-yellow-100 text-yellow-800"
                                              >
                                                <Clock className="h-3 w-3 mr-1" />
                                                Đang xử lý
                                              </Badge>
                                            )}
                                            {approver.status === "waiting" && (
                                              <Badge variant="outline">
                                                <User className="h-3 w-3 mr-1" />
                                                Chờ lượt
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>

                                {/* Documents */}
                                <div>
                                  <Label className="text-sm font-medium mb-3 block">
                                    Tài liệu đính kèm
                                  </Label>
                                  <div className="space-y-2">
                                    {selectedContract.documents.map(
                                      (doc, index: number) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between p-2 bg-muted rounded"
                                        >
                                          <span className="text-sm">{doc}</span>
                                          <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="destructive">
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Từ chối
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          Từ chối hợp đồng
                                        </DialogTitle>
                                        <DialogDescription>
                                          Vui lòng nhập lý do từ chối
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <Textarea
                                          placeholder="Nhập lý do từ chối..."
                                          rows={4}
                                        />
                                        <div className="flex justify-end space-x-2">
                                          <Button variant="outline">Hủy</Button>
                                          <Button
                                            variant="destructive"
                                            onClick={() => {
                                              const reason = (document.querySelector('textarea[placeholder="Nhập lý do từ chối..."]') as HTMLTextAreaElement)?.value;
                                              if (reason) {
                                                handleReject(selectedContract.id, reason);
                                              } else {
                                                alert('Vui lòng nhập lý do từ chối');
                                              }
                                            }}
                                          >
                                            Xác nhận từ chối
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>

                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Phê duyệt
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          Phê duyệt hợp đồng
                                        </DialogTitle>
                                        <DialogDescription>
                                          Xác nhận phê duyệt hợp đồng này
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <Textarea
                                          placeholder="Nhập nhận xét (tùy chọn)..."
                                          rows={3}
                                        />
                                        <div className="flex justify-end space-x-2">
                                          <Button variant="outline">Hủy</Button>
                                          <Button
                                            onClick={() => {
                                              const comment = (document.querySelector('textarea[placeholder="Nhập nhận xét (tùy chọn)..."]') as HTMLTextAreaElement)?.value;
                                              handleApprove(selectedContract.id, comment || '');
                                            }}
                                          >
                                            Xác nhận phê duyệt
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {contract.description}
                        </p>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              Tiến trình phê duyệt ({contract.currentStep}/
                              {contract.totalSteps})
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(
                                (contract.currentStep / contract.totalSteps) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              (contract.currentStep / contract.totalSteps) * 100
                            }
                          />
                        </div>

                        {/* Current Approver */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              Đang chờ:
                            </span>
                            <span className="text-sm font-medium">
                              {
                                contract.approvers.find(
                                  (a) => a.status === "pending"
                                )?.name || "Chưa xác định"
                              }
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {
                                contract.approvers.find(
                                  (a) => a.status === "pending"
                                )?.role || "Chưa xác định"
                              }
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Nhắn tin
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Approved Contracts */}
            <TabsContent value="approved" className="space-y-6">
              <div className="grid gap-6">
                {approvedContracts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Không có hợp đồng nào đã phê duyệt</p>
                  </div>
                ) : (
                  approvedContracts.map((contract) => (
                  <Card key={contract.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <CardTitle className="text-lg">
                              {contract.title}
                            </CardTitle>
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Đã phê duyệt
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <FileText className="h-4 w-4" />
                              <span>{contract.contract_number}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Building2 className="h-4 w-4" />
                              <span>{contract.contractor_name}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{contract.value?.toLocaleString('vi-VN')} VNĐ</span>
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Ngày phê duyệt:
                          </span>
                          <span className="text-sm font-medium">
                            {format(new Date(contract.submitted_date), "dd/MM/yyyy", {
                              locale: vi,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Người tạo:
                          </span>
                          <span className="text-sm font-medium">
                            {contract.created_by_name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Trạng thái:
                          </span>
                          <Badge variant="default" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                            Đã phê duyệt
                            </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Rejected Contracts */}
            <TabsContent value="rejected" className="space-y-6">
              <div className="grid gap-6">
                {rejectedContracts.length === 0 ? (
                  <div className="text-center py-8">
                    <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Không có hợp đồng nào đã từ chối</p>
                  </div>
                ) : (
                  rejectedContracts.map((contract) => (
                  <Card key={contract.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <CardTitle className="text-lg">
                              {contract.title}
                            </CardTitle>
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Đã từ chối
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <FileText className="h-4 w-4" />
                              <span>{contract.contract_number}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Building2 className="h-4 w-4" />
                              <span>{contract.contractor_name}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{contract.value?.toLocaleString('vi-VN')} VNĐ</span>
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Ngày từ chối:
                          </span>
                          <span className="text-sm font-medium">
                            {format(new Date(contract.submitted_date), "dd/MM/yyyy", {
                              locale: vi,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Người tạo:
                          </span>
                          <span className="text-sm font-medium">
                            {contract.created_by_name}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">
                            Lý do từ chối:
                          </span>
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                              {contract.approvers.find(a => a.status === 'rejected')?.comments || 'Không có lý do cụ thể'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
