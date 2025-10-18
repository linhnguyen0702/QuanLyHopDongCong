"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Upload, X } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { contractorsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface ContractorFormProps {
  onClose: () => void
  contractor?: any
}

export function ContractorForm({ onClose, contractor }: ContractorFormProps) {
  const [formData, setFormData] = useState({
    name: contractor?.name || "",
    shortName: contractor?.shortName || "",
    taxCode: contractor?.taxCode || "",
    address: contractor?.address || "",
    phone: contractor?.phone || "",
    email: contractor?.email || "",
    website: contractor?.website || "",
    representative: contractor?.representative || "",
    representativePosition: contractor?.representativePosition || "",
    establishedDate: contractor?.establishedDate ? new Date(contractor.establishedDate) : undefined,
    registrationNumber: contractor?.registrationNumber || "",
    category: contractor?.category || "",
    specialization: contractor?.specialization || [],
    bankAccount: contractor?.bankAccount || "",
    bankName: contractor?.bankName || "",
    description: contractor?.description || "",
  })

  const [newSpecialization, setNewSpecialization] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const payload = {
        name: formData.name.trim(),
        contactPerson: formData.representative.trim() || formData.shortName || formData.name,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address?.trim() || "",
        taxCode: formData.taxCode?.trim() || "",
        bankAccount: formData.bankAccount?.trim() || "",
        bankName: formData.bankName?.trim() || "",
        description: formData.description?.trim() || "",
      }

      const res = await contractorsApi.create(payload)

      if (res?.success) {
        toast({
          title: "Thành công",
          description: "Đã thêm nhà thầu mới",
        })
        onClose()
      } else {
        const message = (res as any)?.message || "Không thể tạo nhà thầu"
        toast({
          title: "Lỗi",
          description: message,
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tạo nhà thầu",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specialization.includes(newSpecialization.trim())) {
      setFormData((prev) => ({
        ...prev,
        specialization: [...prev.specialization, newSpecialization.trim()],
      }))
      setNewSpecialization("")
    }
  }

  const removeSpecialization = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specialization: prev.specialization.filter((s) => s !== spec),
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
          <CardDescription>Thông tin chung về nhà thầu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên đầy đủ *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Tên đầy đủ công ty"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortName">Tên viết tắt *</Label>
              <Input
                id="shortName"
                value={formData.shortName}
                onChange={(e) => handleInputChange("shortName", e.target.value)}
                placeholder="Tên viết tắt"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxCode">Mã số thuế *</Label>
              <Input
                id="taxCode"
                value={formData.taxCode}
                onChange={(e) => handleInputChange("taxCode", e.target.value)}
                placeholder="0123456789"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Số đăng ký kinh doanh</Label>
              <Input
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                placeholder="Số đăng ký kinh doanh"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Địa chỉ đầy đủ"
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="establishedDate">Ngày thành lập</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.establishedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.establishedDate
                      ? format(formData.establishedDate, "dd/MM/yyyy", { locale: vi })
                      : "Chọn ngày thành lập"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.establishedDate}
                    onSelect={(date) => handleInputChange("establishedDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Danh mục *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="Xây dựng">Xây dựng</SelectItem>
                  <SelectItem value="Điện lực">Điện lực</SelectItem>
                  <SelectItem value="Giáo dục">Giáo dục</SelectItem>
                  <SelectItem value="Hạ tầng">Hạ tầng</SelectItem>
                  <SelectItem value="Y tế">Y tế</SelectItem>
                  <SelectItem value="Công nghệ">Công nghệ</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin liên hệ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="024-xxxx-xxxx"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="contact@company.vn"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              placeholder="www.company.vn"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="representative">Người đại diện *</Label>
              <Input
                id="representative"
                value={formData.representative}
                onChange={(e) => handleInputChange("representative", e.target.value)}
                placeholder="Họ và tên người đại diện"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="representativePosition">Chức vụ</Label>
              <Input
                id="representativePosition"
                value={formData.representativePosition}
                onChange={(e) => handleInputChange("representativePosition", e.target.value)}
                placeholder="Giám đốc, Tổng giám đốc..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specialization */}
      <Card>
        <CardHeader>
          <CardTitle>Lĩnh vực chuyên môn</CardTitle>
          <CardDescription>Các lĩnh vực mà nhà thầu có kinh nghiệm</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newSpecialization}
              onChange={(e) => setNewSpecialization(e.target.value)}
              placeholder="Nhập lĩnh vực chuyên môn"
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialization())}
            />
            <Button type="button" onClick={addSpecialization}>
              Thêm
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.specialization.map((spec, index) => (
              <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                <span>{spec}</span>
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeSpecialization(spec)} />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Banking Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin ngân hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Tên ngân hàng</Label>
            <Input
              id="bankName"
              value={formData.bankName}
              onChange={(e) => handleInputChange("bankName", e.target.value)}
              placeholder="Tên ngân hàng"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankAccount">Số tài khoản</Label>
            <Input
              id="bankAccount"
              value={formData.bankAccount}
              onChange={(e) => handleInputChange("bankAccount", e.target.value)}
              placeholder="Số tài khoản ngân hàng"
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin bổ sung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Mô tả về công ty, kinh nghiệm, năng lực..."
              rows={4}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Tài liệu đính kèm</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Tải lên giấy phép kinh doanh, chứng chỉ năng lực...</p>
              <Button variant="outline" size="sm" type="button">
                Chọn file
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="button" variant="outline">
          Lưu nháp
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-secondary hover:bg-secondary/90">
          {isSubmitting ? "Đang xử lý..." : contractor ? "Cập nhật" : "Thêm nhà thầu"}
        </Button>
      </div>
    </form>
  )
}
