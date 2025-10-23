# Hyperledger Fabric Integration Guide

## ⚠️ LƯU Ý QUAN TRỌNG

**Dự án hiện tại đang sử dụng "Simple Blockchain Service" (mock blockchain) thay vì Hyperledger Fabric thật.**

- ✅ **Đang chạy**: Simple Blockchain Service (không cần Docker)
- ❌ **Chưa chạy**: Hyperledger Fabric thật (cần Docker + Fabric)

## 📋 Tình Trạng Hiện Tại

Dự án đã được tích hợp blockchain với:
- **Backend API**: `/api/blockchain/*` endpoints
- **Frontend Service**: `lib/blockchain.ts` 
- **Mock Blockchain**: Lưu trữ trong memory, không cần Docker
- **Tất cả tính năng**: Create, Read, Update, Audit logs

## 🚀 Cách Sử Dụng Hiện Tại (Không Cần Docker)

Xem file `BLOCKCHAIN_USAGE_GUIDE.md` để biết cách sử dụng blockchain hiện tại.

## 🔧 Tích hợp Hyperledger Fabric Thật (Tùy chọn)

Nếu muốn nâng cấp lên Hyperledger Fabric thật, làm theo hướng dẫn bên dưới:

### 1. Cài đặt Dependencies

Trước tiên, cài đặt các dependencies cần thiết:

```bash
cd server
npm install fabric-network fabric-ca-client fabric-protos grpc winston
```

### 2. Cấu hình Environment Variables

Tạo file `.env` trong thư mục `server` với nội dung:

```env
# Hyperledger Fabric Configuration
FABRIC_NETWORK_NAME=government-contracts-network
FABRIC_CHANNEL_NAME=contract-management
FABRIC_CHAINCODE_NAME=contract-mgmt
FABRIC_MSP_ID=GovernmentMSP
FABRIC_PEER_ENDPOINT=localhost:7051
FABRIC_CA_ENDPOINT=localhost:7054
FABRIC_WALLET_PATH=./wallet
FABRIC_CONNECTION_PROFILE_PATH=./config/connection-profile.json
FABRIC_ADMIN_USER=admin
FABRIC_ADMIN_PASSWORD=adminpw

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/blockchain
```

### 3. Cài đặt Hyperledger Fabric Network

#### 3.1 Tải Hyperledger Fabric

```bash
# Tải Fabric binaries và Docker images
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.4.0 1.5.0
```

#### 3.2 Khởi động Test Network

```bash
cd fabric-samples/test-network
./network.sh up createChannel
```

#### 3.3 Deploy Chaincode

```bash
# Package chaincode
cd fabric-samples/test-network
./network.sh deployCC -ccn contract-mgmt -ccp ../../server/chaincode -ccl go

# Hoặc deploy thủ công:
peer lifecycle chaincode package contract-mgmt.tar.gz --path ../../server/chaincode --lang golang --label contract-mgmt_1.0
```

### 4. Cấu hình Connection Profile

File `server/config/connection-profile.json` đã được tạo với cấu hình mặc định. Bạn có thể điều chỉnh theo môi trường của mình.

### 5. Khởi động Server

```bash
cd server
npm start
```

### 6. API Endpoints

Sau khi khởi động server, các API endpoints sau sẽ có sẵn:

#### Blockchain Status
- `GET /api/blockchain/status` - Lấy trạng thái mạng blockchain
- `GET /api/blockchain/test` - Kiểm tra kết nối blockchain

#### Contract Management
- `POST /api/blockchain/contracts` - Tạo hợp đồng mới trên blockchain
- `GET /api/blockchain/contracts/:id` - Lấy thông tin hợp đồng từ blockchain
- `GET /api/blockchain/contracts` - Lấy tất cả hợp đồng từ blockchain
- `PUT /api/blockchain/contracts/:id` - Cập nhật hợp đồng trên blockchain

#### Audit Logs
- `POST /api/blockchain/audit-logs` - Tạo audit log trên blockchain
- `GET /api/blockchain/audit-logs` - Lấy audit logs từ blockchain
- `GET /api/blockchain/audit-logs?entityId=:id` - Lấy audit logs theo entity

#### Utilities
- `GET /api/blockchain/generate-contract-id` - Tạo ID hợp đồng mới

### 7. Sử dụng trong Frontend

#### 7.1 Import Blockchain Service

```typescript
import { blockchainService } from '@/lib/blockchain'
```

#### 7.2 Tạo hợp đồng trên blockchain

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

try {
  const result = await blockchainService.createContract(contractData)
  console.log('Contract created:', result.txId)
} catch (error) {
  console.error('Failed to create contract:', error)
}
```

#### 7.3 Lấy thông tin hợp đồng

```typescript
try {
  const contract = await blockchainService.getContract('HĐ-2024-001')
  console.log('Contract:', contract)
} catch (error) {
  console.error('Failed to get contract:', error)
}
```

#### 7.4 Kiểm tra trạng thái mạng

```typescript
try {
  const status = await blockchainService.getNetworkStatus()
  console.log('Network status:', status)
} catch (error) {
  console.error('Failed to get network status:', error)
}
```

### 8. Monitoring và Logging

- Logs được lưu trong thư mục `server/logs/`
- `blockchain.log` - Tất cả logs
- `blockchain-error.log` - Chỉ error logs

### 9. Troubleshooting

#### 9.1 Lỗi kết nối blockchain

```bash
# Kiểm tra Docker containers
docker ps

# Kiểm tra logs của peer
docker logs peer0.org1.example.com

# Kiểm tra logs của orderer
docker logs orderer.example.com
```

#### 9.2 Lỗi chaincode

```bash
# Kiểm tra chaincode logs
docker logs dev-peer0.org1.example.com-contract-mgmt_1.0-xxx

# Restart chaincode
./network.sh deployCC -ccn contract-mgmt -ccp ../../server/chaincode -ccl go
```

#### 9.3 Lỗi wallet

```bash
# Xóa wallet và tạo lại
rm -rf server/wallet
mkdir server/wallet
```

### 10. Production Deployment

#### 10.1 Security Considerations

- Thay đổi mật khẩu admin mặc định
- Sử dụng TLS certificates thực
- Cấu hình firewall phù hợp
- Backup wallet và certificates

#### 10.2 Performance Optimization

- Tăng số lượng peers
- Sử dụng CouchDB cho state database
- Cấu hình endorsement policy phù hợp
- Monitor performance metrics

### 11. Backup và Recovery

#### 11.1 Backup

```bash
# Backup wallet
cp -r server/wallet backup/wallet-$(date +%Y%m%d)

# Backup certificates
cp -r fabric-samples/test-network/organizations backup/organizations-$(date +%Y%m%d)
```

#### 11.2 Recovery

```bash
# Restore wallet
cp -r backup/wallet-20240101/* server/wallet/

# Restore certificates
cp -r backup/organizations-20240101/* fabric-samples/test-network/organizations/
```

### 12. Liên hệ và Hỗ trợ

Nếu gặp vấn đề trong quá trình tích hợp, vui lòng:

1. Kiểm tra logs trong thư mục `server/logs/`
2. Xem lại cấu hình trong file `.env`
3. Đảm bảo Hyperledger Fabric network đang chạy
4. Kiểm tra kết nối mạng và firewall

---

**Lưu ý**: Đây là cấu hình cho môi trường development. Trong production, cần cấu hình bảo mật và performance phù hợp.
