class Enroll_Admin {
    /**
     * 
     * @param {string} account This is account admin
     * @param {string} password 
     * @param {string} ca_hostname 
     * @param {string} ca_name 
     */

    async main(account, password, ca_hostname, ca_name) {
        try {
            let Fabric_Client = require('fabric-client')
            let Fabric_CA_Client = require('fabric-ca-client')
            let path = require('path')
            let fabric_client = new Fabric_Client()
            let fabric_ca_client = null
            let admin_user = null
            let store_path = path.join(__dirname, 'hfc-key-store')
            console.log(' Store path:' + store_path);

            let state_store = await Fabric_Client.newDefaultKeyValueStore({
                path: store_path
            })
            fabric_client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            var crypto_store = Fabric_Client.newCryptoKeyStore({
                path: store_path
            });
            crypto_suite.setCryptoKeyStore(crypto_store);
            fabric_client.setCryptoSuite(crypto_suite);
            var tlsOptions = {
                trustedRoots: [],
                verify: false
            };
            fabric_ca_client = new Fabric_CA_Client(ca_hostname, tlsOptions, ca_name, crypto_suite);
            let user_from_store = await fabric_client.getUserContext(account, true);
            if (user_from_store && user_from_store.isEnrolled()) {
                console.log('Successfully loaded admin from persistence');
                return {
                    'code': 200,
                    'message': 'Successfully loaded admin from persistence.'
                }
            } else {
                let enrollment = await fabric_ca_client.enroll({
                    enrollmentID: account,
                    enrollmentSecret: password
                })
                console.log('Successfully enrolled admin user "admin"');
                let user = await fabric_client.createUser({
                    username: account,
                    mspid: 'Org1MSP',
                    cryptoContent: {
                        privateKeyPEM: enrollment.key.toBytes(),
                        signedCertPEM: enrollment.certificate
                    }
                })
                admin_user = user;
                let check = await fabric_client.setUserContext(admin_user);
                console.log('Assigned the admin user to the fabric client ::' + admin_user.toString());
                return {
                    'code': 200,
                    'message': 'Assigned the admin success.'
                }
            }
        } catch (error) {
            console.error('Failed to enroll admin: ' + error);
            return {
                'code': 500,
                'message': 'Failed to enroll admin: ' + error
            }
        }
    }
}
module.exports.Enroll_Admin = new Enroll_Admin()


async function main() {
    let account = 'admin'
    let password = 'adminpw'
    let ca_hostname = 'http://localhost:7054'
    let ca_name = 'ca.example.com'
    let enroll = new Enroll_Admin()
    let result = await enroll.main(account = account,
        password = password,
        ca_hostname = ca_hostname,
        ca_name = ca_name)
    console.log('result: %j', result)
}
if (typeof require != 'undefined' && require.main == module) {
    main()
}