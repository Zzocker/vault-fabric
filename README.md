# Vault Fabric

## Fabric Test Network

### [network.sh](network/network.sh)

```bash
    [INFO ] 1. up : start fabric network with one peer and orderer
    [INFO ] 2. clean : removes folders and running docker containers
    [INFO ] 3. installCC : install basic-transfer chaicnode, only called once
    [INFO ] 4. updateCC : update basic-transfer chaicnode
```

### Start Test Network

```bash
    cd network
    ./network.sh up
```

### Clean Up Test Network

```bash
    cd network
    ./network.sh clean
```

CouchDb UI interface at <http://localhost:5984/_utils/>

Vault UI Interface at <http://localhost:8200/>

## Vault

### Sign in to Vault

1. use `Token` method for Signing
2. Test Token = `tokenId` (for this test setup)
