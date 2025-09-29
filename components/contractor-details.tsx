"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Star,
  FileText,
  Download,
  Edit,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react"

interface ContractorDetailsProps {
  contractor: any
  onClose: () => void
}

export function ContractorDetails({ contractor, onClose }: ContractorDetailsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Hoạt động</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Chờ duyệt</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Tạm dừng</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Mock contract history
  const contractHistory = [
    {
      id: "HĐ-2024-001",
      title: "Xây dựng cầu Nhật Tân 2",
      value: 450000000,
      startDate: "2024-01-15",
      endDate: "2024-12-31",
      status: "active",
      progress: 75,
    },
    {
      id: "HĐ-2023-015",
      title: "Nâng cấp đường Láng",
      value: 280000000,
      startDate: "2023-06-01",
      endDate: "2023-12-30",
      status: "completed",
      progress: 100,
    },
    {
      id: "HĐ-2023-008",
      title: "Xây dựng trường mầm non",
      value: 150000000,
      startDate: "2023-03-01",
      endDate: "2023-08-31",
      status: "completed",
      progress: 100,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{contractor.name}</h2>
          <p className="text-muted-foreground mt-1">Mã nhà thầu: {contractor.id}</p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(contractor.status)}
          <div className="flex items-center space-x-1">
            {getRatingStars(contractor.rating)}
            <span className="text-sm ml-1">{contractor.rating}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="contracts">Hợp đồng</TabsTrigger>
          <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
          <TabsTrigger value="documents">Tài liệu</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Thông tin công ty
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Mã số thuế</p>
                  <p className="font-medium">{contractor.taxCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số đăng ký kinh doanh</p>
                  <p className="font-medium">{contractor.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày thành lập</p>
                  <p className="font-medium">{new Date(contractor.establishedDate).toLocaleDateString("vi-VN")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Danh mục</p>
                  <Badge variant="outline">{contractor.category}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Thông tin liên hệ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{contractor.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{contractor.email}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{contractor.address}</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a href={`https://${contractor.website}`} className="text-blue-600 hover:underline">
                    {contractor.website}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Representative */}
          <Card>
            <CardHeader>
              <CardTitle>Người đại diện</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <span className="font-medium">{contractor.representative.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium">{contractor.representative}</p>
                  <p className="text-sm text-muted-foreground">{contractor.representativePosition}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specialization */}
          <Card>
            <CardHeader>
              <CardTitle>Lĩnh vực chuyên môn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {contractor.specialization.map((spec: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {spec}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Chứng chỉ và giấy phép</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {contractor.certifications.map((cert: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử hợp đồng</CardTitle>
              <CardDescription>Danh sách các hợp đồng đã và đang thực hiện</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contractHistory.map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{contract.title}</h4>
                        <Badge
                          variant={contract.status === "completed" ? "default" : "secondary"}
                          className={
                            contract.status === "completed"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          }
                        >
                          {contract.status === "completed" ? "Hoàn thành" : "Đang thực hiện"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {contract.id} • {formatCurrency(contract.value)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(contract.startDate).toLocaleDateString("vi-VN")} -{" "}
                        {new Date(contract.endDate).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{contract.progress}%</p>
                      <p className="text-xs text-muted-foreground">Tiến độ</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng hợp đồng</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contractor.totalContracts}</div>
                <p className="text-xs text-muted-foreground">Hợp đồng đã ký</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng giá trị</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(contractor.totalValue)}</div>
                <p className="text-xs text-muted-foreground">Tổng giá trị hợp đồng</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{contractor.completedContracts}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((contractor.completedContracts / contractor.totalContracts) * 100)}% tỷ lệ hoàn thành
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đang thực hiện</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{contractor.ongoingContracts}</div>
                <p className="text-xs text-muted-foreground">Hợp đồng đang thực hiện</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ hiệu suất</CardTitle>
              <CardDescription>Theo dõi hiệu suất qua các năm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">Biểu đồ hiệu suất sẽ được hiển thị ở đây</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Tài liệu nhà thầu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Giấy phép kinh doanh.pdf", size: "1.2 MB", date: "15/05/2010" },
                  { name: "Chứng chỉ ISO 9001.pdf", size: "856 KB", date: "20/03/2020" },
                  { name: "Hồ sơ năng lực.pdf", size: "3.4 MB", date: "10/01/2024" },
                  { name: "Báo cáo tài chính 2023.pdf", size: "2.1 MB", date: "31/12/2023" },
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
      </Tabs>

      <Separator />

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Xuất hồ sơ
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
