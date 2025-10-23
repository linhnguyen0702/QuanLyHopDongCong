"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { documentsApi, contractsApi } from "@/lib/api"
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
  Loader2,
  Upload,
  Plus,
  X,
} from "lucide-react"

interface ContractDetailsProps {
  contract: any
  onClose: () => void
  isFullPage?: boolean
}

export function ContractDetails({ contract, onClose, isFullPage = false }: ContractDetailsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [contractDetails, setContractDetails] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Load contract details from API
  useEffect(() => {
    const loadContractDetails = async () => {
      if (!contract?.id) return;
      
      try {
        setLoading(true);
        const response = await contractsApi.getById(contract.id);
        
        if (response.success) {
          const data = response.data as any;
          console.log('📄 Contract details loaded:', {
            contract: data.contract?.title,
            documents: data.documents?.length || 0,
            attachments: data.attachments?.length || 0
          });
          setContractDetails(data.contract);
          setPayments(data.payments || []);
          setDocuments(data.documents || []);
          setAttachments(data.attachments || []);
          setError("");
        } else {
          setError(response.message || "Không thể tải chi tiết hợp đồng");
        }
      } catch (err) {
        console.error("Error loading contract details:", err);
        setError("Có lỗi xảy ra khi tải chi tiết hợp đồng");
      } finally {
        setLoading(false);
      }
    };

    loadContractDetails();
  }, [contract?.id]);
  
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

  // Xử lý tải xuống tài liệu
  const handleDownloadDocument = async (doc: any) => {
    try {
      // Nếu có document ID thực tế, sử dụng API
      if (doc.id) {
        const url = `http://localhost:5000/api/documents/download/${doc.id}`;
        
        // Tạo link tải xuống với tên file gốc
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.document_name || doc.originalName || 'document';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Thành công",
          description: `Đang tải xuống ${doc.document_name || doc.originalName}`,
        });
        return;
      }

      // Xử lý attachments từ contract creation
      if (doc.originalName && doc.path) {
        const url = `http://localhost:5000/api/contracts/download-attachment/${contract.id}/${encodeURIComponent(doc.filename)}`;
        
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.originalName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Thành công",
          description: `Đang tải xuống ${doc.originalName}`,
        });
        return;
      }

      // Fallback: tạo nội dung tài liệu mẫu
      const docContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>${doc.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { text-align: center; margin-bottom: 30px; }
              .content { line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${doc.name}</h1>
              <p><em>Hợp đồng: ${contract.title || contract.contract_number}</em></p>
            </div>
            
            <div class="content">
              <p>Đây là nội dung tài liệu ${doc.name} cho hợp đồng ${contract.title || contract.contract_number}.</p>
              <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
            </div>
          </body>
        </html>
      `;

      const blob = new Blob([docContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name.replace(/\.[^/.]+$/, '') + '.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Thành công",
        description: `Đã tải xuống ${doc.name}`,
      });
    } catch (error) {
      console.error("Download document error:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tải xuống tài liệu",
        variant: "destructive",
      });
    }
  };

  // Xử lý tải xuống attachment từ JSON (giống contractors)
  const handleDownloadAttachment = async (attachment: any) => {
    try {
      // Tạo blob từ file data (giống contractors)
      const blob = new Blob([attachment.data || ''], { type: attachment.type });
      const url = URL.createObjectURL(blob);
      
      // Tạo link tải xuống với tên file gốc
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);

      toast({
        title: "Thành công",
        description: `Đang tải xuống ${attachment.name}`,
      });
    } catch (error) {
      console.error("Download attachment error:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tải xuống tài liệu",
        variant: "destructive",
      });
    }
  };

  // Xử lý upload file
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Cảnh báo",
        description: "Vui lòng chọn file để upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      // Use the new uploadDocuments API
      const response = await contractsApi.uploadDocuments(contract.id, selectedFiles);
      
      if (!response.success) {
        throw new Error(response.message || 'Upload failed');
      }

      toast({
        title: "Thành công",
        description: `Đã upload ${selectedFiles.length} file thành công`,
      });

      // Reload documents
      const response2 = await contractsApi.getById(contract.id);
      if (response2.success) {
        const data = response2.data as any;
        setDocuments(data.documents || []);
      }

      // Reset form
      setSelectedFiles([]);
      setShowUploadForm(false);
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Xử lý xuất PDF hợp đồng (sử dụng cửa sổ in để lưu thành PDF)
  const handleExportPDF = () => {
    try {
      const contractData = {
        title: contract.title,
        contractNumber: contract.contract_number || contract.id,
        contractor: contract.contractor_name || contract.contractor,
        value: contract.value,
        startDate: contract.start_date || contract.startDate,
        endDate: contract.end_date || contract.endDate,
        status: contract.status,
        category: contract.category,
        progress: contract.progress || 0,
      };

      const htmlContent = `
            <div class="header">
              <h1>HỢP ĐỒNG DỰ ÁN</h1>
              <h2>${contractData.title}</h2>
            </div>
            
            <div class="section">
              <div class="section-title">Thông tin cơ bản</div>
              <div class="contract-info">
                <div class="info-row">
                  <span class="label">Mã hợp đồng:</span>
                  <span class="value">${contractData.contractNumber}</span>
                </div>
                <div class="info-row">
                  <span class="label">Nhà thầu:</span>
                  <span class="value">${contractData.contractor || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="label">Giá trị:</span>
                  <span class="value">${formatCurrency(contractData.value)}</span>
                </div>
                <div class="info-row">
                  <span class="label">Ngày bắt đầu:</span>
                  <span class="value">${new Date(contractData.startDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div class="info-row">
                  <span class="label">Ngày kết thúc:</span>
                  <span class="value">${new Date(contractData.endDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div class="info-row">
                  <span class="label">Trạng thái:</span>
                  <span class="value">${contractData.status}</span>
                </div>
                <div class="info-row">
                  <span class="label">Danh mục:</span>
                  <span class="value">${contractData.category || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="label">Tiến độ:</span>
                  <span class="value">${contractData.progress}%</span>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Thông tin xuất báo cáo</div>
              <div class="info-row">
                <span class="label">Ngày xuất:</span>
                <span class="value">${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}</span>
              </div>
            </div>
      `;

      // Mở cửa sổ in để người dùng chọn "Save as PDF"
      const printWindow = window.open('', '_blank');
      if (!printWindow) throw new Error('Không thể mở cửa sổ in');

      // Ghi nội dung và chèn CSS in ấn
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Hợp đồng ${contractData.contractNumber}</title>
            <style>
              @page { margin: 20mm; }
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .contract-info { margin-bottom: 20px; }
              .info-row { margin-bottom: 10px; display: flex; }
              .label { font-weight: bold; display: inline-block; width: 200px; }
              .value { flex: 1; }
              .section { margin-bottom: 30px; }
              .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; }
              @media print {
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            ${htmlContent}
            <div class="no-print" style="text-align:center;margin-top:24px;">
              <button onclick="window.print()" style="padding:8px 12px;">In / Lưu PDF</button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      // Gọi print sau một nhịp để đảm bảo nội dung được render
      setTimeout(() => {
        try { printWindow.focus(); printWindow.print(); } catch {}
      }, 300);

      toast({
        title: "Thành công",
        description: "Đã mở hộp thoại in. Chọn 'Save as PDF' để lưu",
      });
    } catch (error) {
      console.error("Export PDF error:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xuất hợp đồng",
        variant: "destructive",
      });
    }
  };

  // Mock blockchain transactions (sẽ được thay thế bằng API thực tế sau)
  const blockchainHistory = [
    {
      id: "1",
      action: "Tạo hợp đồng",
      timestamp: contractDetails?.created_at || new Date().toISOString(),
      user: contractDetails?.created_by_name || "Hệ thống",
      hash: "0x1a2b3c4d5e6f7890abcdef1234567890",
      status: "confirmed",
    },
    {
      id: "2",
      action: "Phê duyệt hợp đồng",
      timestamp: contractDetails?.approved_at || new Date().toISOString(),
      user: contractDetails?.approved_by_name || "Quản lý",
      hash: "0x2b3c4d5e6f7890abcdef1234567890ab",
      status: "confirmed",
    },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải chi tiết hợp đồng...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={onClose}>Đóng</Button>
      </div>
    );
  }

  // Use contractDetails if available, otherwise fallback to contract prop
  const currentContract = contractDetails || contract;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{currentContract.title}</h2>
          <p className="text-muted-foreground mt-1">Mã hợp đồng: {currentContract.contract_number || currentContract.id}</p>
          {currentContract.description && (
            <p className="text-sm text-muted-foreground mt-1">{currentContract.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(currentContract.status)}
          {currentContract.blockchain_hash && (
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
                  <p className="font-medium">{currentContract.contractor_name || "Chưa có thông tin"}</p>
                  <p className="text-sm text-muted-foreground">Danh mục: {currentContract.category || "Khác"}</p>
                  {currentContract.contractor_email && (
                    <p className="text-sm text-muted-foreground">Email: {currentContract.contractor_email}</p>
                  )}
                  {currentContract.contractor_phone && (
                    <p className="text-sm text-muted-foreground">Điện thoại: {currentContract.contractor_phone}</p>
                  )}
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
                  <p className="text-2xl font-bold">{formatCurrency(currentContract.value || 0)}</p>
                  <p className="text-sm text-muted-foreground">Tiến độ: {currentContract.progress || 0}%</p>
                  {payments.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Số đợt thanh toán: {payments.length}
                    </p>
                  )}
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
                  <p className="font-medium">
                    {currentContract.start_date 
                      ? new Date(currentContract.start_date).toLocaleDateString("vi-VN")
                      : "Chưa có thông tin"
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày kết thúc</p>
                  <p className="font-medium">
                    {currentContract.end_date 
                      ? new Date(currentContract.end_date).toLocaleDateString("vi-VN")
                      : "Chưa có thông tin"
                    }
                  </p>
                </div>
              </div>
              {currentContract.created_at && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="font-medium">
                    {new Date(currentContract.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              )}
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
                  <span className="text-sm text-muted-foreground">{currentContract.progress || 0}%</span>
                </div>
                <Progress value={currentContract.progress || 0} className="w-full" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử thanh toán</CardTitle>
              <CardDescription>Theo dõi các đợt thanh toán của hợp đồng</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
              <div className="space-y-4">
                  {payments.map((payment, index) => (
                    <div key={payment.id || index} className="flex items-center space-x-4 p-3 border rounded-lg">
                      {payment.status === "paid" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : payment.status === "pending" ? (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-gray-400" />
                    )}
                    <div className="flex-1">
                        <p className="font-medium">Đợt {index + 1}: {formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          Hạn thanh toán: {new Date(payment.due_date).toLocaleDateString("vi-VN")}
                        </p>
                        {payment.description && (
                          <p className="text-sm text-muted-foreground">{payment.description}</p>
                        )}
                    </div>
                    <Badge
                      variant={
                          payment.status === "paid"
                          ? "default"
                            : payment.status === "pending"
                            ? "secondary"
                            : "outline"
                      }
                    >
                        {payment.status === "paid"
                          ? "Đã thanh toán"
                          : payment.status === "pending"
                            ? "Chờ thanh toán"
                            : "Quá hạn"}
                    </Badge>
                  </div>
                ))}
              </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <p>Chưa có thông tin thanh toán</p>
                </div>
              )}
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
              {/* Upload Section */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3">Tải lên tài liệu mới</h4>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Kéo thả file vào đây hoặc click để chọn</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => document.getElementById('contract-file-upload')?.click()}
                  >
                    Chọn file
                  </Button>
                  <input
                    id="contract-file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
                
                {/* Display selected files */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Files đã chọn:</p>
                    <div className="space-y-1">
                      {selectedFiles.map((file, index) => (
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
                            onClick={() => removeSelectedFile(index)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleUploadFiles} 
                        disabled={uploading}
                        className="flex-1"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Đang tải lên...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Tải lên tài liệu
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedFiles([])}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Existing Documents */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Tài liệu hiện có</h4>
                {/* Hiển thị documents từ contract_documents table */}
                {documents.length > 0 && documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.document_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(doc.file_size / 1024 / 1024).toFixed(2)} MB • {doc.document_type} • 
                          {new Date(doc.created_at).toLocaleDateString("vi-VN")}
                        </p>
                        {doc.uploaded_by_name && (
                          <p className="text-xs text-muted-foreground">
                            Upload bởi: {doc.uploaded_by_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadDocument(doc)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Tải xuống
                    </Button>
                  </div>
                ))}
                
                {/* Hiển thị attachments từ contract creation (JSON) - giống contractors */}
                {currentContract.attachments && Array.isArray(currentContract.attachments) && currentContract.attachments.length > 0 && 
                  currentContract.attachments.map((attachment: any, index: number) => (
                    <div key={`attachment-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{attachment.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB • {new Date(attachment.lastModified).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadAttachment(attachment)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Tải xuống
                      </Button>
                    </div>
                  ))
                }
                
                {/* Hiển thị khi không có tài liệu nào */}
                {documents.length === 0 && (!currentContract.attachments || !Array.isArray(currentContract.attachments) || currentContract.attachments.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có tài liệu nào</p>
                    <p className="text-sm">Tải lên tài liệu để quản lý hồ sơ hợp đồng</p>
                  </div>
                )}
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
                
                {/* Hiển thị thông tin thực tế từ database */}
                {currentContract.created_at && (
                  <div className="flex items-start space-x-4 p-4 border rounded-lg bg-blue-50">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">Hợp đồng được tạo</p>
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          Database
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Ngày tạo: {new Date(currentContract.created_at).toLocaleString("vi-VN")}
                      </p>
                      {currentContract.updated_at && currentContract.updated_at !== currentContract.created_at && (
                        <p className="text-sm text-muted-foreground mb-1">
                          Cập nhật lần cuối: {new Date(currentContract.updated_at).toLocaleString("vi-VN")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {currentContract.approved_at && (
                  <div className="flex items-start space-x-4 p-4 border rounded-lg bg-green-50">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">Hợp đồng được phê duyệt</p>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Database
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Ngày phê duyệt: {new Date(currentContract.approved_at).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                )}
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
        <Button variant="outline" onClick={handleExportPDF}>
          <Download className="h-4 w-4 mr-2" />
          Xuất PDF
        </Button>
        <Button 
          variant="outline"
          onClick={() => {
            // Navigate to edit page using Next.js router
            router.push(`/contracts?edit=${currentContract.id}`);
          }}
        >
          <Edit className="h-4 w-4 mr-2" />
          Chỉnh sửa hợp đồng
        </Button>
        {!isFullPage && (
          <Button onClick={onClose}>Đóng</Button>
        )}
      </div>
    </div>
  )
}

