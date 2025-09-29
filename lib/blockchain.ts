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

// Mock blockchain configuration
const BLOCKCHAIN_CONFIG: BlockchainConfig = {
  networkName: "government-contracts-network",
  channelName: "contract-management",
  chaincodeName: "contract-mgmt",
  mspId: "GovernmentMSP",
  gatewayPeer: "peer0.government.example.com:7051",
}

// Simulate blockchain connection
class BlockchainService {
  private config: BlockchainConfig
  private isConnected = false

  constructor(config: BlockchainConfig) {
    this.config = config
  }

  async connect(): Promise<boolean> {
    try {
      // Simulate connection to Hyperledger Fabric network
      await new Promise((resolve) => setTimeout(resolve, 1000))
      this.isConnected = true
      console.log(`Connected to blockchain network: ${this.config.networkName}`)
      return true
    } catch (error) {
      console.error("Failed to connect to blockchain:", error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false
    console.log("Disconnected from blockchain network")
  }

  async submitTransaction(
    functionName: string,
    args: string[],
    transientData?: Record<string, Buffer>,
  ): Promise<TransactionResult> {
    if (!this.isConnected) {
      throw new Error("Not connected to blockchain network")
    }

    try {
      // Simulate transaction submission
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const txId = this.generateTxId()
      const blockNumber = Math.floor(Math.random() * 1000) + 12000

      return {
        txId,
        blockNumber,
        timestamp: new Date(),
        status: "SUCCESS",
        payload: { functionName, args },
      }
    } catch (error) {
      throw new Error(`Transaction failed: ${error}`)
    }
  }

  async queryLedger(functionName: string, args: string[]): Promise<any> {
    if (!this.isConnected) {
      throw new Error("Not connected to blockchain network")
    }

    try {
      // Simulate ledger query
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Return mock data based on function name
      switch (functionName) {
        case "GetContract":
          return this.getMockContract(args[0])
        case "GetAllContracts":
          return this.getMockContracts()
        case "GetAuditLogs":
          return this.getMockAuditLogs(args[0])
        default:
          return null
      }
    } catch (error) {
      throw new Error(`Query failed: ${error}`)
    }
  }

  // Contract-specific methods
  async createContract(contractData: ContractData): Promise<TransactionResult> {
    const args = [contractData.id, JSON.stringify(contractData)]
    return this.submitTransaction("CreateContract", args)
  }

  async updateContract(contractId: string, updates: Partial<ContractData>): Promise<TransactionResult> {
    const args = [contractId, JSON.stringify(updates)]
    return this.submitTransaction("UpdateContract", args)
  }

  async getContract(contractId: string): Promise<ContractData | null> {
    return this.queryLedger("GetContract", [contractId])
  }

  async getAllContracts(): Promise<ContractData[]> {
    return this.queryLedger("GetAllContracts", [])
  }

  // Audit log methods
  async createAuditLog(auditData: AuditLogData): Promise<TransactionResult> {
    const args = [auditData.id, JSON.stringify(auditData)]
    return this.submitTransaction("CreateAuditLog", args)
  }

  async getAuditLogs(entityId?: string): Promise<AuditLogData[]> {
    return this.queryLedger("GetAuditLogs", entityId ? [entityId] : [])
  }

  // Utility methods
  private generateTxId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getMockContract(contractId: string): ContractData | null {
    // Return mock contract data
    return {
      id: contractId,
      title: "Mock Contract",
      contractor: "Mock Contractor",
      value: 1000000,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      status: "active",
      createdBy: "admin",
      createdAt: new Date().toISOString(),
    }
  }

  private getMockContracts(): ContractData[] {
    // Return mock contracts array
    return [
      {
        id: "HĐ-2024-001",
        title: "Xây dựng cầu Nhật Tân 2",
        contractor: "Công ty TNHH ABC Construction",
        value: 450000000,
        startDate: "2024-01-15",
        endDate: "2024-12-31",
        status: "active",
        createdBy: "admin",
        createdAt: "2024-01-15T10:30:00Z",
      },
    ]
  }

  private getMockAuditLogs(entityId?: string): AuditLogData[] {
    // Return mock audit logs
    return [
      {
        id: "audit-001",
        action: "CREATE_CONTRACT",
        entityType: "CONTRACT",
        entityId: entityId || "HĐ-2024-001",
        userId: "admin",
        timestamp: new Date().toISOString(),
        details: "Contract created",
        ipAddress: "192.168.1.100",
      },
    ]
  }

  // Network status methods
  async getNetworkStatus() {
    return {
      isConnected: this.isConnected,
      blockHeight: Math.floor(Math.random() * 1000) + 12000,
      peers: 4,
      channels: 2,
      chaincodes: 3,
      lastBlockTime: new Date(),
      networkHealth: 95 + Math.random() * 5,
      transactionThroughput: 200 + Math.floor(Math.random() * 100),
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService(BLOCKCHAIN_CONFIG)

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
