const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchainService');
const { body, validationResult } = require('express-validator');

// Initialize blockchain service
let blockchainInitialized = false;

const initializeBlockchain = async () => {
  if (!blockchainInitialized) {
    try {
      await blockchainService.initialize();
      blockchainInitialized = true;
      console.log('Blockchain service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
    }
  }
};

// Initialize blockchain on startup
initializeBlockchain();

// Middleware to check blockchain connection
const checkBlockchainConnection = async (req, res, next) => {
  try {
    const isConnected = await blockchainService.testConnection();
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Blockchain service is not available'
      });
    }
    next();
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: 'Blockchain service error',
      error: error.message
    });
  }
};

// Get blockchain network status
router.get('/status', async (req, res) => {
  try {
    const status = await blockchainService.getNetworkStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get blockchain status',
      error: error.message
    });
  }
});

// Create contract on blockchain
router.post('/contracts', 
  checkBlockchainConnection,
  [
    body('id').notEmpty().withMessage('Contract ID is required'),
    body('title').notEmpty().withMessage('Contract title is required'),
    body('contractor').notEmpty().withMessage('Contractor is required'),
    body('value').isNumeric().withMessage('Value must be a number'),
    body('startDate').isISO8601().withMessage('Start date must be valid'),
    body('endDate').isISO8601().withMessage('End date must be valid'),
    body('status').notEmpty().withMessage('Status is required'),
    body('createdBy').notEmpty().withMessage('Created by is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const contractData = req.body;
      const result = await blockchainService.createContract(contractData);
      
      res.json({
        success: true,
        message: 'Contract created successfully on blockchain',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create contract on blockchain',
        error: error.message
      });
    }
  }
);

// Update contract on blockchain
router.put('/contracts/:id',
  checkBlockchainConnection,
  [
    body().notEmpty().withMessage('Update data is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const contractId = req.params.id;
      const updates = req.body;
      
      const result = await blockchainService.updateContract(contractId, updates);
      
      res.json({
        success: true,
        message: 'Contract updated successfully on blockchain',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update contract on blockchain',
        error: error.message
      });
    }
  }
);

// Get contract from blockchain
router.get('/contracts/:id', checkBlockchainConnection, async (req, res) => {
  try {
    const contractId = req.params.id;
    const contract = await blockchainService.getContract(contractId);
    
    res.json({
      success: true,
      data: contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get contract from blockchain',
      error: error.message
    });
  }
});

// Get all contracts from blockchain
router.get('/contracts', checkBlockchainConnection, async (req, res) => {
  try {
    const contracts = await blockchainService.getAllContracts();
    
    res.json({
      success: true,
      data: contracts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get contracts from blockchain',
      error: error.message
    });
  }
});

// Create audit log on blockchain
router.post('/audit-logs',
  checkBlockchainConnection,
  [
    body('id').notEmpty().withMessage('Audit log ID is required'),
    body('action').notEmpty().withMessage('Action is required'),
    body('entityType').notEmpty().withMessage('Entity type is required'),
    body('entityId').notEmpty().withMessage('Entity ID is required'),
    body('userId').notEmpty().withMessage('User ID is required'),
    body('timestamp').notEmpty().withMessage('Timestamp is required'),
    body('details').notEmpty().withMessage('Details is required'),
    body('ipAddress').notEmpty().withMessage('IP address is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const auditData = req.body;
      const result = await blockchainService.createAuditLog(auditData);
      
      res.json({
        success: true,
        message: 'Audit log created successfully on blockchain',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create audit log on blockchain',
        error: error.message
      });
    }
  }
);

// Get audit logs from blockchain
router.get('/audit-logs', checkBlockchainConnection, async (req, res) => {
  try {
    const entityId = req.query.entityId || null;
    const auditLogs = await blockchainService.getAuditLogs(entityId);
    
    res.json({
      success: true,
      data: auditLogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs from blockchain',
      error: error.message
    });
  }
});

// Test blockchain connection
router.get('/test', async (req, res) => {
  try {
    const isConnected = await blockchainService.testConnection();
    res.json({
      success: true,
      connected: isConnected,
      message: isConnected ? 'Blockchain connection successful' : 'Blockchain connection failed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      connected: false,
      message: 'Blockchain connection test failed',
      error: error.message
    });
  }
});

// Generate contract ID
router.get('/generate-contract-id', (req, res) => {
  try {
    const contractId = blockchainService.generateContractId();
    res.json({
      success: true,
      data: { contractId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate contract ID',
      error: error.message
    });
  }
});

module.exports = router;
