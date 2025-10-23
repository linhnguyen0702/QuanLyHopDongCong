# Hướng Dẫn Sử Dụng Blockchain trong Dự Án

## 🎯 Tình Trạng Hiện Tại

Dự án đang sử dụng **"Simple Blockchain Service"** - một blockchain service đơn giản không cần Docker hay Hyperledger Fabric phức tạp.

## 🚀 Cách Chạy Dự Án (Không Cần Docker)

### 1. Khởi động Backend (Port 5000)

```bash
# Mở PowerShell/CMD tại thư mục server
cd server
npm install
npm start
```

**Kiểm tra Backend:**
- Health check: http://localhost:5000/api/health
- Blockchain status: http://localhost:5000/api/blockchain/status

### 2. Khởi động Frontend (Port 3000)

```bash
# Mở PowerShell/CMD mới tại thư mục gốc dự án
npm install
npm run dev
```

**Truy cập:** http://localhost:3000

## 🔧 Cách Sử Dụng Blockchain API

### 1. Import Blockchain Service

```typescript
import { blockchainService } from '@/lib/blockchain'
```

### 2. Các Tính Năng Blockchain

#### Kiểm tra trạng thái mạng:
```typescript
const status = await blockchainService.getNetworkStatus()
console.log('Blockchain Status:', status)
```

#### Tạo hợp đồng trên blockchain:
```typescript
const contractData = {
  id: 'HĐ-2024-001',
  title: 'Xây dựng cầu Nhật Tân 2',
  contractor: 'Công ty TNHH ABC Construction',
  value: 450000000,
  startDate: '2024-01-15',
  endDate: '2024-12-31',
  status: 'active',
  createdBy: 'admin',
  createdAt: new Date().toISOString(),
  description: 'Dự án xây dựng cầu Nhật Tân 2'
}

const result = await blockchainService.createContract(contractData)
console.log('Transaction ID:', result.txId)
console.log('Block Number:', result.blockNumber)
```

#### Lấy thông tin hợp đồng:
```typescript
const contract = await blockchainService.getContract('HĐ-2024-001')
console.log('Contract:', contract)
```

#### Cập nhật hợp đồng:
```typescript
const updates = {
  status: 'completed',
  description: 'Dự án đã hoàn thành'
}

const result = await blockchainService.updateContract('HĐ-2024-001', updates)
console.log('Update Transaction:', result.txId)
```

#### Lấy tất cả hợp đồng:
```typescript
const contracts = await blockchainService.getAllContracts()
console.log('All Contracts:', contracts)
```

#### Tạo audit log:
```typescript
const auditData = {
  id: 'audit-001',
  action: 'VIEW_CONTRACT',
  entityType: 'CONTRACT',
  entityId: 'HĐ-2024-001',
  userId: 'admin',
  timestamp: new Date().toISOString(),
  details: 'User viewed contract details',
  ipAddress: '192.168.1.100'
}

const result = await blockchainService.createAuditLog(auditData)
console.log('Audit Log Created:', result.txId)
```

#### Lấy audit logs:
```typescript
// Lấy tất cả audit logs
const allLogs = await blockchainService.getAuditLogs()

// Lấy audit logs theo entity
const entityLogs = await blockchainService.getAuditLogs('HĐ-2024-001')
```

#### Tạo ID hợp đồng mới:
```typescript
const newId = await blockchainService.generateContractId()
console.log('New Contract ID:', newId) // Ví dụ: HĐ-2024-123
```

## 🌐 API Endpoints Blockchain

### Backend API (http://localhost:5000/api/blockchain/)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/status` | Trạng thái mạng blockchain |
| GET | `/test` | Kiểm tra kết nối blockchain |
| POST | `/contracts` | Tạo hợp đồng mới |
| GET | `/contracts/:id` | Lấy hợp đồng theo ID |
| GET | `/contracts` | Lấy tất cả hợp đồng |
| PUT | `/contracts/:id` | Cập nhật hợp đồng |
| POST | `/audit-logs` | Tạo audit log |
| GET | `/audit-logs` | Lấy audit logs |
| GET | `/audit-logs?entityId=:id` | Lấy audit logs theo entity |
| GET | `/generate-contract-id` | Tạo ID hợp đồng mới |

### Ví dụ sử dụng API trực tiếp:

