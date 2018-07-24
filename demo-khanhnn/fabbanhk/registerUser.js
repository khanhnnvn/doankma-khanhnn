class Register_User {

    /**
     * 
     * @param {string} account_user 
     * @param {string} account_admin 
     * @param {string} ca_hostname 
     * @param {string} ca_name 
     * @param {string} affiliation_org This is a name of org
     * @param {string} role This is 'client' or 'admin'
     */
    async main(account_user, account_admin, ca_hostname, ca_name, affiliation_org, role) {
        try {
            var Fabric_Client = require('fabric-client');
            var Fabric_CA_Client = require('fabric-ca-client');
            var path = require('path');
            var fabric_client = new Fabric_Client();
            var fabric_ca_client = null;
            var admin_user = null;
            var member_user = null;
            var store_path = path.join(__dirname, 'hfc-key-store');
            console.log(' Store path:'+store_path);

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

            let user_from_store = await fabric_client.getUserContext(account_admin, true);
            if (user_from_store && user_from_store.isEnrolled()) {
                console.log('Successfully loaded admin from persistence');
                admin_user = user_from_store;
            } else {
                throw new Error('Failed to get admin.... run enrollAdmin.js');
            }

            let secret = await fabric_ca_client.register({
                    enrollmentID: account_user,
                    affiliation: affiliation_org,
                    role: role
                },
                admin_user);
            console.log('Successfully registered user - secret.');

            let enrollment = await fabric_ca_client.enroll({
                enrollmentID: account_user,
                enrollmentSecret: secret
            })
            console.log('Successfully enrolled member user "user" ');

            let user = await fabric_client.createUser({
                username: account_user,
                mspid: 'Org1MSP',
                cryptoContent: {
                    privateKeyPEM: enrollment.key.toBytes(),
                    signedCertPEM: enrollment.certificate
                }
            })
            member_user = user;

            let check = await fabric_client.setUserContext(member_user);
            console.log('Successfully registered and enrolled and is ready to interact with the fabric network');
            return {
                'code': 200,
                'message': 'Successfully registered.'
            }
        } catch (error) {
            console.error('Failed to register: ' + error);
            if (error.toString().indexOf('Authorization') > -1) {
                console.error('Authorization failures may be caused by having admin credentials from a previous CA instance.\n' +
                    'Try again after deleting the contents of the store directory ' + store_path);
            }
            return {
                'code': 500,
                'message': 'Failed to register: ' + error
            }
        }

    }
}

module.exports.Register_User = new Register_User;

async function main() {
    let account_user = 'khaitranvan96@gmail.com'
    let account_admin = 'admin'
    let ca_hostname = 'http://localhost:7054'
    let ca_name = 'ca.example.com'
    let register = new Register_User()
    let result = await register.main(account_user = account_user,
        account_admin = account_admin,
        ca_hostname = ca_hostname,
        ca_name = ca_name,
        affiliation_org = 'org1.department1',
        role = 'client'
    )
    console.log('result: %j', result)
}

if (typeof require != 'undefined' && require.main == module) {
    main()
}