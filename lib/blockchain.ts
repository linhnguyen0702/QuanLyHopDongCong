// Blockchain utility functions for Hyperledger Fabric integration

export interface BlockchainConfig {
  networkName: string
  channelName: string
  chaincodeName: string
  mspId: string
  gatewayPeer: string
}

export interface TransactionResult {
  txId: string
  blockNumber: number
  timestamp: Date
  status: "SUCCESS" | "FAILED"
  payload?: any
}

export interface ContractData {
  id: string
  title: string
  contractor: string
  value: number
  startDate: string
  endDate: string
  status: string
  createdBy: string
  createdAt: string
  description?: string
  attachments?: string[]
}

export interface AuditLogData {
  id: string
  action: string
  entityType: string
  entityId: string
  userId: string
  timestamp: string
  details: string
  ipAddress: string
}

export interface NetworkStatus {
  isConnected: boolean
  blockHeight: number
  peers: number
  channels: number
  chaincodes: number
  lastBlockTime: Date
  networkHealth: number
  transactionThroughput: number
  error?: string
}

// Real blockchain service that connects to backend API
class BlockchainService {
  private baseUrl: string
  private isConnected = false

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/blockchain'
  }

  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/test`)
      const data = await response.json()
      this.isConnected = data.connected
      return this.isConnected
    } catch (error) {
      console.error("Failed to connect to blockchain:", error)
      this.isConnected = false
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false
    console.log("Disconnected from blockchain network")
  }

  // Contract-specific methods
  async createContract(contractData: ContractData): Promise<TransactionResult> {
    try {
      const response = await fetch(`${this.baseUrl}/contracts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contractData),
      })

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create contract')
      }

      return {
        txId: result.data.txId,
        blockNumber: result.data.blockNumber,
        timestamp: new Date(result.data.timestamp),
        status: "SUCCESS",
        payload: result.data,
      }
    } catch (error) {
      throw new Error(`Transaction failed: ${error}`)
    }
  }

  async updateContract(contractId: string, updates: Partial<ContractData>): Promise<TransactionResult> {
    try {
      const response = await fetch(`${this.baseUrl}/contracts/${contractId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update contract')
      }

      return {
        txId: result.data.txId,
        blockNumber: result.data.blockNumber,
        timestamp: new Date(result.data.timestamp),
        status: "SUCCESS",
        payload: result.data,
      }
    } catch (error) {
      throw new Error(`Transaction failed: ${error}`)
    }
  }

  async getContract(contractId: string): Promise<ContractData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/contracts/${contractId}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get contract')
      }

      return result.data
    } catch (error) {
      console.error(`Failed to get contract ${contractId}:`, error)
      return null
    }
  }

  async getAllContracts(): Promise<ContractData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/contracts`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get contracts')
      }

      return result.data
    } catch (error) {
      console.error('Failed to get contracts:', error)
      return []
    }
  }

  // Audit log methods
  async createAuditLog(auditData: AuditLogData): Promise<TransactionResult> {
    try {
      const response = await fetch(`${this.baseUrl}/audit-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auditData),
      })

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create audit log')
      }

      return {
        txId: result.data.txId,
        blockNumber: result.data.blockNumber,
        timestamp: new Date(result.data.timestamp),
        status: "SUCCESS",
        payload: result.data,
      }
    } catch (error) {
      throw new Error(`Transaction failed: ${error}`)
    }
  }

  async getAuditLogs(entityId?: string): Promise<AuditLogData[]> {
    try {
      const url = entityId ? `${this.baseUrl}/audit-logs?entityId=${entityId}` : `${this.baseUrl}/audit-logs`
      const response = await fetch(url)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get audit logs')
      }

      return result.data
    } catch (error) {
      console.error('Failed to get audit logs:', error)
      return []
    }
  }

  // Network status methods
  async getNetworkStatus(): Promise<NetworkStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/status`)
      const result = await response.json()
      
      if (!result.success) {
        return {
          isConnected: false,
          blockHeight: 0,
          peers: 0,
          channels: 0,
          chaincodes: 0,
          lastBlockTime: new Date(),
          networkHealth: 0,
          transactionThroughput: 0,
          error: result.message || 'Failed to get network status'
        }
      }

      return {
        isConnected: result.data.isConnected,
        blockHeight: result.data.blockHeight || 0,
        peers: result.data.peers || 0,
        channels: result.data.channels || 0,
        chaincodes: result.data.chaincodes || 0,
        lastBlockTime: new Date(result.data.lastBlockTime || new Date()),
        networkHealth: result.data.networkHealth || 0,
        transactionThroughput: result.data.transactionThroughput || 0,
        error: result.data.error
      }
    } catch (error) {
      console.error('Failed to get network status:', error)
      return {
        isConnected: false,
        blockHeight: 0,
        peers: 0,
        channels: 0,
        chaincodes: 0,
        lastBlockTime: new Date(),
        networkHealth: 0,
        transactionThroughput: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Utility methods
  async generateContractId(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-contract-id`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to generate contract ID')
      }

      return result.data.contractId
    } catch (error) {
      console.error('Failed to generate contract ID:', error)
      // Fallback to local generation
      const year = new Date().getFullYear()
      const sequence = Math.floor(Math.random() * 999) + 1
      return `HĐ-${year}-${sequence.toString().padStart(3, '0')}`
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService()

// Utility functions
export const formatTxHash = (hash: string): string => {
  if (hash.length <= 16) return hash
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`
}

export const validateContractData = (data: Partial<ContractData>): boolean => {
  return !!(data.id && data.title && data.contractor && data.value)
}

export const generateContractId = (): string => {
  const year = new Date().getFullYear()
  const sequence = Math.floor(Math.random() * 999) + 1
  return `HĐ-${year}-${sequence.toString().padStart(3, "0")}`
}

// Blockchain event types
export type BlockchainEvent =
  | { type: "CONTRACT_CREATED"; data: ContractData }
  | { type: "CONTRACT_UPDATED"; data: { id: string; updates: Partial<ContractData> } }
  | { type: "AUDIT_LOG_CREATED"; data: AuditLogData }
  | { type: "NETWORK_STATUS_CHANGED"; data: { isConnected: boolean } }

// Event emitter for blockchain events
class BlockchainEventEmitter {
  private listeners: Map<string, Function[]> = new Map()

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event: string, data: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => callback(data))
    }
  }
}

export const blockchainEvents = new BlockchainEventEmitter()
