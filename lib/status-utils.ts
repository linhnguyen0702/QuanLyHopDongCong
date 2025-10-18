// Utility function to translate contract status from English to Vietnamese
export const translateContractStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'draft': 'Nháp',
    'pending_approval': 'Chờ phê duyệt',
    'approved': 'Đã phê duyệt',
    'active': 'Đang thực hiện',
    'completed': 'Hoàn thành',
    'cancelled': 'Đã hủy',
    'expired': 'Hết hạn'
  };
  
  return statusMap[status] || status;
};

// Utility function to get status badge color
export const getStatusBadgeColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'draft': 'outline',
    'pending_approval': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    'approved': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    'active': 'bg-green-100 text-green-800 hover:bg-green-100',
    'completed': 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    'cancelled': 'bg-red-100 text-red-800 hover:bg-red-100',
    'expired': 'bg-gray-100 text-gray-800 hover:bg-gray-100'
  };
  
  return colorMap[status] || 'secondary';
};
