#!/bin/bash

# Hyperledger Fabric Setup Script
# This script sets up Hyperledger Fabric test network for contract management system

set -e

echo "🚀 Starting Hyperledger Fabric Setup..."

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

# Check if Docker is running
check_docker() {
    print_status "Checking Docker..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if Docker Compose is available
check_docker_compose() {
    print_status "Checking Docker Compose..."
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Download Hyperledger Fabric
download_fabric() {
    print_status "Downloading Hyperledger Fabric..."
    
    if [ ! -d "fabric-samples" ]; then
        print_status "Downloading Fabric binaries and Docker images..."
        curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.4.0 1.5.0
        print_success "Fabric downloaded successfully"
    else
        print_warning "Fabric samples directory already exists, skipping download"
    fi
}

# Setup test network
setup_test_network() {
    print_status "Setting up test network..."
    
    cd fabric-samples/test-network
    
    # Stop any existing network
    print_status "Stopping existing network..."
    ./network.sh down || true
    
    # Start network
    print_status "Starting network..."
    ./network.sh up createChannel
    
    print_success "Test network is running"
}

# Deploy chaincode
deploy_chaincode() {
    print_status "Deploying contract management chaincode..."
    
    cd fabric-samples/test-network
    
    # Package chaincode
    print_status "Packaging chaincode..."
    peer lifecycle chaincode package contract-mgmt.tar.gz \
        --path ../../server/chaincode \
        --lang golang \
        --label contract-mgmt_1.0
    
    # Install chaincode on peer0.org1
    print_status "Installing chaincode on peer0.org1..."
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
    
    peer lifecycle chaincode install contract-mgmt.tar.gz
    
    # Get package ID
    PACKAGE_ID=$(peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes[0].package_id')
    
    # Approve chaincode
    print_status "Approving chaincode..."
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
    
    # Commit chaincode
    print_status "Committing chaincode..."
    peer lifecycle chaincode commit \
        -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --channelID mychannel \
        --name contract-mgmt \
        --version 1.0 \
        --sequence 1 \
        --tls \
        --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tls/ca.crt
    
    print_success "Chaincode deployed successfully"
}

# Initialize chaincode
initialize_chaincode() {
    print_status "Initializing chaincode..."
    
    cd fabric-samples/test-network
    
    # Set environment variables
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
    
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
    
    print_success "Chaincode initialized successfully"
}

# Create wallet directory
create_wallet() {
    print_status "Creating wallet directory..."
    
    cd ../../server
    mkdir -p wallet
    print_success "Wallet directory created"
}

# Install server dependencies
install_dependencies() {
    print_status "Installing server dependencies..."
    
    cd server
    npm install
    print_success "Dependencies installed"
}

# Test blockchain connection
test_connection() {
    print_status "Testing blockchain connection..."
    
    cd server
    node -e "
        const blockchainService = require('./services/blockchainService');
        blockchainService.initialize().then(() => {
            console.log('✅ Blockchain service initialized successfully');
            process.exit(0);
        }).catch(err => {
            console.error('❌ Failed to initialize blockchain service:', err.message);
            process.exit(1);
        });
    "
}

# Main execution
main() {
    print_status "Starting Hyperledger Fabric setup for Contract Management System..."
    
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Setup Fabric
    download_fabric
    setup_test_network
    deploy_chaincode
    initialize_chaincode
    
    # Setup application
    create_wallet
    install_dependencies
    
    # Test connection
    test_connection
    
    print_success "🎉 Hyperledger Fabric setup completed successfully!"
    print_status "You can now start the server with: cd server && npm start"
    print_status "API will be available at: http://localhost:5000/api/blockchain"
}

# Run main function
main "$@"
