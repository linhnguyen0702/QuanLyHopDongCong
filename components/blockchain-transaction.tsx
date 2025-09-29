"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Clock, CheckCircle, AlertTriangle, Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BlockchainTransactionProps {
  transactionData: {
    id: string
    type: string
    description: string
    data: any
  }
  onComplete?: (txHash: string) => void
  onError?: (error: string) => void
}

export function BlockchainTransaction({ transactionData, onComplete, onError }: BlockchainTransactionProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "pending" | "confirmed" | "failed">("idle")
  const [txHash, setTxHash] = useState<string>("")
  const [blockNumber, setBlockNumber] = useState<number>(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string>("")
  const { toast } = useToast()

  const submitTransaction = async () => {
    setStatus("submitting")
    setProgress(10)

    try {
      // Simulate transaction submission to Hyperledger Fabric
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`
      setTxHash(mockTxHash)
      setStatus("pending")
      setProgress(30)

      // Simulate network confirmation
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setProgress(60)

      // Simulate block inclusion
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setBlockNumber(12847 + Math.floor(Math.random() * 10))
      setStatus("confirmed")
      setProgress(100)

      toast({
        title: "Giao dịch thành công",
        description: "Dữ liệu đã được ghi lại trên blockchain",
      })

      onComplete?.(mockTxHash)
    } catch (err) {
      setStatus("failed")
      setError("Không thể gửi giao dịch lên blockchain")
      onError?.("Transaction failed")
    }
  }

  const copyTxHash = () => {
    navigator.clipboard.writeText(txHash)
    toast({
      title: "Đã sao chép",
      description: "Transaction hash đã được sao chép",
    })
  }

  const getStatusBadge = () => {
    switch (status) {
      case "idle":
        return <Badge variant="outline">Chờ gửi</Badge>
      case "submitting":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Đang gửi</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Chờ xác nhận</Badge>
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Đã xác nhận</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Thất bại</Badge>
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "submitting":
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Shield className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <CardTitle>Blockchain Transaction</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>Ghi dữ liệu lên Hyperledger Fabric</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transaction Info */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Loại giao dịch:</span>
            <span className="font-medium">{transactionData.type}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mô tả:</span>
            <span className="font-medium">{transactionData.description}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">ID:</span>
            <span className="font-mono text-xs">{transactionData.id}</span>
          </div>
        </div>

        {/* Progress */}
        {status !== "idle" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tiến độ:</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Transaction Hash */}
        {txHash && (
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
            <p className="text-xs font-mono bg-muted p-2 rounded break-all">{txHash}</p>
          </div>
        )}

        {/* Block Number */}
        {blockNumber > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Block Number:</span>
            <span className="font-medium">#{blockNumber.toLocaleString()}</span>
          </div>
        )}

        {/* Error */}
        {status === "failed" && error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {status === "confirmed" && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Giao dịch đã được xác nhận và ghi lại trên blockchain. Dữ liệu không thể chỉnh sửa.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        {status === "idle" && (
          <Button onClick={submitTransaction} className="w-full bg-secondary hover:bg-secondary/90">
            <Shield className="h-4 w-4 mr-2" />
            Gửi lên Blockchain
          </Button>
        )}

        {/* Network Info */}
        <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
          <p>Network: Hyperledger Fabric v2.4</p>
          <p>Channel: government-contracts</p>
          <p>Chaincode: contract-management-v1.0</p>
        </div>
      </CardContent>
    </Card>
  )
}
