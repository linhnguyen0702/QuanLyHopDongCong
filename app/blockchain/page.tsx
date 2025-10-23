"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useSidebar } from "@/hooks/use-sidebar"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Shield,
  Activity,
  Database,
  Network,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Copy,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { blockchainService } from "@/lib/blockchain"

export default function BlockchainPage() {
  const sidebar = useSidebar()
  const { toast } = useToast()
  const [networkStatus, setNetworkStatus] = useState<any>(null)
  const [contracts, setContracts] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load blockchain data
  const loadBlockchainData = async () => {
    setIsLoading(true)
    try {
      // Get network status
      const status = await blockchainService.getNetworkStatus()
      setNetworkStatus(status)

      // Get contracts from blockchain
      const blockchainContracts = await blockchainService.getAllContracts()
      setContracts(blockchainContracts)

      // Get audit logs
      const logs = await blockchainService.getAuditLogs()
      setAuditLogs(logs)

    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải dữ liệu blockchain",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh data
  const refreshData = async () => {
    setIsRefreshing(true)
    await loadBlockchainData()
    setIsRefreshing(false)
  }

  // Initialize data
  useEffect(() => {
    loadBlockchainData()
  }, [])

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Đã sao chép",
      description: "Đã sao chép vào clipboard",
    })
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Blockchain Management</h1>
                <p className="text-muted-foreground">
                  Quản lý và theo dõi trạng thái blockchain
                </p>
              </div>
              <Button onClick={refreshData} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Làm mới
              </Button>
            </div>

            {/* Network Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Trạng thái mạng</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {networkStatus?.isConnected ? (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <span className="text-green-600">Kết nối</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                        <span className="text-red-600">Mất kết nối</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {networkStatus?.error || "Mạng blockchain hoạt động bình thường"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Block Height</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {networkStatus?.blockHeight?.toLocaleString() || "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Số block hiện tại
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hợp đồng</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contracts.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Hợp đồng trên blockchain
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Network Health</CardTitle>
                  <Network className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {networkStatus?.networkHealth?.toFixed(1) || "0"}%
                  </div>
                  <Progress 
                    value={networkStatus?.networkHealth || 0} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Blockchain Contracts */}
            <Card>
              <CardHeader>
                <CardTitle>Hợp đồng trên Blockchain</CardTitle>
                <CardDescription>
                  Danh sách tất cả hợp đồng đã được ghi lên blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Clock className="h-6 w-6 animate-spin mr-2" />
                    Đang tải dữ liệu...
                  </div>
                ) : contracts.length === 0 ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Chưa có hợp đồng nào được ghi lên blockchain
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Hợp đồng</TableHead>
                        <TableHead>Tên dự án</TableHead>
                        <TableHead>Nhà thầu</TableHead>
                        <TableHead>Giá trị</TableHead>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Block Number</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contracts.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">{contract.id}</TableCell>
                          <TableCell>{contract.title}</TableCell>
                          <TableCell>{contract.contractor}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(contract.value)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs">
                                {contract.txId ? `${contract.txId.slice(0, 8)}...` : 'N/A'}
                              </span>
                              {contract.txId && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(contract.txId)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs">
                              #{contract.blockNumber?.toLocaleString() || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Xem chi tiết
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Audit Logs */}
            <Card>
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>
                  Nhật ký kiểm toán từ blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                {auditLogs.length === 0 ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Chưa có audit log nào
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Hành động</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Người dùng</TableHead>
                        <TableHead>Chi tiết</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.slice(0, 10).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {new Date(log.timestamp).toLocaleString('vi-VN')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{log.entityType}</span>
                            <br />
                            <span className="text-xs text-muted-foreground">
                              {log.entityId}
                            </span>
                          </TableCell>
                          <TableCell>{log.userId}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {log.details}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
