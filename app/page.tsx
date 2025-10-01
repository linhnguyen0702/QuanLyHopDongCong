"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AuthGuard } from "@/components/auth-guard";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Building2,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContractForm } from "@/components/contract-form";
import { ContractorForm } from "@/components/contractor-form";

export default function Dashboard() {
  const router = useRouter();
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [isContractorDialogOpen, setIsContractorDialogOpen] = useState(false);

  const handleCreateContract = () => {
    setIsContractDialogOpen(true);
  };

  const handleAddContractor = () => {
    setIsContractorDialogOpen(true);
  };

  const handleApproveContracts = () => {
    router.push("/approvals");
  };

  const handleViewContract = (contractId: string) => {
    router.push(`/contracts/${contractId}`);
  };

  return (
    <AuthGuard>
      <div className="layout-container bg-background">
        <Sidebar />
        <div className="main-content">
          <Header />
          <main className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Dashboard Tổng quan
                </h1>
                <p className="text-muted-foreground mt-2">
                  Theo dõi và quản lý các hợp đồng dự án nhà nước
                </p>
              </div>
              <Button
                className="bg-[#7C3AED] hover:bg-[#7C3AED]/90"
                onClick={handleCreateContract}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo hợp đồng mới
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push("/contracts")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tổng hợp đồng
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">247</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+12%</span> so với tháng
                    trước
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push("/contractors")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Nhà thầu
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+3</span> nhà thầu mới
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push("/reports")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Giá trị hợp đồng
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.4B VNĐ</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+8.2%</span> tăng trưởng
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push("/reports")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Hiệu suất
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94.2%</div>
                  <p className="text-xs text-muted-foreground">
                    Tỷ lệ hoàn thành đúng hạn
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Contracts */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Hợp đồng gần đây</CardTitle>
                  <CardDescription>
                    Danh sách các hợp đồng được tạo và cập nhật gần đây
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        id: "HD-2024-001",
                        title: "Xây dựng cầu Nhật Tân 2",
                        contractor: "Công ty TNHH ABC",
                        value: "450M VNĐ",
                        status: "active",
                        progress: 75,
                      },
                      {
                        id: "HD-2024-002",
                        title: "Nâng cấp hệ thống điện",
                        contractor: "Tập đoàn Điện lực XYZ",
                        value: "280M VNĐ",
                        status: "pending",
                        progress: 45,
                      },
                      {
                        id: "HD-2024-003",
                        title: "Xây dựng trường học",
                        contractor: "Công ty Xây dựng DEF",
                        value: "320M VNĐ",
                        status: "completed",
                        progress: 100,
                      },
                    ].map((contract) => (
                      <div
                        key={contract.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleViewContract(contract.id)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{contract.title}</h4>
                            <Badge
                              variant={
                                contract.status === "completed"
                                  ? "default"
                                  : contract.status === "active"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {contract.status === "completed"
                                ? "Hoàn thành"
                                : contract.status === "active"
                                ? "Đang thực hiện"
                                : "Chờ phê duyệt"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {contract.contractor} • {contract.value}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={contract.progress}
                              className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground">
                              {contract.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions & Alerts */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thao tác nhanh</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent hover:bg-muted"
                      onClick={handleCreateContract}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Tạo hợp đồng mới
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent hover:bg-muted"
                      onClick={handleAddContractor}
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Thêm nhà thầu
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent hover:bg-muted"
                      onClick={handleApproveContracts}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Phê duyệt hợp đồng
                    </Button>
                  </CardContent>
                </Card>

                {/* Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cảnh báo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div
                      className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                      onClick={() => router.push("/contracts?filter=expiring")}
                    >
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-800">
                          3 hợp đồng sắp hết hạn
                        </p>
                        <p className="text-xs text-yellow-600">
                          Cần gia hạn trong 7 ngày tới
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                      onClick={() => router.push("/contracts?filter=overdue")}
                    >
                      <Clock className="h-4 w-4 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">
                          2 thanh toán quá hạn
                        </p>
                        <p className="text-xs text-red-600">Cần xử lý ngay</p>
                      </div>
                    </div>

                    <div
                      className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                      onClick={() => router.push("/security")}
                    >
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">
                          Blockchain đồng bộ
                        </p>
                        <p className="text-xs text-green-600">
                          Tất cả giao dịch đã được xác thực
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>

        {/* Contract Dialog */}
        <Dialog
          open={isContractDialogOpen}
          onOpenChange={setIsContractDialogOpen}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo hợp đồng mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin chi tiết cho hợp đồng mới. Dữ liệu sẽ được lưu
                trữ trên blockchain.
              </DialogDescription>
            </DialogHeader>
            <ContractForm onClose={() => setIsContractDialogOpen(false)} />
          </DialogContent>
        </Dialog>

        {/* Contractor Dialog */}
        <Dialog
          open={isContractorDialogOpen}
          onOpenChange={setIsContractorDialogOpen}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm nhà thầu mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin chi tiết về nhà thầu mới
              </DialogDescription>
            </DialogHeader>
            <ContractorForm onClose={() => setIsContractorDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
}
