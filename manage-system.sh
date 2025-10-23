#!/bin/bash

# Contract Management System Control Script
# This script helps manage the Hyperledger Fabric network and application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Show usage
show_usage() {
    echo "Usage: $0 {start|stop|restart|status|logs|test}"
    echo ""
    echo "Commands:"
    echo "  start   - Start Hyperledger Fabric network and application server"
    echo "  stop    - Stop Hyperledger Fabric network and application server"
    echo "  restart - Restart Hyperledger Fabric network and application server"
    echo "  status  - Show status of Hyperledger Fabric network and application"
    echo "  logs    - Show logs from application server"
    echo "  test    - Test blockchain connection"
    echo ""
}

# Start Hyperledger Fabric network
start_fabric() {
    print_status "Starting Hyperledger Fabric network..."
    
    if [ ! -d "fabric-samples/test-network" ]; then
        print_error "Fabric samples not found. Please run setup-hyperledger.sh first."
        exit 1
    fi
    
    cd fabric-samples/test-network
    ./network.sh up createChannel
    
    # Deploy chaincode if not already deployed
    if ! peer lifecycle chaincode queryinstalled --output json | grep -q "contract-mgmt"; then
        print_status "Deploying chaincode..."
        peer lifecycle chaincode package contract-mgmt.tar.gz \
            --path ../../server/chaincode \
            --lang golang \
            --label contract-mgmt_1.0
        
        export CORE_PEER_TLS_ENABLED=true
        export CORE_PEER_LOCALMSPID="Org1MSP"
        export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
        export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
        export CORE_PEER_ADDRESS=localhost:7051
        
        peer lifecycle chaincode install contract-mgmt.tar.gz
        PACKAGE_ID=$(peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes[0].package_id')
        
        peer lifecycle chaincode approveformyorg \
            -o localhost:7050 \
            --ordererTLSHostnameOverride orderer.example.com \
            --channelID mychannel \
            --name contract-mgmt \
            --version 1.0 \
            --package-id $PACKAGE_ID \
            --sequence 1 \
            --tls \
            --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tls/ca.crt
        
        peer lifecycle chaincode commit \
            -o localhost:7050 \
            --ordererTLSHostnameOverride orderer.example.com \
            --channelID mychannel \
            --name contract-mgmt \
            --version 1.0 \
            --sequence 1 \
            --tls \
            --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tls/ca.crt
        
        # Initialize ledger
        peer chaincode invoke \
            -o localhost:7050 \
            --ordererTLSHostnameOverride orderer.example.com \
            --tls \
            --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tls/ca.crt \
            -C mychannel \
            -n contract-mgmt \
            --peerAddresses localhost:7051 \
            --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
            -c '{"function":"InitLedger","Args":[]}'
    fi
    
    cd ../..
    print_success "Hyperledger Fabric network started"
}

# Stop Hyperledger Fabric network
stop_fabric() {
    print_status "Stopping Hyperledger Fabric network..."
    
    if [ -d "fabric-samples/test-network" ]; then
        cd fabric-samples/test-network
        ./network.sh down
        cd ../..
        print_success "Hyperledger Fabric network stopped"
    else
        print_warning "Fabric samples not found"
    fi
}

# Start application server
start_server() {
    print_status "Starting application server..."
    
    cd server
    
    # Check if server is already running
    if pgrep -f "node.*index.js" > /dev/null; then
        print_warning "Application server is already running"
        return
    fi
    
    # Start server in background
    nohup npm start > ../logs/server.log 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > ../logs/server.pid
    
    # Wait a moment for server to start
    sleep 3
    
    # Check if server started successfully
    if kill -0 $SERVER_PID 2>/dev/null; then
        print_success "Application server started (PID: $SERVER_PID)"
    else
        print_error "Failed to start application server"
        exit 1
    fi
    
    cd ..
}

# Stop application server
stop_server() {
    print_status "Stopping application server..."
    
    if [ -f "logs/server.pid" ]; then
        SERVER_PID=$(cat logs/server.pid)
        if kill -0 $SERVER_PID 2>/dev/null; then
            kill $SERVER_PID
            print_success "Application server stopped"
        else
            print_warning "Application server was not running"
        fi
        rm -f logs/server.pid
    else
        print_warning "No server PID file found"
    fi
}

# Show status
show_status() {
    print_status "Checking system status..."
    
    # Check Docker containers
    echo ""
    echo "Docker Containers:"
    if docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(peer|orderer|ca)"; then
        print_success "Hyperledger Fabric containers are running"
    else
        print_warning "No Hyperledger Fabric containers found"
    fi
    
    # Check application server
    echo ""
    echo "Application Server:"
    if [ -f "logs/server.pid" ]; then
        SERVER_PID=$(cat logs/server.pid)
        if kill -0 $SERVER_PID 2>/dev/null; then
            print_success "Application server is running (PID: $SERVER_PID)"
        else
            print_warning "Application server PID file exists but process is not running"
        fi
    else
        print_warning "Application server is not running"
    fi
    
    # Check blockchain connection
    echo ""
    echo "Blockchain Connection:"
    cd server
    node -e "
        const blockchainService = require('./services/blockchainService');
        blockchainService.testConnection().then(connected => {
            if (connected) {
                console.log('✅ Blockchain connection: OK');
            } else {
                console.log('❌ Blockchain connection: FAILED');
            }
            process.exit(0);
        }).catch(err => {
            console.log('❌ Blockchain connection: ERROR -', err.message);
            process.exit(0);
        });
    " 2>/dev/null || print_warning "Could not test blockchain connection"
    cd ..
}

# Show logs
show_logs() {
    print_status "Showing application server logs..."
    
    if [ -f "logs/server.log" ]; then
        tail -f logs/server.log
    else
        print_warning "No server logs found"
    fi
}

# Test blockchain connection
test_blockchain() {
    print_status "Testing blockchain connection..."
    
    cd server
    node -e "
        const blockchainService = require('./services/blockchainService');
        blockchainService.initialize().then(async () => {
            console.log('✅ Blockchain service initialized');
            
            const status = await blockchainService.getNetworkStatus();
            console.log('Network Status:', JSON.stringify(status, null, 2));
            
            const contracts = await blockchainService.getAllContracts();
            console.log('Contracts found:', contracts.length);
            
            process.exit(0);
        }).catch(err => {
            console.error('❌ Blockchain test failed:', err.message);
            process.exit(1);
        });
    "
    cd ..
}

# Create logs directory
mkdir -p logs

# Main script logic
case "$1" in
    start)
        print_status "Starting Contract Management System..."
        start_fabric
        start_server
        print_success "System started successfully!"
        print_status "API available at: http://localhost:5000/api/blockchain"
        print_status "Frontend available at: http://localhost:3000"
        ;;
    stop)
        print_status "Stopping Contract Management System..."
        stop_server
        stop_fabric
        print_success "System stopped successfully!"
        ;;
    restart)
        print_status "Restarting Contract Management System..."
        stop_server
        stop_fabric
        sleep 2
        start_fabric
        start_server
        print_success "System restarted successfully!"
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    test)
        test_blockchain
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
