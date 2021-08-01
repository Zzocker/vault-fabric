#/bin/bash

export PATH=${PWD}/bin:${PWD}:$PATH
source ./scripts/logger.sh
CC_NAME="basic-transfer"

set -e

function printHelp(){
    info "1. up : start fabric network with one peer and orderer"
    info "2. clean : removes folders and running docker containers"
    info "3. installCC : install $CC_NAME chaicnode, only called once"
    info "4. updateCC : update $CC_NAME chaicnode"
}

function generateCrypto(){
    info "generateing cryptos for network"
    cryptogen generate --config crypto-config.yaml
    if [ $? != 0 ];then
        error "failed to generate crypto"
        exit 
    fi
    # fix private key of ca
    mv crypto-config/peerOrganizations/devorg.com/ca/*_sk crypto-config/peerOrganizations/devorg.com/ca/priv_sk
}

function generateArtifacts(){
    info "generating genesis block"
    configtxgen --outputBlock artifacts/genesis.block -channelID sys -profile Genesis
    if [ $? != 0 ];then
        error "failed to generate genesis block"
        exit
    fi
    info "generating create channel tx"
    configtxgen -outputCreateChannelTx artifacts/chanenl.tx -profile DevChannel -channelID devchannel
    if [ $? != 0 ];then
        error "failed to generate create channel tx"
        exit
    fi
}

function joinChannel(){
    info "creating devchannel"
    docker exec -it cli peer channel create -f /artifacts/chanenl.tx -c devchannel -o orderer:7050 --outputBlock /tmp/devchannel.block
    if [ $? != 0 ];then
        errro "failed to create devchannel"
        exit
    fi
    echo ""
    echo ""
    info "joinning devchannel"
    docker exec -it cli peer channel join -b /tmp/devchannel.block
    if [ $? != 0 ];then
        errro "failed to join devchannel"
        exit
    fi
}

function updateCC(){
    VERSION=1
    for VERSION in {1..50}
    do
        exists=$(docker exec -it cli peer chaincode list --installed | grep "Version: ${VERSION}")
        if [ "$exists" == "" ];then
            break
        fi
    done
    info "installing $CC_NAME chaincode with version ${VERSION}"
    docker exec -it cli peer chaincode install -n $CC_NAME -p github.com/Zzocker/abc/chaincode -v $VERSION
    if [ $? != 0 ];then
        errro "failed to install chaincode"
        exit
    fi
    info "instantiating chaincode"
    docker exec -it cli peer chaincode upgrade -C devchannel -n $CC_NAME -v $VERSION -c '{"args":[]}'
    if [ $? != 0 ];then
        errro "failed to upgrade chaincode"
        exit
    fi
}


function installCC(){
    info "installing $CC_NAME chaincode with version ${VERSION}"
    docker exec -it cli peer chaincode install -n $CC_NAME -p github.com/Zzocker/abc/chaincode -v 1
    if [ $? != 0 ];then
        errro "failed to install chaincode"
        exit
    fi
    info "instantiating chaincode"
    docker exec -it cli peer chaincode instantiate -C devchannel -n $CC_NAME -v 1 -c '{"args":[]}'
    if [ $? != 0 ];then
        errro "failed to instantiate chaincode"
        exit
    fi
    docker exec -it cli peer chaincode invoke -C devchannel -n basic-transfer -c '{"args" : ["InitLedger"]}' 
}

function cleanFolders(){
    rm -r crypto-config
    rm -r artifacts/*
    rm -r ../default/wallet
}

function cleanDocker(){
    set +e
    docker rm -f cli devpeer orderer ca db
    docker rm -f $(docker ps -f "name=dev-*" -aq)
    docker volume prune
    docker rm -f vault
    docker image rm -f $(docker images dev-* -q) 
}


OPTION=$1

case $OPTION in

    "up")
        # starting vault server for development
        docker run --rm --name vault -d \
        --cap-add=IPC_LOCK \
        -p 8200:8200 \
        -e 'VAULT_DEV_ROOT_TOKEN_ID=tokenId' \
        -e 'VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200' vault

        # generate crypto files for development
        generateCrypto
        generateArtifacts
        # create vendor folder required for fabric v1.4
        cd chaincode
        go mod vendor
        cd ..
        ##############################################################
        ##############################################################
        docker-compose up -d
        sleep 10
        joinChannel
        sleep 5
        installCC
    ;;

    "clean")
        cleanFolders
        cleanDocker
    ;;

    "installCC")
        installCC
    ;;

    "updateCC")
        updateCC
    ;;
    "stop")
        docker-compose stop
    ;;
    "resume")
        docker restart
    ;;

    *)
        errro "no option by name ${OPTION} is not supported"
        printHelp
    ;;

esac

