"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Upload, X, FileText } from "lucide-react"
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
  onSuccess?: () => void
}

export function ContractorForm({ onClose, contractor, onSuccess }: ContractorFormProps) {
  const [formData, setFormData] = useState({
    name: contractor?.name || "",
    shortName: contractor?.short_name || "",
    taxCode: contractor?.tax_code || "",
    address: contractor?.address || "",
    phone: contractor?.phone || "",
    email: contractor?.email || "",
    website: contractor?.website || "",
    representative: contractor?.representative_name || contractor?.contact_person || "",
    representativePosition: contractor?.representative_position || "",
    establishedDate: contractor?.establishment_date ? new Date(contractor.establishment_date) : undefined,
    registrationNumber: contractor?.business_registration_number || "",
    category: contractor?.category || "",
    specialization: contractor?.expertise_field ? contractor.expertise_field.split(", ") : [],
    bankAccount: contractor?.bank_account || "",
    bankName: contractor?.bank_name || "",
    description: contractor?.description || "",
  })

  const [newSpecialization, setNewSpecialization] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [existingAttachments, setExistingAttachments] = useState<any[]>([])
  
  // Debug logging for uploadedFiles state
  useEffect(() => {
    console.log('uploadedFiles state changed:', uploadedFiles);
  }, [uploadedFiles])
  
  // Debug logging for existingAttachments state
  useEffect(() => {
    console.log('existingAttachments state changed:', existingAttachments);
  }, [existingAttachments])
  const { toast } = useToast()

  // Load contractor data when editing
  useEffect(() => {
    console.log('Contractor form useEffect triggered, contractor:', contractor);
    if (contractor?.id) {
      console.log('Loading contractor data for ID:', contractor.id);
      // Load contractor details to get attachments
      contractorsApi.getById(contractor.id).then(res => {
        console.log('Contractor API response:', res);
        if (res.success) {
          const data = res.data as any;
          console.log('Contractor data:', data);
          console.log('Contractor attachments field:', data.attachments);
          if (data.attachments && Array.isArray(data.attachments)) {
            console.log('Found attachments:', data.attachments);
            // Set existing attachments for display
            setExistingAttachments(data.attachments);
            // Convert attachments to File objects for display
            const files = data.attachments.map((att: any) => {
              // Use window.File to avoid conflict with lucide-react File icon
              const file = new window.File([''], att.name, {
                type: att.type || 'application/octet-stream',
                lastModified: att.lastModified || Date.now()
              });
              // Set size property
              Object.defineProperty(file, 'size', { value: att.size || 0 });
              return file;
            });
            console.log('Converted files:', files);
            setUploadedFiles(files);
          } else {
            console.log('No attachments found in contractor data');
            setExistingAttachments([]);
          }
        } else {
          console.log('Failed to load contractor data:', res.message);
        }
      }).catch(error => {
        console.error('Error loading contractor data:', error);
      });
    } else {
      console.log('No contractor ID provided');
    }
  }, [contractor?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập tên công ty",
        })
        setIsSubmitting(false)
        return
      }
      
      if (!formData.email.trim()) {
        toast({
          title: "Lỗi", 
          description: "Vui lòng nhập email",
        })
        setIsSubmitting(false)
        return
      }
      
      if (!formData.phone.trim()) {
        toast({
          title: "Lỗi", 
          description: "Vui lòng nhập số điện thoại",
        })
        setIsSubmitting(false)
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập địa chỉ email hợp lệ",
        })
        setIsSubmitting(false)
        return
      }

      const payload = {
        name: formData.name.trim(),
        contactPerson: formData.representative?.trim() || formData.shortName?.trim() || formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address?.trim() || "",
        taxCode: formData.taxCode?.trim() || "",
        bankAccount: formData.bankAccount?.trim() || "",
        bankName: formData.bankName?.trim() || "",
        description: formData.description?.trim() || "",
        // New fields
        shortName: formData.shortName?.trim() || "",
        businessRegistrationNumber: formData.registrationNumber?.trim() || "",
        category: formData.category || "Khác",
        establishmentDate: formData.establishedDate ? formData.establishedDate.toISOString().split('T')[0] : null,
        website: formData.website?.trim() || "",
        representativeName: formData.representative?.trim() || "",
        representativePosition: formData.representativePosition?.trim() || "",
        expertiseField: formData.specialization.join(", "),
        attachments: uploadedFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }))
      }

      console.log('Submitting contractor data:', payload)
      console.log('Auth token:', localStorage.getItem('auth_token'))

      const res = contractor ? await contractorsApi.update(contractor.id, payload) : await contractorsApi.create(payload)

      console.log('API response:', res)

      if (res?.success) {
        toast({
          title: "Thành công",
          description: contractor ? "Đã cập nhật nhà thầu" : "Đã thêm nhà thầu mới",
        })
        onClose()
        // Call success callback if provided
        if (onSuccess) {
          onSuccess()
        } else {
          // Fallback: trigger a custom event to refresh the contractors list
          window.dispatchEvent(new CustomEvent('contractorCreated'))
        }
      } else {
        let message = (res as any)?.message || (contractor ? "Không thể cập nhật nhà thầu" : "Không thể tạo nhà thầu")
        let title = "Lỗi"
        
        // Handle specific error cases
        if (message.includes("email already exists") || message.includes("Contractor with this email already exists")) {
          title = "Email đã tồn tại"
          message = "Email này đã được sử dụng bởi nhà thầu khác. Vui lòng sử dụng email khác."
        } else if (message.includes("validation failed") || message.includes("Validation failed")) {
          title = "Dữ liệu không hợp lệ"
          message = "Vui lòng kiểm tra lại thông tin đã nhập. Có thể thiếu thông tin bắt buộc hoặc định dạng không đúng."
        } else if (message.includes("duplicate") || message.includes("already exists")) {
          title = "Thông tin trùng lặp"
          message = "Thông tin này đã tồn tại trong hệ thống. Vui lòng kiểm tra lại."
        } else if (message.includes("network") || message.includes("Network")) {
          title = "Lỗi kết nối"
          message = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại."
        } else if (message.includes("unauthorized") || message.includes("Unauthorized")) {
          title = "Lỗi xác thực"
          message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        } else if (message.includes("forbidden") || message.includes("Forbidden")) {
          title = "Không có quyền"
          message = "Bạn không có quyền thực hiện thao tác này."
        } else if (message.includes("server error") || message.includes("Internal server error")) {
          title = "Lỗi server"
          message = "Có lỗi xảy ra trên server. Vui lòng thử lại sau."
        }
        
        toast({
          title: title,
          description: message,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating contractor:', error)
      
      let errorMessage = "Có lỗi xảy ra khi tạo nhà thầu"
      let errorTitle = "Lỗi"
      
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          errorTitle = "Lỗi kết nối"
          errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại."
        } else if (error.message.includes("Unexpected token") || error.message.includes("JSON")) {
          errorTitle = "Lỗi server"
          errorMessage = "Server trả về dữ liệu không hợp lệ. Vui lòng thử lại sau."
        } else if (error.message.includes("timeout")) {
          errorTitle = "Hết thời gian chờ"
          errorMessage = "Yêu cầu mất quá nhiều thời gian để xử lý. Vui lòng thử lại."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    console.log('File upload triggered, files:', files);
    if (files.length > 0) {
      setUploadedFiles(prev => {
        console.log('Previous files:', prev);
        const newFiles = [...prev, ...files];
        console.log('New files after upload:', newFiles);
        return newFiles;
      });
      toast({
        title: "Thành công",
        description: `Đã chọn ${files.length} file(s)`,
      })
    }
  }

  const removeFile = (index: number) => {
    console.log('Removing file at index:', index);
    setUploadedFiles(prev => {
      console.log('Previous files:', prev);
      const newFiles = prev.filter((_, i) => i !== index);
      console.log('New files:', newFiles);
      return newFiles;
    });
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
            {/* Display existing attachments from contractor */}
          {console.log('Checking existingAttachments.length:', existingAttachments.length)}
          {existingAttachments.length > 0 && (
            <div className="space-y-2">
              <Label>Files hiện có:</Label>
              {console.log('Rendering existingAttachments:', existingAttachments)}
              {existingAttachments.map((attachment: any, index: number) => {
                console.log('Rendering attachment:', attachment);
                return (
                  <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded border">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{attachment.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(attachment.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement delete existing attachment
                        console.log('Delete existing attachment:', attachment);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Tải lên giấy phép kinh doanh, chứng chỉ năng lực...</p>
              <Button 
                variant="outline" 
                size="sm" 
                type="button"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Chọn file
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
            
            {/* Display uploaded files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Files đã chọn:</p>
                <div className="space-y-1">
                  {uploadedFiles.map((file, index) => {
                    console.log('Rendering file:', file.name, file.size);
                    return (
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
                          type="button"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white">
          {isSubmitting ? "Đang xử lý..." : contractor ? "Cập nhật" : "Thêm nhà thầu"}
        </Button>
      </div>
    </form>
  )
}
