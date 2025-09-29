"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Shield, Activity, Database, Network, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"

interface BlockchainStatusProps {
  className?: string
}

export function BlockchainStatus({ className }: BlockchainStatusProps) {
  const [networkStatus, setNetworkStatus] = useState({
    isConnected: true,
    blockHeight: 12847,
    peers: 4,
    channels: 2,
    chaincodes: 3,
    lastBlockTime: new Date(),
    networkHealth: 98.5,
    transactionThroughput: 245,
  })

  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshStatus = async () => {
    setIsRefreshing(true)
    // Simulate API call to Hyperledger network
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setNetworkStatus((prev) => ({
      ...prev,
      blockHeight: prev.blockHeight + Math.floor(Math.random() * 5) + 1,
      lastBlockTime: new Date(),
      networkHealth: 95 + Math.random() * 5,
      transactionThroughput: 200 + Math.floor(Math.random() * 100),
    }))
    setIsRefreshing(false)
  }

  useEffect(() => {
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      refreshStatus()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <CardTitle>Trạng thái Blockchain</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={refreshStatus} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
        <CardDescription>Hyperledger Fabric Network Status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Network Health */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Tình trạng mạng</span>
            <div className="flex items-center space-x-2">
              {networkStatus.isConnected ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <Badge
                className={
                  networkStatus.isConnected
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : "bg-red-100 text-red-800 hover:bg-red-100"
                }
              >
                {networkStatus.isConnected ? "Kết nối" : "Mất kết nối"}
              </Badge>
            </div>
          </div>
          <Progress value={networkStatus.networkHealth} className="w-full" />
          <p className="text-xs text-muted-foreground">{networkStatus.networkHealth.toFixed(1)}% uptime</p>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Block Height</span>
            </div>
            <p className="text-2xl font-bold">{networkStatus.blockHeight.toLocaleString()}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">TPS</span>
            </div>
            <p className="text-2xl font-bold">{networkStatus.transactionThroughput}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Network className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Peers</span>
            </div>
            <p className="text-2xl font-bold">{networkStatus.peers}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Channels</span>
            </div>
            <p className="text-2xl font-bold">{networkStatus.channels}</p>
          </div>
        </div>

        {/* Last Block Info */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Block cuối cùng:</span>
            <span className="font-medium">{networkStatus.lastBlockTime.toLocaleTimeString("vi-VN")}</span>
          </div>
        </div>

        {/* Network Details */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>Network: government-contracts-network</p>
          <p>Channel: contract-management</p>
          <p>Chaincode: contract-mgmt-v1.2.0</p>
        </div>
      </CardContent>
    </Card>
  )
}
