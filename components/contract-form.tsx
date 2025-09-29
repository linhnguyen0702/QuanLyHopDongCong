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
import { CalendarIcon, Upload, Shield } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ContractFormProps {
  onClose: () => void
  contract?: any
}

export function ContractForm({ onClose, contract }: ContractFormProps) {
  const [formData, setFormData] = useState({
    title: contract?.title || "",
    description: contract?.description || "",
    contractor: contract?.contractor || "",
    category: contract?.category || "",
    value: contract?.value || "",
    startDate: contract?.startDate ? new Date(contract.startDate) : undefined,
    endDate: contract?.endDate ? new Date(contract.endDate) : undefined,
    paymentTerms: contract?.paymentTerms || "",
    specifications: contract?.specifications || "",
    deliverables: contract?.deliverables || "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call and blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("Contract data:", formData)
    setIsSubmitting(false)
    onClose()
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
          <CardDescription>Nhập thông tin chung về hợp đồng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tên dự án *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Nhập tên dự án"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Danh mục *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xay-dung">Xây dựng</SelectItem>
                  <SelectItem value="dien-luc">Điện lực</SelectItem>
                  <SelectItem value="giao-duc">Giáo dục</SelectItem>
                  <SelectItem value="ha-tang">Hạ tầng</SelectItem>
                  <SelectItem value="y-te">Y tế</SelectItem>
                  <SelectItem value="khac">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả dự án</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Mô tả chi tiết về dự án"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractor">Nhà thầu *</Label>
              <Input
                id="contractor"
                value={formData.contractor}
                onChange={(e) => handleInputChange("contractor", e.target.value)}
                placeholder="Tên công ty nhà thầu"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Giá trị hợp đồng (VNĐ) *</Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => handleInputChange("value", e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Thời gian thực hiện</CardTitle>
          <CardDescription>Xác định thời gian bắt đầu và kết thúc dự án</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ngày bắt đầu *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate
                      ? format(formData.startDate, "dd/MM/yyyy", { locale: vi })
                      : "Chọn ngày bắt đầu"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => handleInputChange("startDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Ngày kết thúc *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày kết thúc"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => handleInputChange("endDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Details */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết hợp đồng</CardTitle>
          <CardDescription>Thông tin kỹ thuật và điều khoản thanh toán</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specifications">Yêu cầu kỹ thuật</Label>
            <Textarea
              id="specifications"
              value={formData.specifications}
              onChange={(e) => handleInputChange("specifications", e.target.value)}
              placeholder="Mô tả các yêu cầu kỹ thuật chi tiết"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliverables">Sản phẩm bàn giao</Label>
            <Textarea
              id="deliverables"
              value={formData.deliverables}
              onChange={(e) => handleInputChange("deliverables", e.target.value)}
              placeholder="Danh sách các sản phẩm, tài liệu cần bàn giao"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Điều khoản thanh toán</Label>
            <Textarea
              id="paymentTerms"
              value={formData.paymentTerms}
              onChange={(e) => handleInputChange("paymentTerms", e.target.value)}
              placeholder="Mô tả lịch trình và điều kiện thanh toán"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Tài liệu đính kèm</CardTitle>
          <CardDescription>Upload các tài liệu liên quan đến hợp đồng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">Kéo thả file hoặc click để chọn</p>
            <Button variant="outline" size="sm">
              Chọn file
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blockchain Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Bảo mật Blockchain</h4>
              <p className="text-sm text-blue-700 mt-1">
                Hợp đồng này sẽ được lưu trữ và xác thực trên mạng Hyperledger Fabric. Tất cả thay đổi sẽ được ghi lại
                và không thể chỉnh sửa.
              </p>
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
          {isSubmitting ? "Đang xử lý..." : "Tạo hợp đồng"}
        </Button>
      </div>
    </form>
  )
}