```javascript
// Kiểm tra trạng thái blockchain
fetch('http://localhost:5000/api/blockchain/status')
  .then(response => response.json())
  .then(data => console.log(data))

// Tạo hợp đồng mới
fetch('http://localhost:5000/api/blockchain/contracts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    id: 'HĐ-2024-002',
    title: 'Xây dựng đường cao tốc',
    contractor: 'Công ty XYZ',
    value: 1000000000,
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    status: 'active',
    createdBy: 'admin',
    createdAt: new Date().toISOString()
  })
})
.then(response => response.json())
.then(data => console.log(data))
```

## 🔍 Tính Năng Blockchain Hiện Tại

### ✅ Đã có:
- **Immutable Storage**: Hợp đồng được lưu trữ không thể thay đổi
- **Audit Trail**: Mọi thay đổi đều được ghi lại
- **Transaction History**: Lịch sử giao dịch đầy đủ
- **Cryptographic IDs**: ID giao dịch và hợp đồng được mã hóa
- **Network Status**: Theo dõi trạng thái mạng blockchain
- **RESTful API**: API chuẩn cho tất cả tính năng

### 📊 Dữ liệu được lưu trữ:
- **Contracts**: Thông tin hợp đồng với transaction ID và block number
- **Audit Logs**: Nhật ký kiểm toán với timestamp và chi tiết
- **Network Status**: Thông tin mạng (block height, peers, health)

## 🔄 So Sánh với Hyperledger Fabric Thật

| Tính năng | Simple Blockchain | Hyperledger Fabric |
|-----------|-------------------|-------------------|
| **Cài đặt** | ✅ Đơn giản, không cần Docker | ❌ Phức tạp, cần Docker + Fabric |
| **Performance** | ✅ Nhanh, trong memory | ⚠️ Chậm hơn, network overhead |
| **Persistence** | ❌ Mất khi restart | ✅ Persistent trên blockchain |
| **Security** | ⚠️ Mock security | ✅ Cryptographic security thật |
| **Scalability** | ❌ Single node | ✅ Multi-node, distributed |
| **Production** | ❌ Chỉ cho demo/dev | ✅ Production ready |

## 🎯 Khi Nào Cần Hyperledger Fabric Thật?

### Cần nâng cấp khi:
- **Production Environment**: Triển khai thực tế
- **Data Persistence**: Cần lưu trữ vĩnh viễn
- **Multi-party**: Nhiều tổ chức tham gia
- **Regulatory Compliance**: Tuân thủ quy định pháp lý
- **High Security**: Bảo mật cấp độ cao

### Quy trình nâng cấp:
1. Cài Docker + Docker Compose
2. Tải Hyperledger Fabric
3. Khởi động test network
4. Deploy chaincode
5. Thay thế Simple Blockchain Service bằng Fabric SDK
6. Cấu hình certificates và wallets

## 🛠️ Troubleshooting

### Lỗi thường gặp:

**1. Server không khởi động:**
```bash
# Kiểm tra port 5000 có bị chiếm không
netstat -ano | findstr :5000

# Kill process nếu cần
taskkill /PID <PID> /F
```

**2. Frontend không kết nối được API:**
```bash
# Kiểm tra biến môi trường
echo $NEXT_PUBLIC_API_URL

# Hoặc tạo file .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api/blockchain
```

**3. Blockchain service không hoạt động:**
```bash
# Kiểm tra logs
tail -f server/logs/blockchain.log
tail -f server/logs/blockchain-error.log
```

## 📝 Lưu Ý Quan Trọng

- **Development Only**: Phiên bản hiện tại chỉ dành cho development/demo
- **Memory Storage**: Dữ liệu sẽ mất khi restart server
- **Mock Security**: Không có cryptographic security thật
- **Single Node**: Không có tính phân tán như blockchain thật

## 🚀 Bước Tiếp Theo

1. **Sử dụng tính năng hiện tại** để phát triển ứng dụng
2. **Test tất cả API endpoints** để đảm bảo hoạt động đúng
3. **Tích hợp vào UI** để người dùng có thể sử dụng
4. **Khi cần production**, nâng cấp lên Hyperledger Fabric thật

---

**Tóm lại**: Dự án hiện tại sử dụng blockchain mock đơn giản, dễ cài đặt và sử dụng. Tất cả tính năng blockchain đều hoạt động bình thường qua API và frontend service.
