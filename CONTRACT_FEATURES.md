# Hướng dẫn sử dụng chức năng Quản lý Hợp đồng

## Các chức năng đã được cập nhật

### 1. Chức năng Xóa Hợp đồng
- **Vị trí**: Trang danh sách hợp đồng (`/contracts`)
- **Cách sử dụng**: 
  - Nhấn vào nút "..." ở cột "Thao tác" của hợp đồng cần xóa
  - Chọn "Xóa" từ menu dropdown
  - Xác nhận xóa trong dialog hiện ra
- **Lưu ý**: Chỉ có quyền admin và manager mới có thể xóa hợp đồng
- **API**: `DELETE /api/contracts/:id`

### 2. Chức năng Tải xuống Hợp đồng
- **Vị trí**: 
  - Trang danh sách hợp đồng (`/contracts`) - từng hợp đồng riêng lẻ
  - Trang chi tiết hợp đồng (`/contracts/:id`) - xuất PDF
- **Cách sử dụng**:
  - **Từ danh sách**: Nhấn "..." → "Tải xuống" để tải file HTML
  - **Từ chi tiết**: Nhấn "Xuất PDF" để tải file HTML định dạng PDF
- **Định dạng**: File HTML có thể mở bằng trình duyệt hoặc chuyển đổi sang PDF

### 3. Chức năng Xuất Excel
- **Vị trí**: Trang danh sách hợp đồng (`/contracts`)
- **Cách sử dụng**: Nhấn nút "Xuất Excel" ở phần bộ lọc
- **Định dạng**: File CSV có thể mở bằng Excel
- **Nội dung**: Bao gồm tất cả hợp đồng hiện tại với các cột: Mã HĐ, Tên dự án, Nhà thầu, Giá trị, Ngày bắt đầu, Ngày kết thúc, Trạng thái, Danh mục

### 4. Chức năng Tải xuống Tài liệu
- **Vị trí**: Trang chi tiết hợp đồng → Tab "Tài liệu"
- **Cách sử dụng**: Nhấn "Tải xuống" bên cạnh từng tài liệu
- **API**: `GET /api/documents/download/:id`
- **Lưu ý**: Nếu tài liệu có ID thực tế trong database, sẽ tải file gốc. Nếu không, sẽ tạo file mẫu.

## Cấu trúc API

### Contracts API
```typescript
// Xóa hợp đồng
contractsApi.delete(id: number)

// Tải xuống hợp đồng (tạo file HTML)
handleDownloadContract(contract: any)

// Xuất Excel (tạo file CSV)
handleExportExcel()
```

### Documents API
```typescript
// Tải xuống tài liệu
documentsApi.download(documentId: number)

// Lấy danh sách tài liệu theo hợp đồng
documentsApi.getByContract(contractId: number, documentType?: string)
```

## Backend Routes

### Contracts
- `DELETE /api/contracts/:id` - Xóa hợp đồng (yêu cầu quyền admin/manager)

### Documents  
- `GET /api/documents/download/:id` - Tải xuống tài liệu
- `GET /api/documents/contract/:contractId` - Lấy danh sách tài liệu của hợp đồng
- `POST /api/documents/upload` - Upload tài liệu mới
- `DELETE /api/documents/:id` - Xóa tài liệu

## Cấu trúc File

### Frontend
- `app/contracts/page.tsx` - Trang danh sách hợp đồng với chức năng xóa và xuất Excel
- `components/contract-details.tsx` - Component chi tiết hợp đồng với chức năng tải xuống
- `lib/api.ts` - API client với các hàm contractsApi và documentsApi

### Backend
- `server/routes/contracts.js` - Route xử lý hợp đồng (đã có sẵn chức năng xóa)
- `server/routes/documents.js` - Route xử lý tài liệu (đã có sẵn chức năng tải xuống)

## Lưu ý kỹ thuật

1. **Xác thực**: Tất cả API đều yêu cầu token xác thực
2. **Phân quyền**: Chức năng xóa hợp đồng chỉ dành cho admin và manager
3. **File format**: 
   - Hợp đồng được xuất dưới dạng HTML (có thể chuyển sang PDF)
   - Danh sách hợp đồng được xuất dưới dạng CSV
4. **Error handling**: Tất cả chức năng đều có xử lý lỗi và hiển thị thông báo toast
5. **UI/UX**: Sử dụng AlertDialog để xác nhận xóa, toast để thông báo kết quả

## Cách test

1. Đăng nhập với tài khoản admin hoặc manager
2. Truy cập trang `/contracts`
3. Test các chức năng:
   - Xóa hợp đồng (có dialog xác nhận)
   - Tải xuống hợp đồng (tạo file HTML)
   - Xuất Excel (tạo file CSV)
   - Xem chi tiết và tải xuống tài liệu
