class Query {
    /**
     *
     * @param {string} account_user
     * @param {JSON} person
     * @param {string} channel_name
     * @param {string} chaincodeId
     * @param {string} url_peer eg: 'grpc://localhost:7051'
     */
    async main(account_user, person, channel_name, chaincodeId, url_peer) {
        try {
            var Fabric_Client = require('fabric-client');
            var path = require('path');
            var fabric_client = new Fabric_Client();
            var member_user = null;
            var store_path = path.join(__dirname, 'hfc-key-store');
            console.log('Store path:' + store_path);
            // setup the fabric network
            var channel = fabric_client.newChannel(channel_name);
            var peer = fabric_client.newPeer(url_peer);
            channel.addPeer(peer);
            let state_store = await Fabric_Client.newDefaultKeyValueStore({
                path: store_path
            });

            fabric_client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            var crypto_store = Fabric_Client.newCryptoKeyStore({
                path: store_path
            });
            crypto_suite.setCryptoKeyStore(crypto_store);
            fabric_client.setCryptoSuite(crypto_suite);

            let user_from_store = await fabric_client.getUserContext(account_user, true);

            if (user_from_store && user_from_store.isEnrolled()) {
                console.log('Successfully loaded user from persistence');
                member_user = user_from_store;
            } else {
                throw new Error('Failed to get user.... run registerUser.js');
            }
            const request = {
                chaincodeId: chaincodeId,
                fcn: 'queryPerson',
                args: Object.keys(person).map(function (key) {
                    return person[key]
                })
            };
            // send the query proposal to the peer
            let query_responses = await channel.queryByChaincode(request);
            console.log("Query has completed, checking results");
            if (query_responses && query_responses.length == 1) {
                if (query_responses[0] instanceof Error) {
                    let result = "error from query = " + query_responses[0]
                    console.error(result);
                    return result
                } else {
                    let result = "Response is " + query_responses[0].toString()
                    console.log(result);
                    return result
                }
            } else {
                let result = "No payloads were returned from query"
                console.log(result);
                return result
            }
        } catch (error) {
            let message_error = 'Failed to query: ' + error
            console.error(message_error);
            return message_error
        }

    }
}

module.exports.Query = new Query;

async function main() {
    let account_user = 'khaitranvan96@gmail.com'
    let person = {
        'client_id': '123456789'
    }
    let channel_name = 'mychannel'
    let chaincodeId = 'fabbank'
    let url_peer = 'grpc://localhost:7051'
    var query = new Query()
    let result = await query.main(account_user = account_user,
        person = person,
        channel_name = channel_name,
        chaincodeId = chaincodeId,
        url_peer = url_peer
    )
    console.log('result: ' + result)
}

main()