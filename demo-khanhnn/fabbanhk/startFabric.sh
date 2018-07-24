#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)
LANGUAGE="node"
CC_SRC_PATH=/opt/gopath/src/github.com/fabbank/node

#{
	# clean the keystore
#	rm -rf ./hfc-key-store
	# Setting up your Dev Environment
#	docker rm -f $(docker ps -aq)
	# docker network prune -y
#	docker rmi dev-peer0.org1.example.com-fabbank-1.0-7622ab45b13cf16fd5d12e30512e4dd5a7b9802436bb53031580387b79052544
#}||{}
# launch network; create channel and join peer to channel
cd ../basic-network
./start.sh

# Now launch the CLI container in order to install, instantiate chaincode
docker-compose -f ./docker-compose.yml up -d cli

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n fabbank -v 1.0 -p "$CC_SRC_PATH" -l "$LANGUAGE"

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n fabbank -l "$LANGUAGE" -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member','Org2MSP.member')"
sleep 5
# docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n fabbank -c '{"function":"initLedger","Args":[""]}'

printf "\nTotal setup execution time : $(($(date +%s) - starttime)) secs ...\n\n\n"
printf "Start by installing required packages run 'npm install'\n"
printf "Then run 'node enrollAdmin.js', then 'node registerUser'\n\n"
printf "The 'node invoke.js' will fail until it has been updated with valid arguments\n"
printf "The 'node query.js' may be run at anytime once the user has been registered\n\n"
