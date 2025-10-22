"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AuthGuard } from "@/components/auth-guard";
import { useSidebar } from "@/hooks/use-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

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
import { contractsApi, contractorsApi } from "@/lib/api";
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
  const { collapsed } = useSidebar();
  const { user } = useAuth();
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [isContractorDialogOpen, setIsContractorDialogOpen] = useState(false);

  // Real data states
  const [totalContracts, setTotalContracts] = useState<number | null>(null);
  const [totalContractValue, setTotalContractValue] = useState<number | null>(null);
  const [avgProgress, setAvgProgress] = useState<number | null>(null);
  const [expiringCount, setExpiringCount] = useState<number | null>(null);
  const [overdueCount, setOverdueCount] = useState<number | null>(null);
  const [contractorsTotal, setContractorsTotal] = useState<number | null>(null);
  const [recentContracts, setRecentContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // New stats for real calculations
  const [contractsChangePercent, setContractsChangePercent] = useState<number | null>(null);
  const [valueChangePercent, setValueChangePercent] = useState<number | null>(null);
  const [performance, setPerformance] = useState<number | null>(null);
  const [newContractorsThisMonth, setNewContractorsThisMonth] = useState<number | null>(null);

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

  // Fetch dashboard data
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [statsRes, contractorsStatsRes, contractorsRes, recentRes] = await Promise.all([
          contractsApi.getStats(),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/contractors/stats/overview`).then(res => res.json()),
          contractorsApi.getAll({ page: 1, limit: 1 }),
          contractsApi.getAll({ page: 1, limit: 3 }),
        ]);

        if (mounted) {
          if (statsRes?.success && (statsRes as any).data) {
            const data: any = (statsRes as any).data;
            setTotalContracts(data.totalContracts ?? null);
            setTotalContractValue(data.totalValue ?? null);
            setAvgProgress(
              typeof data.avgProgress === "number" ? data.avgProgress : null
            );
            setExpiringCount(data.expiringCount ?? null);
            setOverdueCount(data.overdueCount ?? null);
            setContractsChangePercent(data.contractsChangePercent ?? null);
            setValueChangePercent(data.valueChangePercent ?? null);
            setPerformance(data.performance ?? null);
          }

          if (contractorsStatsRes?.success && contractorsStatsRes.data) {
            const data = contractorsStatsRes.data;
            setContractorsTotal(data.totalContractors ?? null);
            setNewContractorsThisMonth(data.thisMonthContractors ?? null);
          }

          if (contractorsRes?.success && (contractorsRes as any).data) {
            const d: any = (contractorsRes as any).data;
            const pagination = d?.pagination;
            // Fallback to pagination total if stats API fails
            if (contractorsTotal === null) {
              setContractorsTotal(
                pagination?.total ?? (Array.isArray(d?.contractors) ? d.contractors.length : null)
              );
            }
          }

          if (recentRes?.success && (recentRes as any).data) {
            const list: any = (recentRes as any).data?.contracts || (recentRes as any).data;
            setRecentContracts(Array.isArray(list) ? list : []);
          }
        }
      } catch (e) {
        console.error('Dashboard data loading error:', e);
        // keep graceful fallbacks
      } finally {
        mounted && setLoading(false);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthGuard>
      <div className="layout-container bg-background text-foreground">
        <Sidebar />
        <div
          className={cn(
            "main-content bg-background text-foreground",
            collapsed && "sidebar-collapsed"
          )}
        >
          <Header />
          <main className="p-6 bg-background text-foreground">
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
                  <div className="text-2xl font-bold">
                    {totalContracts !== null ? totalContracts : "--"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {contractsChangePercent !== null ? (
                      <span className={contractsChangePercent >= 0 ? "text-green-600" : "text-red-600"}>
                        {contractsChangePercent >= 0 ? "+" : ""}{contractsChangePercent}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )} so với tháng trước
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
                  <div className="text-2xl font-bold">
                    {contractorsTotal !== null ? contractorsTotal : "--"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {newContractorsThisMonth !== null ? (
                      <span className="text-green-600">+{newContractorsThisMonth}</span>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )} nhà thầu mới
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
                  <div className="text-2xl font-bold">
                    {totalContractValue !== null
                      ? new Intl.NumberFormat("vi-VN").format(totalContractValue) + " VNĐ"
                      : "--"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {valueChangePercent !== null ? (
                      <span className={valueChangePercent >= 0 ? "text-green-600" : "text-red-600"}>
                        {valueChangePercent >= 0 ? "+" : ""}{valueChangePercent}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )} tăng trưởng
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
                  <div className="text-2xl font-bold">
                    {performance !== null ? `${performance}%` : "--"}
                  </div>
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
                    {recentContracts.map((contract: any) => (
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
                                  : contract.status === "approved"
                                  ? "default"
                                  : contract.status === "rejected"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {contract.status === "completed"
                                ? "Hoàn thành"
                                : contract.status === "active"
                                ? "Đang thực hiện"
                                : contract.status === "approved"
                                ? "Đã phê duyệt"
                                : contract.status === "rejected"
                                ? "Đã từ chối"
                                : "Chờ phê duyệt"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {(contract.contractor_name || "").toString()} • {new Intl.NumberFormat("vi-VN").format(contract.value || 0)} VNĐ
                          </p>
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={Number(contract.progress) || 0}
                              className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground">
                              {Number(contract.progress) || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!loading && recentContracts.length === 0 && (
                      <div className="text-sm text-muted-foreground">Chưa có hợp đồng nào.</div>
                    )}
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
                    {/* Chỉ hiển thị nút Phê duyệt cho admin, manager và approver */}
                    {(user?.role === "admin" ||
                      user?.role === "manager" ||
                      user?.role === "approver") && (
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent hover:bg-muted"
                        onClick={handleApproveContracts}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Phê duyệt hợp đồng
                      </Button>
                    )}
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
                          {expiringCount !== null ? expiringCount : "--"} hợp đồng sắp hết hạn
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
                          {overdueCount !== null ? overdueCount : "--"} thanh toán quá hạn
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
