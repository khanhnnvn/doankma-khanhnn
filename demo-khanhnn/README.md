[//]: # (SPDX-License-Identifier: CC-BY-4.0)

## Hyperledger Fabric Samples

Please visit the [installation instructions](http://hyperledger-fabric.readthedocs.io/en/latest/install.html)
to ensure you have the correct prerequisites installed. Please use the
version of the documentation that matches the version of the software you
intend to use to ensure alignment.

## Download Binaries and Docker Images

The [`scripts/bootstrap.sh`](https://github.com/hyperledger/fabric-samples/blob/release-1.1/scripts/bootstrap.sh)
script will preload all of the requisite docker
images for Hyperledger Fabric and tag them with the 'latest' tag. Optionally,
specify a version for fabric, fabric-ca and thirdparty images. Default versions
are 1.1.0, 1.1.0 and 0.4.7 respectively.

```bash
./scripts/bootstrap.sh [version] [ca version] [thirdparty_version]
```

# Shim node.js: https://fabric-shim.github.io/index.html
# SDK for Node.js: https://fabric-sdk-node.github.io/