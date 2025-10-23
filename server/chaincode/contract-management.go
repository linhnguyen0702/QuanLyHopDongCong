package main

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// ContractManagementContract provides functions for managing contracts
type ContractManagementContract struct {
	contractapi.Contract
}

// Contract represents a contract in the ledger
type Contract struct {
	ID          string  `json:"id"`
	Title       string  `json:"title"`
	Contractor  string  `json:"contractor"`
	Value       float64 `json:"value"`
	StartDate   string  `json:"startDate"`
	EndDate     string  `json:"endDate"`
	Status      string  `json:"status"`
	CreatedBy   string  `json:"createdBy"`
	CreatedAt   string  `json:"createdAt"`
	UpdatedAt   string  `json:"updatedAt"`
	Description string  `json:"description"`
	Attachments []string `json:"attachments"`
}

// AuditLog represents an audit log entry
type AuditLog struct {
	ID         string `json:"id"`
	Action     string `json:"action"`
	EntityType string `json:"entityType"`
	EntityID   string `json:"entityId"`
	UserID     string `json:"userId"`
	Timestamp  string `json:"timestamp"`
	Details    string `json:"details"`
	IPAddress  string `json:"ipAddress"`
}

// InitLedger adds a base set of contracts to the ledger
func (c *ContractManagementContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	contracts := []Contract{
		{
			ID:          "HĐ-2024-001",
			Title:       "Xây dựng cầu Nhật Tân 2",
			Contractor:  "Công ty TNHH ABC Construction",
			Value:       450000000,
			StartDate:   "2024-01-15",
			EndDate:     "2024-12-31",
			Status:      "active",
			CreatedBy:   "admin",
			CreatedAt:   "2024-01-15T10:30:00Z",
			UpdatedAt:   "2024-01-15T10:30:00Z",
			Description: "Dự án xây dựng cầu Nhật Tân 2",
			Attachments: []string{},
		},
	}

	for _, contract := range contracts {
		contractJSON, err := json.Marshal(contract)
		if err != nil {
			return err
		}

		err = ctx.GetStub().PutState(contract.ID, contractJSON)
		if err != nil {
			return fmt.Errorf("failed to put contract %s to world state: %v", contract.ID, err)
		}
	}

	return nil
}

// CreateContract creates a new contract in the ledger
func (c *ContractManagementContract) CreateContract(ctx contractapi.TransactionContextInterface, contractID string, contractData string) error {
	// Check if contract already exists
	exists, err := c.ContractExists(ctx, contractID)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("contract %s already exists", contractID)
	}

	// Parse contract data
	var contract Contract
	err = json.Unmarshal([]byte(contractData), &contract)
	if err != nil {
		return fmt.Errorf("failed to unmarshal contract data: %v", err)
	}

	// Set contract ID
	contract.ID = contractID

	// Marshal contract
	contractJSON, err := json.Marshal(contract)
	if err != nil {
		return err
	}

	// Put contract to ledger
	err = ctx.GetStub().PutState(contractID, contractJSON)
	if err != nil {
		return fmt.Errorf("failed to put contract %s to world state: %v", contractID, err)
	}

	// Create audit log
	auditLog := AuditLog{
		ID:         fmt.Sprintf("audit-%s-%d", contractID, ctx.GetStub().GetTxTimestamp().GetSeconds()),
		Action:     "CREATE_CONTRACT",
		EntityType: "CONTRACT",
		EntityID:   contractID,
		UserID:     contract.CreatedBy,
		Timestamp:  fmt.Sprintf("%d", ctx.GetStub().GetTxTimestamp().GetSeconds()),
		Details:    fmt.Sprintf("Contract %s created", contractID),
		IPAddress:  "127.0.0.1",
	}

	err = c.CreateAuditLog(ctx, auditLog.ID, auditLog)
	if err != nil {
		return fmt.Errorf("failed to create audit log: %v", err)
	}

	return nil
}

