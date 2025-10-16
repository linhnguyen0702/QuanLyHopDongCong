"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/hooks/use-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, Upload, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { contractsApi, contractorsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function NewContractPage() {
  const router = useRouter();
  const { collapsed } = useSidebar();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [attachments, setAttachments] = useState<string[]>([]);
  const [milestones, setMilestones] = useState([
    { name: "", description: "", deadline: "", value: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contractNumber, setContractNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [contractorId, setContractorId] = useState<number | undefined>();
  const [contractors, setContractors] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    let mounted = true;
    const loadContractors = async () => {
      const res = await contractorsApi.getAll({ page: 1, limit: 100, status: "" as any });
      if (mounted && res?.success) {
        const data: any = (res as any).data;
        const list = data?.contractors || data || [];
        setContractors(list.map((c: any) => ({ id: c.id, name: c.name })));
      }
    };
    loadContractors();
    return () => {
      mounted = false;
    };
  }, []);

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { name: "", description: "", deadline: "", value: "" },
    ]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const addAttachment = () => {
    setAttachments([...attachments, `Tài liệu ${attachments.length + 1}.pdf`]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!contractorId || !startDate || !endDate) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng chọn nhà thầu và ngày bắt đầu/kết thúc" });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        contractNumber: contractNumber.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
        contractorId,
        value: Number(value) || 0,
        startDate: startDate.toISOString().slice(0, 10),
        endDate: endDate.toISOString().slice(0, 10),
      };

      const res = await contractsApi.create(payload);
      if (res?.success) {
        toast({ title: "Thành công", description: "Đã tạo hợp đồng" });
        router.push("/contracts");
      } else {
        toast({ title: "Lỗi", description: (res as any)?.message || "Không thể tạo hợp đồng" });
      }
    } catch (err) {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra khi tạo hợp đồng" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="layout-container bg-background">
      <Sidebar />
      <div className={cn("main-content", collapsed && "sidebar-collapsed")}>
        <Header />
        <main className="p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Tạo hợp đồng mới
                </h1>
                <p className="text-muted-foreground mt-2">
                  Nhập thông tin chi tiết cho hợp đồng dự án
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Information */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin cơ bản</CardTitle>
                    <CardDescription>
                      Thông tin chính của hợp đồng
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contractId">Mã hợp đồng *</Label>
                        <Input
                          id="contractId"
                          placeholder="HĐ-2024-XXX"
                          value={contractNumber}
                          onChange={(e) => setContractNumber(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contractType">Loại hợp đồng *</Label>
                        <Select required>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại hợp đồng" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="construction">
                              Xây dựng
                            </SelectItem>
                            <SelectItem value="supply">
                              Cung cấp vật tư
                            </SelectItem>
                            <SelectItem value="service">Dịch vụ</SelectItem>
                            <SelectItem value="consulting">Tư vấn</SelectItem>
                            <SelectItem value="maintenance">Bảo trì</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Tên hợp đồng *</Label>
                      <Input
                        id="title"
                        placeholder="Nhập tên hợp đồng"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Mô tả chi tiết</Label>
                      <Textarea
                        id="description"
                        placeholder="Mô tả chi tiết về nội dung hợp đồng"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                      />
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
                                !startDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate
                                ? format(startDate, "dd/MM/yyyy", {
                                    locale: vi,
                                  })
                                : "Chọn ngày"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={setStartDate}
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
                                !endDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {endDate
                                ? format(endDate, "dd/MM/yyyy", { locale: vi })
                                : "Chọn ngày"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              initialFocus
                            />
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
                    <CardDescription>
                      Giá trị và điều khoản thanh toán
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="totalValue">
                          Giá trị hợp đồng (VNĐ) *
                        </Label>
                        <Input
                          id="totalValue"
                          type="number"
                          placeholder="0"
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          required
                        />
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
                        <Input
                          id="advancePayment"
                          type="number"
                          placeholder="0"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="retentionRate">Tỷ lệ bảo lưu (%)</Label>
                        <Input
                          id="retentionRate"
                          type="number"
                          placeholder="5"
                          min="0"
                          max="20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentTerms">
                        Điều khoản thanh toán
                      </Label>
                      <Textarea
                        id="paymentTerms"
                        placeholder="Mô tả chi tiết về lịch thanh toán và điều kiện"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Milestones */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Các mốc thực hiện</CardTitle>
                        <CardDescription>
                          Định nghĩa các giai đoạn và mốc quan trọng
                        </CardDescription>
                      </div>
                      <Button type="button" onClick={addMilestone} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm mốc
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className="p-4 border border-border rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Mốc {index + 1}</h4>
                          {milestones.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMilestone(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            placeholder="Tên mốc thực hiện"
                            value={milestone.name}
                            onChange={(e) => {
                              const newMilestones = [...milestones];
                              newMilestones[index].name = e.target.value;
                              setMilestones(newMilestones);
                            }}
                          />
                          <Input
                            placeholder="Hạn hoàn thành"
                            type="date"
                            value={milestone.deadline}
                            onChange={(e) => {
                              const newMilestones = [...milestones];
                              newMilestones[index].deadline = e.target.value;
                              setMilestones(newMilestones);
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Textarea
                            placeholder="Mô tả chi tiết"
                            rows={2}
                            value={milestone.description}
                            onChange={(e) => {
                              const newMilestones = [...milestones];
                              newMilestones[index].description = e.target.value;
                              setMilestones(newMilestones);
                            }}
                          />
                          <Input
                            placeholder="Giá trị (VNĐ)"
                            type="number"
                            value={milestone.value}
                            onChange={(e) => {
                              const newMilestones = [...milestones];
                              newMilestones[index].value = e.target.value;
                              setMilestones(newMilestones);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Information */}
              <div className="space-y-6">
                {/* Contractor Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin nhà thầu</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contractor">Nhà thầu *</Label>
                      <Select required value={contractorId ? String(contractorId) : undefined} onValueChange={(v) => setContractorId(Number(v))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn nhà thầu" />
                        </SelectTrigger>
                        <SelectContent>
                          {contractors.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Người liên hệ</Label>
                      <Input
                        id="contactPerson"
                        placeholder="Tên người liên hệ"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Số điện thoại</Label>
                      <Input id="contactPhone" placeholder="0123456789" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="contact@company.com"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Project Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin dự án</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Địa điểm thực hiện</Label>
                      <Input id="location" placeholder="Địa chỉ cụ thể" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Mức độ ưu tiên</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn mức độ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Thấp</SelectItem>
                          <SelectItem value="medium">Trung bình</SelectItem>
                          <SelectItem value="high">Cao</SelectItem>
                          <SelectItem value="urgent">Khẩn cấp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">Phòng ban phụ trách</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phòng ban" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="construction">
                            Phòng Xây dựng
                          </SelectItem>
                          <SelectItem value="procurement">
                            Phòng Mua sắm
                          </SelectItem>
                          <SelectItem value="finance">
                            Phòng Tài chính
                          </SelectItem>
                          <SelectItem value="legal">Phòng Pháp chế</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Attachments */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Tài liệu đính kèm</CardTitle>
                      <Button
                        type="button"
                        onClick={addAttachment}
                        size="sm"
                        variant="outline"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Thêm
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <span className="text-sm">{attachment}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {attachments.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          Chưa có tài liệu nào
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Button type="submit" className="w-full bg-[#7C3AED] hover:bg-[#7C3AED]/90" disabled={isSubmitting}>
                        {isSubmitting ? "Đang xử lý..." : "Tạo hợp đồng"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full bg-transparent"
                      >
                        Lưu nháp
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => router.back()}
                      >
                        Hủy bỏ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
