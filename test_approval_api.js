const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  email: 'test@manager.com',
  password: 'Password123!'
};

const testContract = {
  contractNumber: 'HĐ-TEST-001',
  title: 'Hợp đồng test phê duyệt',
  description: 'Mô tả hợp đồng test',
  contractorId: 1,
  value: 100000000,
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  category: 'Xây dựng',
  priority: 'high'
};

async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${data.message || response.statusText}`);
  }
  
  return data;
}

async function testApprovalAPI() {
  try {
    console.log('🚀 Bắt đầu test API phê duyệt hợp đồng...\n');

    // 1. Login để lấy token
    console.log('1. Đăng nhập...');
    const loginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(testUser)
    });
    const token = loginResponse.data.token;
    console.log('✅ Đăng nhập thành công\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Tạo hợp đồng mới
    console.log('2. Tạo hợp đồng mới...');
    const createResponse = await makeRequest(`${API_BASE_URL}/contracts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testContract)
    });
    const contractId = createResponse.data.id;
    console.log(`✅ Tạo hợp đồng thành công với ID: ${contractId}\n`);

    // 3. Lấy danh sách hợp đồng chờ phê duyệt
    console.log('3. Lấy danh sách hợp đồng chờ phê duyệt...');
    const pendingResponse = await makeRequest(`${API_BASE_URL}/contracts/approvals?status=pending_approval`, { headers });
    console.log(`✅ Tìm thấy ${pendingResponse.data.length} hợp đồng chờ phê duyệt`);
    if (pendingResponse.data.length > 0) {
      console.log('Dữ liệu:', JSON.stringify(pendingResponse.data[0], null, 2));
    }
    console.log('');

    // 4. Phê duyệt hợp đồng
    console.log('4. Phê duyệt hợp đồng...');
    const approveResponse = await makeRequest(`${API_BASE_URL}/contracts/${contractId}/approve`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ comments: 'Phê duyệt test từ API' })
    });
    console.log('✅ Phê duyệt hợp đồng thành công\n');

    // 5. Kiểm tra trạng thái sau phê duyệt
    console.log('5. Kiểm tra trạng thái sau phê duyệt...');
    const approvedResponse = await makeRequest(`${API_BASE_URL}/contracts/approvals?status=approved`, { headers });
    console.log(`✅ Tìm thấy ${approvedResponse.data.length} hợp đồng đã phê duyệt\n`);

    // 6. Test từ chối hợp đồng (tạo hợp đồng mới)
    console.log('6. Test từ chối hợp đồng...');
    const testContract2 = { ...testContract, contractNumber: 'HĐ-TEST-002' };
    const createResponse2 = await makeRequest(`${API_BASE_URL}/contracts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testContract2)
    });
    const contractId2 = createResponse2.data.id;
    console.log(`✅ Tạo hợp đồng thứ 2 với ID: ${contractId2}`);

    const rejectResponse = await makeRequest(`${API_BASE_URL}/contracts/${contractId2}/reject`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ reason: 'Từ chối test từ API - giá cả không phù hợp' })
    });
    console.log('✅ Từ chối hợp đồng thành công\n');

    // 7. Kiểm tra trạng thái sau từ chối
    console.log('7. Kiểm tra trạng thái sau từ chối...');
    const rejectedResponse = await makeRequest(`${API_BASE_URL}/contracts/approvals?status=rejected`, { headers });
    console.log(`✅ Tìm thấy ${rejectedResponse.data.length} hợp đồng đã từ chối\n`);

    console.log('🎉 Tất cả test đều thành công!');

  } catch (error) {
    console.error('❌ Lỗi trong quá trình test:', error.message);
  }
}

// Chạy test
testApprovalAPI();
