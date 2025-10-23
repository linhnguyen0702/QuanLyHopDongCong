@echo off
REM Contract Management System Control Script for Windows
REM This script helps manage the Hyperledger Fabric network and application

setlocal enabledelayedexpansion

if "%1"=="" (
    echo Usage: %0 {start^|stop^|restart^|status^|test}
    echo.
    echo Commands:
    echo   start   - Start Hyperledger Fabric network and application server
    echo   stop    - Stop Hyperledger Fabric network and application server
    echo   restart - Restart Hyperledger Fabric network and application server
    echo   status  - Show status of Hyperledger Fabric network and application
    echo   test    - Test blockchain connection
    echo.
    exit /b 1
)

REM Create logs directory
if not exist logs mkdir logs

if "%1"=="start" (
    echo [INFO] Starting Contract Management System...
    call :start_fabric
    call :start_server
    echo [SUCCESS] System started successfully!
    echo [INFO] API available at: http://localhost:5000/api/blockchain
    echo [INFO] Frontend available at: http://localhost:3000
    goto :eof
)

if "%1"=="stop" (
    echo [INFO] Stopping Contract Management System...
    call :stop_server
    call :stop_fabric
    echo [SUCCESS] System stopped successfully!
    goto :eof
)

if "%1"=="restart" (
    echo [INFO] Restarting Contract Management System...
    call :stop_server
    call :stop_fabric
    timeout /t 2 /nobreak >nul
    call :start_fabric
    call :start_server
    echo [SUCCESS] System restarted successfully!
    goto :eof
)

if "%1"=="status" (
    call :show_status
    goto :eof
)

if "%1"=="test" (
    call :test_blockchain
    goto :eof
)

echo Unknown command: %1
exit /b 1

:start_fabric
echo [INFO] Starting Hyperledger Fabric network...
if not exist fabric-samples\test-network (
    echo [ERROR] Fabric samples not found. Please run setup first.
    exit /b 1
)
cd fabric-samples\test-network
call network.sh up createChannel
cd ..\..
echo [SUCCESS] Hyperledger Fabric network started
goto :eof

:stop_fabric
echo [INFO] Stopping Hyperledger Fabric network...
if exist fabric-samples\test-network (
    cd fabric-samples\test-network
    call network.sh down
    cd ..\..
    echo [SUCCESS] Hyperledger Fabric network stopped
) else (
    echo [WARNING] Fabric samples not found
)
goto :eof

:start_server
echo [INFO] Starting application server...
cd server

REM Check if server is already running
tasklist /FI "IMAGENAME eq node.exe" /FI "WINDOWTITLE eq *index.js*" 2>nul | find /I "node.exe" >nul
if %ERRORLEVEL%==0 (
    echo [WARNING] Application server is already running
    cd ..
    goto :eof
)

REM Start server
start /B npm start > ..\logs\server.log 2>&1
cd ..
echo [SUCCESS] Application server started
goto :eof

:stop_server
echo [INFO] Stopping application server...
taskkill /F /IM node.exe 2>nul
echo [SUCCESS] Application server stopped
goto :eof

:show_status
echo [INFO] Checking system status...
echo.
echo Docker Containers:
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | findstr /E "peer orderer ca" 2>nul
if %ERRORLEVEL%==0 (
    echo [SUCCESS] Hyperledger Fabric containers are running
) else (
    echo [WARNING] No Hyperledger Fabric containers found
)

echo.
echo Application Server:
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /I "node.exe" >nul
if %ERRORLEVEL%==0 (
    echo [SUCCESS] Application server is running
) else (
    echo [WARNING] Application server is not running
)

echo.
echo Blockchain Connection:
cd server
node -e "const blockchainService = require('./services/blockchainService'); blockchainService.testConnection().then(connected => { if (connected) { console.log('✅ Blockchain connection: OK'); } else { console.log('❌ Blockchain connection: FAILED'); } process.exit(0); }).catch(err => { console.log('❌ Blockchain connection: ERROR -', err.message); process.exit(0); });" 2>nul
cd ..
goto :eof

:test_blockchain
echo [INFO] Testing blockchain connection...
cd server
node -e "const blockchainService = require('./services/blockchainService'); blockchainService.initialize().then(async () => { console.log('✅ Blockchain service initialized'); const status = await blockchainService.getNetworkStatus(); console.log('Network Status:', JSON.stringify(status, null, 2)); const contracts = await blockchainService.getAllContracts(); console.log('Contracts found:', contracts.length); process.exit(0); }).catch(err => { console.error('❌ Blockchain test failed:', err.message); process.exit(1); });"
cd ..
goto :eof
