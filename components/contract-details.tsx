"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  Calendar,
  DollarSign,
  Building2,
  FileText,
  Download,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"

interface ContractDetailsProps {
  contract: any
  onClose: () => void
}

export function ContractDetails({ contract, onClose }: ContractDetailsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Đang thực hiện</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Hoàn thành</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Chờ phê duyệt</Badge>
      case "draft":
        return <Badge variant="outline">Bản nháp</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Mock blockchain transactions
  const blockchainHistory = [
    {
      id: "1",
      action: "Tạo hợp đồng",
      timestamp: "2024-01-15T10:30:00Z",
      user: "Nguyễn Văn A",
      hash: "0x1a2b3c4d5e6f7890abcdef1234567890",
      status: "confirmed",
    },
    {
      id: "2",
      action: "Phê duyệt hợp đồng",
      timestamp: "2024-01-16T14:20:00Z",
      user: "Trần Thị B",
      hash: "0x2b3c4d5e6f7890abcdef1234567890ab",
      status: "confirmed",
    },
    {
      id: "3",
      action: "Cập nhật tiến độ 25%",
      timestamp: "2024-03-01T09:15:00Z",
      user: "Lê Văn C",
      hash: "0x3c4d5e6f7890abcdef1234567890abcd",
      status: "confirmed",
    },
    {
      id: "4",
      action: "Thanh toán đợt 1",
      timestamp: "2024-04-15T16:45:00Z",
      user: "Phạm Thị D",
      hash: "0x4d5e6f7890abcdef1234567890abcdef",
      status: "confirmed",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{contract.title}</h2>
          <p className="text-muted-foreground mt-1">Mã hợp đồng: {contract.id}</p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(contract.status)}
          {contract.blockchainHash && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Shield className="h-3 w-3 mr-1" />
              Blockchain
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="progress">Tiến độ</TabsTrigger>
          <TabsTrigger value="documents">Tài liệu</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Thông tin nhà thầu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{contract.contractor}</p>
                  <p className="text-sm text-muted-foreground">Danh mục: {contract.category}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Giá trị hợp đồng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">{formatCurrency(contract.value)}</p>
                  <p className="text-sm text-muted-foreground">Đã thanh toán: {contract.progress}%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Thời gian thực hiện
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ngày bắt đầu</p>
                  <p className="font-medium">{new Date(contract.startDate).toLocaleDateString("vi-VN")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày kết thúc</p>
                  <p className="font-medium">{new Date(contract.endDate).toLocaleDateString("vi-VN")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Tiến độ thực hiện</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Hoàn thành</span>
                  <span className="text-sm text-muted-foreground">{contract.progress}%</span>
                </div>
                <Progress value={contract.progress} className="w-full" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử tiến độ</CardTitle>
              <CardDescription>Theo dõi các mốc quan trọng của dự án</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { milestone: "Khởi công dự án", date: "15/01/2024", status: "completed" },
                  { milestone: "Hoàn thành móng", date: "28/02/2024", status: "completed" },
                  { milestone: "Xây dựng cột trụ", date: "15/04/2024", status: "completed" },
                  { milestone: "Lắp đặt dầm cầu", date: "30/06/2024", status: "in-progress" },
                  { milestone: "Hoàn thiện mặt cầu", date: "15/09/2024", status: "pending" },
                  { milestone: "Nghiệm thu và bàn giao", date: "31/12/2024", status: "pending" },
                ].map((milestone, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                    {milestone.status === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : milestone.status === "in-progress" ? (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-gray-400" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{milestone.milestone}</p>
                      <p className="text-sm text-muted-foreground">{milestone.date}</p>
                    </div>
                    <Badge
                      variant={
                        milestone.status === "completed"
                          ? "default"
                          : milestone.status === "in-progress"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {milestone.status === "completed"
                        ? "Hoàn thành"
                        : milestone.status === "in-progress"
                          ? "Đang thực hiện"
                          : "Chờ thực hiện"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Tài liệu hợp đồng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Hợp đồng gốc.pdf", size: "2.4 MB", date: "15/01/2024" },
                  { name: "Bản vẽ thiết kế.dwg", size: "15.8 MB", date: "20/01/2024" },
                  { name: "Thuyết minh kỹ thuật.docx", size: "1.2 MB", date: "22/01/2024" },
                  { name: "Dự toán chi tiết.xlsx", size: "856 KB", date: "25/01/2024" },
                ].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.size} • {doc.date}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Tải xuống
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Lịch sử Blockchain
              </CardTitle>
              <CardDescription>Tất cả giao dịch được ghi lại trên Hyperledger Fabric</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {blockchainHistory.map((transaction) => (
                  <div key={transaction.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{transaction.action}</p>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Đã xác nhận
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Bởi: {transaction.user} • {new Date(transaction.timestamp).toLocaleString("vi-VN")}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground">Hash: {transaction.hash}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Info */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Bảo mật Blockchain</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Hợp đồng này được bảo vệ bởi công nghệ blockchain Hyperledger Fabric. Tất cả thay đổi đều được mã
                    hóa và không thể chỉnh sửa.
                  </p>
                  <div className="mt-3 text-xs text-green-600">
                    <p>Network: Hyperledger Fabric v2.4</p>
                    <p>Channel: government-contracts</p>
                    <p>Chaincode: contract-management-v1.0</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Xuất PDF
        </Button>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Chỉnh sửa
        </Button>
        <Button onClick={onClose}>Đóng</Button>
      </div>
    </div>
  )
}
