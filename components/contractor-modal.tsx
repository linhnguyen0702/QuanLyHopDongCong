"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Upload, Plus, X, Building2, Phone } from "lucide-react"

interface ContractorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContractorModal({ open, onOpenChange }: ContractorModalProps) {
  const [certificates, setCertificates] = useState<string[]>([])
  const [specializations, setSpecializations] = useState<string[]>([])
  const [documents, setDocuments] = useState<string[]>([])

  const addCertificate = () => {
    setCertificates([...certificates, `Chứng chỉ ${certificates.length + 1}`])
  }

  const removeCertificate = (index: number) => {
    setCertificates(certificates.filter((_, i) => i !== index))
  }

  const addDocument = () => {
    setDocuments([...documents, `Tài liệu ${documents.length + 1}.pdf`])
  }

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index))
  }

  const toggleSpecialization = (spec: string) => {
    if (specializations.includes(spec)) {
      setSpecializations(specializations.filter((s) => s !== spec))
    } else {
      setSpecializations([...specializations, spec])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Contractor form submitted")
    onOpenChange(false)
    // Reset form
    setCertificates([])
    setSpecializations([])
    setDocuments([])
  }

  const specializationOptions = [
    "Xây dựng dân dụng",
    "Xây dựng công nghiệp",
    "Hạ tầng giao thông",
    "Hệ thống điện",
    "Hệ thống nước",
    "Tư vấn thiết kế",
    "Giám sát thi công",
    "Cung cấp vật tư",
    "Bảo trì sửa chữa",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm nhà thầu mới</DialogTitle>
          <DialogDescription>Đăng ký thông tin nhà thầu vào hệ thống</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-4">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Thông tin cơ bản</span>
                  </CardTitle>
                  <CardDescription>Thông tin chính của nhà thầu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Tên công ty *</Label>
                      <Input id="companyName" placeholder="Tên đầy đủ của công ty" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shortName">Tên viết tắt</Label>
                      <Input id="shortName" placeholder="Tên viết tắt" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="taxCode">Mã số thuế *</Label>
                      <Input id="taxCode" placeholder="0123456789" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessLicense">Số giấy phép kinh doanh</Label>
                      <Input id="businessLicense" placeholder="Số giấy phép" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả về công ty</Label>
                    <Textarea
                      id="description"
                      placeholder="Mô tả ngắn gọn về hoạt động và năng lực của công ty"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="h-5 w-5" />
                    <span>Thông tin liên hệ</span>
                  </CardTitle>
                  <CardDescription>Địa chỉ và thông tin liên lạc</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ trụ sở chính *</Label>
                    <Textarea id="address" placeholder="Địa chỉ đầy đủ" rows={2} required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại *</Label>
                      <Input id="phone" placeholder="0123456789" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" placeholder="contact@company.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" placeholder="https://company.com" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Representative Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin người đại diện</CardTitle>
                  <CardDescription>Thông tin người đại diện pháp luật</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="repName">Họ và tên *</Label>
                      <Input id="repName" placeholder="Nguyễn Văn A" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="repPosition">Chức vụ</Label>
                      <Input id="repPosition" placeholder="Giám đốc" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="repPhone">Số điện thoại</Label>
                      <Input id="repPhone" placeholder="0987654321" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="repEmail">Email</Label>
                      <Input id="repEmail" type="email" placeholder="director@company.com" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specializations */}
              <Card>
                <CardHeader>
                  <CardTitle>Lĩnh vực chuyên môn</CardTitle>
                  <CardDescription>Chọn các lĩnh vực mà công ty có năng lực thực hiện</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {specializationOptions.map((spec) => (
                      <div key={spec} className="flex items-center space-x-2">
                        <Checkbox
                          id={spec}
                          checked={specializations.includes(spec)}
                          onCheckedChange={() => toggleSpecialization(spec)}
                        />
                        <Label htmlFor={spec} className="text-sm font-normal cursor-pointer">
                          {spec}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {specializations.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Đã chọn:</p>
                      <div className="flex flex-wrap gap-2">
                        {specializations.map((spec) => (
                          <Badge key={spec} variant="secondary">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Information */}
            <div className="space-y-4">
              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin tài chính</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="registeredCapital">Vốn điều lệ (VNĐ)</Label>
                    <Input id="registeredCapital" type="number" placeholder="0" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">Số tài khoản ngân hàng</Label>
                    <Input id="bankAccount" placeholder="1234567890" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankName">Tên ngân hàng</Label>
                    <Input id="bankName" placeholder="Ngân hàng ABC" />
                  </div>
                </CardContent>
              </Card>

              {/* Certificates */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Chứng chỉ năng lực</CardTitle>
                    <Button type="button" onClick={addCertificate} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {certificates.map((cert, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{cert}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeCertificate(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {certificates.length === 0 && (
                      <p className="text-sm text-muted-foreground">Chưa có chứng chỉ nào</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Tài liệu đính kèm</CardTitle>
                    <Button type="button" onClick={addDocument} size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Thêm
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{doc}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeDocument(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {documents.length === 0 && <p className="text-sm text-muted-foreground">Chưa có tài liệu nào</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                <Button type="submit" className="w-full">
                  Thêm nhà thầu
                </Button>
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Lưu nháp
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
                  Hủy bỏ
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
