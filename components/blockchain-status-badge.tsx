"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle, AlertTriangle, Clock } from "lucide-react"
import { blockchainService } from "@/lib/blockchain"
import { useToast } from "@/hooks/use-toast"

interface BlockchainStatusBadgeProps {
  contractId: string
  contractData?: any
  onStatusChange?: (isOnBlockchain: boolean) => void
}

export function BlockchainStatusBadge({ 
  contractId, 
  contractData, 
  onStatusChange 
}: BlockchainStatusBadgeProps) {
  const [isOnBlockchain, setIsOnBlockchain] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Kiểm tra trạng thái blockchain khi component mount
  useEffect(() => {
    checkBlockchainStatus()
  }, [contractId])

  const checkBlockchainStatus = async () => {
    try {
      const contract = await blockchainService.getContract(contractId)
      const isOnChain = !!contract
      setIsOnBlockchain(isOnChain)
      onStatusChange?.(isOnChain)
    } catch (error) {
      console.error("Error checking blockchain status:", error)
    }
  }

  const saveToBlockchain = async () => {
    if (!contractData) {
      toast({
        title: "Lỗi",
        description: "Không có dữ liệu hợp đồng",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    try {
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

      await blockchainService.createContract(blockchainData)
      
      // Tạo audit log
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

      setIsOnBlockchain(true)
      onStatusChange?.(true)

      toast({
        title: "Thành công",
        description: "Hợp đồng đã được ghi lên blockchain",
      })

    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể ghi lên blockchain",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isOnBlockchain) {
    return (
      <div className="flex items-center space-x-1">
        <Shield className="h-4 w-4 text-green-600" />
        <span className="text-xs text-green-600 font-medium">
          Đã lưu
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-muted-foreground">
        Chưa lưu
      </span>
      <Button
        size="sm"
        variant="outline"
        onClick={saveToBlockchain}
        disabled={isSaving || !contractData}
        className="h-6 px-2 text-xs"
      >
        {isSaving ? (
          <>
            <Clock className="h-3 w-3 mr-1 animate-spin" />
            Đang ghi...
          </>
        ) : (
          <>
            <Shield className="h-3 w-3 mr-1" />
            Ghi
          </>
        )}
      </Button>
    </div>
  )
}
