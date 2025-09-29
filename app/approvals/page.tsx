"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
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
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export default function ApprovalsPage() {
  const [selectedTab, setSelectedTab] = useState("pending")
  const [selectedContract, setSelectedContract] = useState<any>(null)

  // Sample data for pending approvals
  const pendingApprovals = [
    {
      id: "HĐ-2024-001",
      title: "Xây dựng cầu Nhật Tân 2",
      contractor: "Công ty TNHH ABC",
      value: "450M VNĐ",
      submittedDate: new Date("2024-01-15"),
      priority: "high",
      currentStep: 2,
      totalSteps: 4,
      approvers: [
        { name: "Nguyễn Văn A", role: "Trưởng phòng", status: "approved", date: "2024-01-16" },
        { name: "Trần Thị B", role: "Phó giám đốc", status: "pending", date: null },
        { name: "Lê Văn C", role: "Giám đốc", status: "waiting", date: null },
        { name: "Phạm Thị D", role: "Hội đồng", status: "waiting", date: null },
      ],
      documents: ["Hồ sơ đấu thầu.pdf", "Báo giá chi tiết.xlsx", "Chứng chỉ năng lực.pdf"],
      description: "Dự án xây dựng cầu Nhật Tân 2 với tổng chiều dài 1.2km, kết nối hai bờ sông Hồng.",
    },
    {
      id: "HĐ-2024-002",
      title: "Nâng cấp hệ thống điện",
      contractor: "Tập đoàn Điện lực XYZ",
      value: "280M VNĐ",
      submittedDate: new Date("2024-01-18"),
      priority: "medium",
      currentStep: 1,
      totalSteps: 3,
      approvers: [
        { name: "Hoàng Văn E", role: "Trưởng phòng", status: "pending", date: null },
        { name: "Ngô Thị F", role: "Phó giám đốc", status: "waiting", date: null },
        { name: "Vũ Văn G", role: "Giám đốc", status: "waiting", date: null },
      ],
      documents: ["Thiết kế kỹ thuật.pdf", "Dự toán chi phí.xlsx"],
      description: "Nâng cấp hệ thống điện cho khu công nghiệp, công suất 50MW.",
    },
    {
      id: "HĐ-2024-003",
      title: "Xây dựng trường học",
      contractor: "Công ty Xây dựng DEF",
      value: "320M VNĐ",
      submittedDate: new Date("2024-01-20"),
      priority: "urgent",
      currentStep: 3,
      totalSteps: 4,
      approvers: [
        { name: "Đỗ Văn H", role: "Trưởng phòng", status: "approved", date: "2024-01-21" },
        { name: "Bùi Thị I", role: "Phó giám đốc", status: "approved", date: "2024-01-22" },
        { name: "Lý Văn J", role: "Giám đốc", status: "pending", date: null },
        { name: "Hội đồng QT", role: "Hội đồng", status: "waiting", date: null },
      ],
      documents: ["Bản vẽ thiết kế.pdf", "Thuyết minh dự án.docx", "Phân tích tài chính.xlsx"],
      description: "Xây dựng trường tiểu học 24 phòng học, phục vụ 960 học sinh.",
    },
  ]

  const approvedContracts = [
    {
      id: "HĐ-2023-045",
      title: "Sửa chữa đường Láng",
      contractor: "Công ty Giao thông ABC",
      value: "180M VNĐ",
      approvedDate: new Date("2024-01-10"),
      finalApprover: "Lê Văn C",
      blockchainHash: "0x1a2b3c4d5e6f7890abcdef1234567890",
    },
    {
      id: "HĐ-2023-046",
      title: "Cung cấp thiết bị y tế",
      contractor: "Công ty Y tế XYZ",
      value: "95M VNĐ",
      approvedDate: new Date("2024-01-12"),
      finalApprover: "Phạm Thị D",
      blockchainHash: "0x9876543210fedcba0987654321abcdef",
    },
  ]

  const rejectedContracts = [
    {
      id: "HĐ-2024-004",
      title: "Mua sắm máy tính",
      contractor: "Công ty Công nghệ GHI",
      value: "45M VNĐ",
      rejectedDate: new Date("2024-01-14"),
      rejectedBy: "Trần Thị B",
      reason: "Giá cả không cạnh tranh, cần đàm phán lại",
    },
  ]

  const handleApprove = (contractId: string, comment: string) => {
    console.log(`Approved contract ${contractId} with comment: ${comment}`)
    // Handle approval logic
  }

  const handleReject = (contractId: string, reason: string) => {
    console.log(`Rejected contract ${contractId} with reason: ${reason}`)
    // Handle rejection logic
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive"
      case "high":
        return "default"
      case "medium":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Khẩn cấp"
      case "high":
        return "Cao"
      case "medium":
        return "Trung bình"
      default:
        return "Thấp"
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Phê duyệt hợp đồng</h1>
              <p className="text-muted-foreground mt-2">Quản lý quy trình phê duyệt hợp đồng đa cấp</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                <Clock className="h-4 w-4 mr-2" />
                {pendingApprovals.length} chờ phê duyệt
              </Badge>
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Chờ phê duyệt ({pendingApprovals.length})</span>
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Đã phê duyệt ({approvedContracts.length})</span>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center space-x-2">
                <XCircle className="h-4 w-4" />
                <span>Đã từ chối ({rejectedContracts.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* Pending Approvals */}
            <TabsContent value="pending" className="space-y-6">
              <div className="grid gap-6">
                {pendingApprovals.map((contract) => (
                  <Card key={contract.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <CardTitle className="text-lg">{contract.title}</CardTitle>
                            <Badge variant={getPriorityColor(contract.priority)}>
                              {getPriorityText(contract.priority)}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <FileText className="h-4 w-4" />
                              <span>{contract.id}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Building2 className="h-4 w-4" />
                              <span>{contract.contractor}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{contract.value}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{format(contract.submittedDate, "dd/MM/yyyy", { locale: vi })}</span>
                            </span>
                          </CardDescription>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedContract(contract)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{contract.title}</DialogTitle>
                              <DialogDescription>Chi tiết hợp đồng và quy trình phê duyệt</DialogDescription>
                            </DialogHeader>
                            {selectedContract && (
                              <div className="space-y-6">
                                {/* Contract Info */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Mã hợp đồng</Label>
                                    <p className="text-sm text-muted-foreground">{selectedContract.id}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Nhà thầu</Label>
                                    <p className="text-sm text-muted-foreground">{selectedContract.contractor}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Giá trị</Label>
                                    <p className="text-sm text-muted-foreground">{selectedContract.value}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Mức độ ưu tiên</Label>
                                    <Badge variant={getPriorityColor(selectedContract.priority)} className="mt-1">
                                      {getPriorityText(selectedContract.priority)}
                                    </Badge>
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium">Mô tả dự án</Label>
                                  <p className="text-sm text-muted-foreground mt-1">{selectedContract.description}</p>
                                </div>

                                {/* Approval Progress */}
                                <div>
                                  <Label className="text-sm font-medium mb-3 block">
                                    Tiến trình phê duyệt ({selectedContract.currentStep}/{selectedContract.totalSteps})
                                  </Label>
                                  <Progress
                                    value={(selectedContract.currentStep / selectedContract.totalSteps) * 100}
                                    className="mb-4"
                                  />
                                  <div className="space-y-3">
                                    {selectedContract.approvers.map((approver: any, index: number) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                      >
                                        <div className="flex items-center space-x-3">
                                          <Avatar className="h-8 w-8">
                                            <AvatarFallback>{approver.name.charAt(0)}</AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <p className="text-sm font-medium">{approver.name}</p>
                                            <p className="text-xs text-muted-foreground">{approver.role}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          {approver.status === "approved" && (
                                            <>
                                              <Badge variant="default" className="bg-green-100 text-green-800">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Đã phê duyệt
                                              </Badge>
                                              <span className="text-xs text-muted-foreground">{approver.date}</span>
                                            </>
                                          )}
                                          {approver.status === "pending" && (
                                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
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
                                    ))}
                                  </div>
                                </div>

                                {/* Documents */}
                                <div>
                                  <Label className="text-sm font-medium mb-3 block">Tài liệu đính kèm</Label>
                                  <div className="space-y-2">
                                    {selectedContract.documents.map((doc: string, index: number) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between p-2 bg-muted rounded"
                                      >
                                        <span className="text-sm">{doc}</span>
                                        <Button variant="ghost" size="sm">
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
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
                                        <DialogTitle>Từ chối hợp đồng</DialogTitle>
                                        <DialogDescription>Vui lòng nhập lý do từ chối</DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <Textarea placeholder="Nhập lý do từ chối..." rows={4} />
                                        <div className="flex justify-end space-x-2">
                                          <Button variant="outline">Hủy</Button>
                                          <Button
                                            variant="destructive"
                                            onClick={() => handleReject(selectedContract.id, "Lý do từ chối")}
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
                                        <DialogTitle>Phê duyệt hợp đồng</DialogTitle>
                                        <DialogDescription>Xác nhận phê duyệt hợp đồng này</DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <Textarea placeholder="Nhập nhận xét (tùy chọn)..." rows={3} />
                                        <div className="flex justify-end space-x-2">
                                          <Button variant="outline">Hủy</Button>
                                          <Button
                                            onClick={() => handleApprove(selectedContract.id, "Nhận xét phê duyệt")}
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
                        <p className="text-sm text-muted-foreground">{contract.description}</p>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              Tiến trình phê duyệt ({contract.currentStep}/{contract.totalSteps})
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round((contract.currentStep / contract.totalSteps) * 100)}%
                            </span>
                          </div>
                          <Progress value={(contract.currentStep / contract.totalSteps) * 100} />
                        </div>

                        {/* Current Approver */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Đang chờ:</span>
                            <span className="text-sm font-medium">
                              {contract.approvers.find((a: any) => a.status === "pending")?.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {contract.approvers.find((a: any) => a.status === "pending")?.role}
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
                ))}
              </div>
            </TabsContent>

            {/* Approved Contracts */}
            <TabsContent value="approved" className="space-y-6">
              <div className="grid gap-6">
                {approvedContracts.map((contract) => (
                  <Card key={contract.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <CardTitle className="text-lg">{contract.title}</CardTitle>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Đã phê duyệt
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <FileText className="h-4 w-4" />
                              <span>{contract.id}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Building2 className="h-4 w-4" />
                              <span>{contract.contractor}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{contract.value}</span>
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Ngày phê duyệt:</span>
                          <span className="text-sm font-medium">
                            {format(contract.approvedDate, "dd/MM/yyyy", { locale: vi })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Người phê duyệt cuối:</span>
                          <span className="text-sm font-medium">{contract.finalApprover}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Blockchain Hash:</span>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {contract.blockchainHash.substring(0, 20)}...
                            </code>
                            <Badge variant="outline" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Đã xác thực
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Rejected Contracts */}
            <TabsContent value="rejected" className="space-y-6">
              <div className="grid gap-6">
                {rejectedContracts.map((contract) => (
                  <Card key={contract.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <CardTitle className="text-lg">{contract.title}</CardTitle>
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Đã từ chối
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <FileText className="h-4 w-4" />
                              <span>{contract.id}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Building2 className="h-4 w-4" />
                              <span>{contract.contractor}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{contract.value}</span>
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Ngày từ chối:</span>
                          <span className="text-sm font-medium">
                            {format(contract.rejectedDate, "dd/MM/yyyy", { locale: vi })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Người từ chối:</span>
                          <span className="text-sm font-medium">{contract.rejectedBy}</span>
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">Lý do từ chối:</span>
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">{contract.reason}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
