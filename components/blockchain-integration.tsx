"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ExternalLink,
  Copy,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { blockchainService } from "@/lib/blockchain"

interface BlockchainIntegrationProps {
  contractId: string
  contractData?: any
  onBlockchainUpdate?: (isOnBlockchain: boolean) => void
}

export function BlockchainIntegration({ 
  contractId, 
  contractData, 
  onBlockchainUpdate 
}: BlockchainIntegrationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOnBlockchain, setIsOnBlockchain] = useState(false)
  const [txHash, setTxHash] = useState<string>("")
  const [blockNumber, setBlockNumber] = useState<number>(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string>("")
  const { toast } = useToast()

  // Kiểm tra xem hợp đồng đã có trên blockchain chưa
  const checkBlockchainStatus = async () => {
    try {
      const contract = await blockchainService.getContract(contractId)
      if (contract) {
        setIsOnBlockchain(true)
        setTxHash((contract as any).txId || "")
        setBlockNumber((contract as any).blockNumber || 0)
        onBlockchainUpdate?.(true)
      } else {
        setIsOnBlockchain(false)
        onBlockchainUpdate?.(false)
      }
    } catch (error) {
      console.error("Error checking blockchain status:", error)
    }
  }

  // Ghi hợp đồng lên blockchain
  const saveToBlockchain = async () => {
    if (!contractData) {
      toast({
        title: "Lỗi",
        description: "Không có dữ liệu hợp đồng để ghi lên blockchain",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    setProgress(0)
    setError("")

    try {
      // Bước 1: Chuẩn bị dữ liệu
      setProgress(10)
      const blockchainData = {
        id: contractId,
        title: contractData.title || contractData.project_name,
        contractor: contractData.contractor_name || contractData.contractor,
        value: contractData.value || contractData.contract_value,
        startDate: contractData.start_date || contractData.startDate,
        endDate: contractData.end_date || contractData.endDate,
        status: contractData.status,
        createdBy: contractData.created_by || contractData.createdBy || "admin",
        createdAt: contractData.created_at || contractData.createdAt || new Date().toISOString(),
        description: contractData.description || contractData.project_description
      }

      // Bước 2: Gửi lên blockchain
      setProgress(30)
      const result = await blockchainService.createContract(blockchainData)
      
      setProgress(60)
      setTxHash(result.txId)
      setBlockNumber(result.blockNumber)
      
      // Bước 3: Tạo audit log
      setProgress(80)
      await blockchainService.createAuditLog({
        id: `audit-${contractId}-${Date.now()}`,
        action: "SAVE_TO_BLOCKCHAIN",
        entityType: "CONTRACT",
        entityId: contractId,
        userId: blockchainData.createdBy,
        timestamp: new Date().toISOString(),
        details: `Contract ${contractId} saved to blockchain`,
        ipAddress: "127.0.0.1"
      })

      setProgress(100)
      setIsOnBlockchain(true)
      onBlockchainUpdate?.(true)

      toast({
        title: "Thành công",
        description: "Hợp đồng đã được ghi lên blockchain",
      })

    } catch (error: any) {
      setError(error.message || "Không thể ghi lên blockchain")
      toast({
        title: "Lỗi",
        description: error.message || "Không thể ghi lên blockchain",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cập nhật hợp đồng trên blockchain
  const updateOnBlockchain = async () => {
    if (!contractData) return

    setIsLoading(true)
    setError("")

    try {
      const updates = {
        status: contractData.status,
        description: contractData.description || contractData.project_description
      }

      const result = await blockchainService.updateContract(contractId, updates)
      setTxHash(result.txId)
      setBlockNumber(result.blockNumber)

      toast({
        title: "Thành công",
        description: "Hợp đồng đã được cập nhật trên blockchain",
      })

    } catch (error: any) {
      setError(error.message || "Không thể cập nhật trên blockchain")
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trên blockchain",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Copy transaction hash
  const copyTxHash = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash)
      toast({
        title: "Đã sao chép",
        description: "Transaction hash đã được sao chép",
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle>Blockchain Status</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkBlockchainStatus}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Kiểm tra
          </Button>
        </div>
        <CardDescription>
          Trạng thái lưu trữ trên blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Trạng thái:</span>
          {isOnBlockchain ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              <CheckCircle className="h-3 w-3 mr-1" />
              Đã lưu trên blockchain
            </Badge>
          ) : (
            <Badge variant="outline">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Chưa lưu
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tiến độ:</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Transaction Info */}
        {isOnBlockchain && txHash && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Transaction Hash:</span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={copyTxHash}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Explorer
                </Button>
              </div>
            </div>
            <p className="text-xs font-mono bg-muted p-2 rounded break-all">
              {txHash}
            </p>
            {blockNumber > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Block Number:</span>
                <span className="font-medium">#{blockNumber.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {!isOnBlockchain ? (
            <Button 
              onClick={saveToBlockchain} 
              disabled={isLoading || !contractData}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Đang ghi...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Ghi lên Blockchain
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={updateOnBlockchain} 
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Cập nhật Blockchain
                </>
              )}
            </Button>
          )}
        </div>

        {/* Success Message */}
        {isOnBlockchain && !isLoading && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Hợp đồng đã được lưu trữ an toàn trên blockchain. Dữ liệu không thể chỉnh sửa.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