// UpdateContract updates an existing contract
func (c *ContractManagementContract) UpdateContract(ctx contractapi.TransactionContextInterface, contractID string, updates string) error {
	// Get existing contract
	contractJSON, err := ctx.GetStub().GetState(contractID)
	if err != nil {
		return fmt.Errorf("failed to read contract %s from world state: %v", contractID, err)
	}
	if contractJSON == nil {
		return fmt.Errorf("contract %s does not exist", contractID)
	}

	// Parse existing contract
	var contract Contract
	err = json.Unmarshal(contractJSON, &contract)
	if err != nil {
		return err
	}

	// Parse updates
	var updateData map[string]interface{}
	err = json.Unmarshal([]byte(updates), &updateData)
	if err != nil {
		return fmt.Errorf("failed to unmarshal update data: %v", err)
	}

	// Apply updates
	if title, ok := updateData["title"].(string); ok {
		contract.Title = title
	}
	if contractor, ok := updateData["contractor"].(string); ok {
		contract.Contractor = contractor
	}
	if value, ok := updateData["value"].(float64); ok {
		contract.Value = value
	}
	if startDate, ok := updateData["startDate"].(string); ok {
		contract.StartDate = startDate
	}
	if endDate, ok := updateData["endDate"].(string); ok {
		contract.EndDate = endDate
	}
	if status, ok := updateData["status"].(string); ok {
		contract.Status = status
	}
	if description, ok := updateData["description"].(string); ok {
		contract.Description = description
	}

	// Update timestamp
	contract.UpdatedAt = fmt.Sprintf("%d", ctx.GetStub().GetTxTimestamp().GetSeconds())

	// Marshal updated contract
	updatedContractJSON, err := json.Marshal(contract)
	if err != nil {
		return err
	}

	// Put updated contract to ledger
	err = ctx.GetStub().PutState(contractID, updatedContractJSON)
	if err != nil {
		return fmt.Errorf("failed to put updated contract %s to world state: %v", contractID, err)
	}

	// Create audit log
	auditLog := AuditLog{
		ID:         fmt.Sprintf("audit-%s-%d", contractID, ctx.GetStub().GetTxTimestamp().GetSeconds()),
		Action:     "UPDATE_CONTRACT",
		EntityType: "CONTRACT",
		EntityID:   contractID,
		UserID:     contract.CreatedBy,
		Timestamp:  fmt.Sprintf("%d", ctx.GetStub().GetTxTimestamp().GetSeconds()),
		Details:    fmt.Sprintf("Contract %s updated", contractID),
		IPAddress:  "127.0.0.1",
	}

	err = c.CreateAuditLog(ctx, auditLog.ID, auditLog)
	if err != nil {
		return fmt.Errorf("failed to create audit log: %v", err)
	}

	return nil
}

// GetContract returns the contract stored in the world state with given id
func (c *ContractManagementContract) GetContract(ctx contractapi.TransactionContextInterface, contractID string) (*Contract, error) {
	contractJSON, err := ctx.GetStub().GetState(contractID)
	if err != nil {
		return nil, fmt.Errorf("failed to read contract %s from world state: %v", contractID, err)
	}
	if contractJSON == nil {
		return nil, fmt.Errorf("contract %s does not exist", contractID)
	}

	var contract Contract
	err = json.Unmarshal(contractJSON, &contract)
	if err != nil {
		return nil, err
	}

	return &contract, nil
}

// GetAllContracts returns all contracts found in world state
func (c *ContractManagementContract) GetAllContracts(ctx contractapi.TransactionContextInterface) ([]*Contract, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var contracts []*Contract
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var contract Contract
		err = json.Unmarshal(queryResponse.Value, &contract)
		if err != nil {
			return nil, err
		}

		// Only include contracts (skip audit logs)
		if contract.ID != "" && contract.Title != "" {
			contracts = append(contracts, &contract)
		}
	}

	return contracts, nil
}

// ContractExists returns true when contract with given ID exists in world state
func (c *ContractManagementContract) ContractExists(ctx contractapi.TransactionContextInterface, contractID string) (bool, error) {
	contractJSON, err := ctx.GetStub().GetState(contractID)
	if err != nil {
		return false, fmt.Errorf("failed to read contract %s from world state: %v", contractID, err)
	}

	return contractJSON != nil, nil
}

// CreateAuditLog creates a new audit log entry
func (c *ContractManagementContract) CreateAuditLog(ctx contractapi.TransactionContextInterface, auditLogID string, auditLogData AuditLog) error {
	auditLogJSON, err := json.Marshal(auditLogData)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(auditLogID, auditLogJSON)
}

// GetAuditLogs returns audit logs for a specific entity or all audit logs
func (c *ContractManagementContract) GetAuditLogs(ctx contractapi.TransactionContextInterface, entityID string) ([]*AuditLog, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var auditLogs []*AuditLog
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var auditLog AuditLog
		err = json.Unmarshal(queryResponse.Value, &auditLog)
		if err != nil {
			return nil, err
		}

		// Only include audit logs
		if auditLog.ID != "" && auditLog.Action != "" {
			// If entityID is provided, filter by entity
			if entityID == "" || auditLog.EntityID == entityID {
				auditLogs = append(auditLogs, &auditLog)
			}
		}
	}

	return auditLogs, nil
}

func main() {
	contractManagementContract, err := contractapi.NewChaincode(&ContractManagementContract{})
	if err != nil {
		fmt.Printf("Error creating contract management chaincode: %v", err)
		return
	}

	if err := contractManagementContract.Start(); err != nil {
		fmt.Printf("Error starting contract management chaincode: %v", err)
	}
}
