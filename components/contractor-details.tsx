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
  Upload,
  X,
} from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface ContractorDetailsProps {
  contractor: any
  onClose: () => void
  onEdit?: () => void
}

export function ContractorDetails({ contractor, onClose, onEdit }: ContractorDetailsProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

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

  // Export contractor profile function
  const exportContractorProfile = async () => {
    try {
      const profileData = {
        'Tên nhà thầu': contractor.name,
        'Tên viết tắt': contractor.short_name || '',
        'Mã số thuế': contractor.tax_code || '',
        'Số đăng ký kinh doanh': contractor.business_registration_number || '',
        'Email': contractor.email,
        'Số điện thoại': contractor.phone,
        'Địa chỉ': contractor.address || '',
        'Website': contractor.website || '',
        'Danh mục': contractor.category || '',
        'Người đại diện': contractor.representative_name || contractor.contact_person || '',
        'Chức vụ': contractor.representative_position || '',
        'Lĩnh vực chuyên môn': contractor.expertise_field || '',
        'Ngày thành lập': contractor.establishment_date ? new Date(contractor.establishment_date).toLocaleDateString('vi-VN') : '',
        'Trạng thái': contractor.status || 'active',
        'Tổng hợp đồng': contractor.stats?.total_contracts || 0,
        'Hợp đồng đang thực hiện': contractor.stats?.active_contracts || 0,
        'Hợp đồng hoàn thành': contractor.stats?.completed_contracts || 0,
        'Tổng giá trị': contractor.stats?.total_value || 0,
        'Ngày tạo': contractor.created_at ? new Date(contractor.created_at).toLocaleDateString('vi-VN') : ''
      };

      // Create CSV content
      const headers = Object.keys(profileData);
      const csvContent = [
        headers.join(','),
        headers.map(header => `"${(profileData as any)[header] || ''}"`).join(',')
      ].join('\n');

      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `ho_so_nha_thau_${contractor.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export profile error:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files])
      toast({
        title: "Thành công",
        description: `Đã chọn ${files.length} file(s)`,
      })
    }
  }

  // Remove file from upload list
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Upload documents to contractor
  const uploadDocuments = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một file để tải lên",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      uploadedFiles.forEach(file => {
        formData.append('files', file)
      })

      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:5000/api/contractors/${contractor.id}/documents`, {
        method: 'POST',
        body: formData,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Thành công",
          description: "Đã tải lên tài liệu thành công",
        })
        setUploadedFiles([])
        // Refresh contractor data or trigger parent refresh
        window.dispatchEvent(new CustomEvent('contractorUpdated'))
      } else {
        toast({
          title: "Lỗi",
          description: result.message || "Không thể tải lên tài liệu",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tải lên tài liệu",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

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
            {getRatingStars(contractor.rating || 0)}
            <span className="text-sm ml-1">{contractor.rating || "—"}</span>
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
                  <p className="text-sm text-muted-foreground">Tên viết tắt</p>
                  <p className="font-medium">{contractor.short_name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mã số thuế</p>
                  <p className="font-medium">{contractor.tax_code || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số đăng ký kinh doanh</p>
                  <p className="font-medium">{contractor.business_registration_number || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày thành lập</p>
                  <p className="font-medium">
                    {contractor.establishment_date 
                      ? new Date(contractor.establishment_date).toLocaleDateString("vi-VN")
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Danh mục</p>
                  <Badge variant="outline">{contractor.category || "Khác"}</Badge>
                </div>
                {contractor.website && (
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <a 
                      href={contractor.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {contractor.website}
                    </a>
                  </div>
                )}
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
                <div className="flex items-start space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="break-all text-sm">{contractor.email}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{contractor.address || "—"}</span>
                </div>
                {contractor.website && (
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <a 
                      href={contractor.website.startsWith('http') ? contractor.website : `https://${contractor.website}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {contractor.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Representative */}
          <Card>
            <CardHeader>
              <CardTitle>Người đại diện pháp luật</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <span className="font-medium">
                    {(contractor.representative_name || contractor.contact_person || "N")[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{contractor.representative_name || contractor.contact_person || "—"}</p>
                  <p className="text-sm text-muted-foreground">{contractor.representative_position || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specialization */}
          {contractor.expertise_field && (
            <Card>
              <CardHeader>
                <CardTitle>Lĩnh vực chuyên môn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {contractor.expertise_field.split(", ").map((spec: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử hợp đồng</CardTitle>
              <CardDescription>Danh sách các hợp đồng đã và đang thực hiện</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contractor.contracts && contractor.contracts.length > 0 ? (
                  contractor.contracts.map((contract: any) => (
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
                          {contract.contract_number} • {formatCurrency(contract.value)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {contract.start_date ? new Date(contract.start_date).toLocaleDateString("vi-VN") : "—"} -{" "}
                          {contract.end_date ? new Date(contract.end_date).toLocaleDateString("vi-VN") : "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{contract.progress || 0}%</p>
                        <p className="text-xs text-muted-foreground">Tiến độ</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có hợp đồng nào</p>
                    <p className="text-sm">Nhà thầu này chưa có hợp đồng được ghi nhận</p>
                  </div>
                )}
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
                <div className="text-2xl font-bold">{contractor.stats?.total_contracts || 0}</div>
                <p className="text-xs text-muted-foreground">Hợp đồng đã ký</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng giá trị</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(contractor.stats?.total_value || 0)}</div>
                <p className="text-xs text-muted-foreground">Tổng giá trị hợp đồng</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{contractor.stats?.completed_contracts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {contractor.stats?.total_contracts > 0 
                    ? Math.round(((contractor.stats?.completed_contracts || 0) / contractor.stats?.total_contracts) * 100)
                    : 0}% tỷ lệ hoàn thành
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đang thực hiện</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{contractor.stats?.active_contracts || 0}</div>
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
              {/* Upload Section */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3">Tải lên tài liệu mới</h4>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Kéo thả file vào đây hoặc click để chọn</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => document.getElementById('contractor-file-upload')?.click()}
                  >
                    Chọn file
                  </Button>
                  <input
                    id="contractor-file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                
                {/* Display selected files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Files đã chọn:</p>
                    <div className="space-y-1">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={uploadDocuments} 
                      disabled={isUploading}
                      className="w-full"
                    >
                      {isUploading ? "Đang tải lên..." : "Tải lên tài liệu"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Existing Documents */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Tài liệu hiện có</h4>
                {contractor.attachments && contractor.attachments.length > 0 ? (
                  contractor.attachments.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(doc.size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.lastModified).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Tải xuống
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có tài liệu nào</p>
                    <p className="text-sm">Tải lên tài liệu để quản lý hồ sơ nhà thầu</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={exportContractorProfile}>
          <Download className="h-4 w-4 mr-2" />
          Xuất hồ sơ
        </Button>
        {onEdit && (
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        )}
        <Button onClick={onClose}>Đóng</Button>
      </div>
    </div>
  )
}
