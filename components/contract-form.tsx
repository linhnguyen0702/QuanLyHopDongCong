"use client"

import type React from "react"

import { useEffect, useState } from "react"
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
import { contractsApi, contractorsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface ContractFormProps {
  onClose: () => void
  contract?: any
  onSuccess?: (createdOrUpdated?: any) => void
}

export function ContractForm({ onClose, contract, onSuccess }: ContractFormProps) {
  const [formData, setFormData] = useState({
    contractNumber: contract?.contract_number || "",
    title: contract?.title || "",
    description: contract?.description || "",
    contractorId: contract?.contractor_id as number | undefined,
    category: contract?.category || "",
    value: contract?.value ? String(contract.value) : "",
    startDate: contract?.start_date ? new Date(contract.start_date) : undefined,
    endDate: contract?.end_date ? new Date(contract.end_date) : undefined,
    paymentTerms: contract?.paymentTerms || "",
    specifications: contract?.specifications || "",
    deliverables: contract?.deliverables || "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contractors, setContractors] = useState<Array<{ id: number; name: string }>>([])
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const res = await contractorsApi.getAll({ page: 1, limit: 100, status: "" as any })
      if (mounted && res?.success) {
        const data: any = (res as any).data
        const list = data?.contractors || data || []
        setContractors(list.map((c: any) => ({ id: c.id, name: c.name })))
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    if (!formData.contractNumber || !formData.title || !formData.contractorId || !formData.startDate || !formData.endDate) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng nhập đủ mã HĐ, tên, nhà thầu và ngày bắt đầu/kết thúc" })
      return
    }
    setIsSubmitting(true)
    try {
      if (contract?.id) {
        const payload = {
          title: formData.title.trim(),
          description: formData.description?.trim() || undefined,
          contractorId: Number(formData.contractorId),
          value: Number(formData.value) || 0,
          startDate: formData.startDate.toISOString().slice(0, 10),
          endDate: formData.endDate.toISOString().slice(0, 10),
        }
        const res = await contractsApi.update(contract.id, payload)
        if (res?.success) {
          toast({ title: "Đã cập nhật", description: "Cập nhật hợp đồng thành công" })
          onSuccess?.(res?.data)
          onClose()
        } else {
          toast({ title: "Lỗi", description: (res as any)?.message || "Không thể cập nhật hợp đồng" })
        }
      } else {
        const payload = {
          contractNumber: formData.contractNumber.trim(),
          title: formData.title.trim(),
          description: formData.description?.trim() || undefined,
          contractorId: Number(formData.contractorId),
          value: Number(formData.value) || 0,
          startDate: formData.startDate.toISOString().slice(0, 10),
          endDate: formData.endDate.toISOString().slice(0, 10),
        }
        const res = await contractsApi.create(payload)
        if (res?.success) {
          toast({ title: "Thành công", description: "Đã tạo hợp đồng" })
          onSuccess?.(res?.data)
          onClose()
        } else {
          toast({ title: "Lỗi", description: (res as any)?.message || "Không thể tạo hợp đồng" })
        }
      }
    } catch (err) {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra khi tạo hợp đồng" })
    } finally {
      setIsSubmitting(false)
    }
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
              <Label htmlFor="contractNumber">Mã hợp đồng *</Label>
              <Input
                id="contractNumber"
                value={formData.contractNumber}
                onChange={(e) => handleInputChange("contractNumber", e.target.value)}
                placeholder="HĐ-2025-XXX"
                required
                disabled={!!contract?.id}
              />
            </div>
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
              <Select
                value={formData.contractorId ? String(formData.contractorId) : undefined}
                onValueChange={(v) => handleInputChange("contractorId", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhà thầu" />
                </SelectTrigger>
                <SelectContent>
                  {contractors.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        <Button type="submit" disabled={isSubmitting} className="bg-[#7C3AED] hover:bg-[#7C3AED]/90">
          {isSubmitting ? "Đang xử lý..." : "Tạo hợp đồng"}
        </Button>
      </div>
    </form>
  )
}
