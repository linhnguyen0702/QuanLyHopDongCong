"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload, Plus, X } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ContractModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContractModal({ open, onOpenChange }: ContractModalProps) {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [attachments, setAttachments] = useState<string[]>([])
  const [milestones, setMilestones] = useState([{ name: "", description: "", deadline: "", value: "" }])

  const addMilestone = () => {
    setMilestones([...milestones, { name: "", description: "", deadline: "", value: "" }])
  }

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const addAttachment = () => {
    setAttachments([...attachments, `Tài liệu ${attachments.length + 1}.pdf`])
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Contract form submitted")
    onOpenChange(false)
    // Reset form
    setStartDate(undefined)
    setEndDate(undefined)
    setAttachments([])
    setMilestones([{ name: "", description: "", deadline: "", value: "" }])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo hợp đồng mới</DialogTitle>
          <DialogDescription>Nhập thông tin chi tiết cho hợp đồng dự án</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                  <CardDescription>Thông tin chính của hợp đồng</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contractId">Mã hợp đồng *</Label>
                      <Input id="contractId" placeholder="HĐ-2024-XXX" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contractType">Loại hợp đồng *</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại hợp đồng" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="construction">Xây dựng</SelectItem>
                          <SelectItem value="supply">Cung cấp vật tư</SelectItem>
                          <SelectItem value="service">Dịch vụ</SelectItem>
                          <SelectItem value="consulting">Tư vấn</SelectItem>
                          <SelectItem value="maintenance">Bảo trì</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Tên hợp đồng *</Label>
                    <Input id="title" placeholder="Nhập tên hợp đồng" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả chi tiết</Label>
                    <Textarea id="description" placeholder="Mô tả chi tiết về nội dung hợp đồng" rows={3} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ngày bắt đầu *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !startDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
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
                              !endDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin tài chính</CardTitle>
                  <CardDescription>Giá trị và điều khoản thanh toán</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalValue">Giá trị hợp đồng (VNĐ) *</Label>
                      <Input id="totalValue" type="number" placeholder="0" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Đơn vị tiền tệ</Label>
                      <Select defaultValue="vnd">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vnd">VNĐ</SelectItem>
                          <SelectItem value="usd">USD</SelectItem>
                          <SelectItem value="eur">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="advancePayment">Tạm ứng (%)</Label>
                      <Input id="advancePayment" type="number" placeholder="0" min="0" max="100" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retentionRate">Tỷ lệ bảo lưu (%)</Label>
                      <Input id="retentionRate" type="number" placeholder="5" min="0" max="20" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Milestones */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Các mốc thực hiện</CardTitle>
                      <CardDescription>Định nghĩa các giai đoạn và mốc quan trọng</CardDescription>
                    </div>
                    <Button type="button" onClick={addMilestone} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm mốc
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="p-3 border border-border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Mốc {index + 1}</h4>
                        {milestones.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeMilestone(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Tên mốc thực hiện"
                          value={milestone.name}
                          onChange={(e) => {
                            const newMilestones = [...milestones]
                            newMilestones[index].name = e.target.value
                            setMilestones(newMilestones)
                          }}
                        />
                        <Input
                          placeholder="Hạn hoàn thành"
                          type="date"
                          value={milestone.deadline}
                          onChange={(e) => {
                            const newMilestones = [...milestones]
                            newMilestones[index].deadline = e.target.value
                            setMilestones(newMilestones)
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Information */}
            <div className="space-y-4">
              {/* Contractor Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin nhà thầu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contractor">Nhà thầu *</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nhà thầu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="abc">Công ty TNHH ABC</SelectItem>
                        <SelectItem value="xyz">Tập đoàn XYZ</SelectItem>
                        <SelectItem value="def">Công ty Xây dựng DEF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Người liên hệ</Label>
                    <Input id="contactPerson" placeholder="Tên người liên hệ" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Số điện thoại</Label>
                    <Input id="contactPhone" placeholder="0123456789" />
                  </div>
                </CardContent>
              </Card>

              {/* Attachments */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Tài liệu đính kèm</CardTitle>
                    <Button type="button" onClick={addAttachment} size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Thêm
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{attachment}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeAttachment(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {attachments.length === 0 && <p className="text-sm text-muted-foreground">Chưa có tài liệu nào</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                <Button type="submit" className="w-full">
                  Tạo hợp đồng
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
