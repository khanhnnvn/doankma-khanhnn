class Invoke {

    async main(account_user, person, action, channel_name, chaincodeId, chainId, url_peer, url_order) {
        try {
            var Fabric_Client = require('fabric-client');
            var util = require('util');
            var path = require('path');
            var store_path = path.join(__dirname, 'hfc-key-store');
            console.log(' Store path:' + store_path);
            // setup the fabric network
            var fabric_client = new Fabric_Client();
            var channel = fabric_client.newChannel(channel_name);
            var peer = fabric_client.newPeer(url_peer);
            channel.addPeer(peer);
            var order = fabric_client.newOrderer(url_order)
            channel.addOrderer(order);

            let state_store = await Fabric_Client.newDefaultKeyValueStore({
                path: store_path
            })
            fabric_client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            var crypto_store = Fabric_Client.newCryptoKeyStore({
                path: store_path
            })
            crypto_suite.setCryptoKeyStore(crypto_store)
            fabric_client.setCryptoSuite(crypto_suite)

            let user_from_store = await fabric_client.getUserContext(account_user, true)
            if (user_from_store && user_from_store.isEnrolled()) {
                console.log('Successfully loaded user from persistence');
                var member_user = user_from_store;
            } else {
                throw new Error('Failed to get user .... run registerUser.js');
            }
            var tx_id = fabric_client.newTransactionID();
            console.log("Assigning transaction_id: ", tx_id._transaction_id);
            var request = {
                chaincodeId: chaincodeId,
                fcn: action,
                args: Object.keys(person).map(function (key) {
                    return person[key]
                }),
                chainId: chainId,
                txId: tx_id
            }

            var results = await channel.sendTransactionProposal(request);
            var proposalResponses = results[0];
            var proposal = results[1];
            let isProposalGood = false;
            if (proposalResponses && proposalResponses[0].response &&
                proposalResponses[0].response.status === 200) {
                isProposalGood = true;
                console.log('Transaction proposal was good');
            } else {
                console.error('Transaction proposal was bad');
            }
            if (isProposalGood) {
                console.log(util.format(
                    'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
                    proposalResponses[0].response.status, proposalResponses[0].response.message));

                // build up the request for the orderer to have the transaction committed
                var request = {
                    proposalResponses: proposalResponses,
                    proposal: proposal
                };

                // set the transaction listener and set a timeout of 30 sec
                // if the transaction did not get committed within the timeout period,
                // report a TIMEOUT status
                var transaction_id_string = tx_id.getTransactionID(); //Get the transaction ID string to be used by the event processing
                var promises = [];

                var sendPromise = channel.sendTransaction(request);
                promises.push(sendPromise); //we want the send transaction first, so that we know where to check status

                // get an eventhub once the fabric client has a user assigned. The user
                // is required bacause the event registration must be signed
                let event_hub = channel.newChannelEventHub();
                // event_hub.setPeerAddr('grpc://localhost:7053');

                // using resolve the promise so that result status may be processed
                // under the then clause rather than having the catch clause process
                // the status
                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(() => {
                        event_hub.disconnect();
                        resolve({
                            event_status: 'TIMEOUT'
                        }); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
                    }, 3000);
                    event_hub.connect();
                    event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
                        // this is the callback for transaction event status
                        // first some clean up of event listener
                        clearTimeout(handle);
                        event_hub.unregisterTxEvent(transaction_id_string);
                        event_hub.disconnect();

                        // now let the application know what happened
                        var return_status = {
                            event_status: code,
                            tx_id: transaction_id_string
                        };
                        if (code !== 'VALID') {
                            console.error('The transaction was invalid, code = ' + code);
                            resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
                        } else {
                            console.log('The transaction has been committed on peer ' + event_hub.getPeerAddr());
                            resolve(return_status);
                        }
                    }, (err) => {
                        //this is the callback if something goes wrong with the event registration or processing
                        reject(new Error('There was a problem with the eventhub ::' + err));
                    });
                });
                promises.push(txPromise);
                results = await Promise.all(promises);
            } else {
                console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
                throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
            }
            console.log('Send transaction promise and event listener promise have completed');
            if (results && results[0] && results[0].status === 'SUCCESS') {
                console.log('Successfully sent transaction to the orderer.');
            } else {
                console.error('Failed to order the transaction. Error code: ' + results[0].status);
            }

            if (results && results[1] && results[1].event_status === 'VALID') {
                console.log('Successfully committed the change to the ledger by the peer');
                return {
                    'code': 200,
                    'message': 'Successfully committed the change to the ledger by the peer.'
                }
            } else {
                console.log('Transaction failed to be committed to the ledger due to ::' + results[1].event_status);
            }
        } catch (error) {
            console.error('Failed to invoke successfully :: ' + error);
            return {
                'code': 500,
                'message': 'Failed to invoke successfully :: ' + error
            }
        }
    }
}


module.exports.Invoke = new Invoke()

async function main() {
    let account_user = 'khaitranvan96@gmail.com'
    let person = {
        client_id: '12345678911',
        name: 'khai',
        address: 'Ha Noi',
        population: 'Ha Noi',
        resident: 'Ha Noi',
        description: 'Ahihi'
    }
    let channel_name = 'mychannel'
    let chaincodeId = 'fabbank'
    let url_peer = 'grpc://localhost:7051'
    let url_order = 'grpc://localhost:7050'
    let action = 'createLoansDocument'
    // action = 'changeProfileStatus'
    // person = {
    //     client_id: '123456789'
    // }
    let invoke = new Invoke()
    let result = await invoke.main(account_user = account_user,
        person = person,
        action = action,
        channel_name = channel_name,
        chaincodeId = chaincodeId,
        chainId = chaincodeId,
        url_peer = url_peer,
        url_order = url_order
    )
    console.log('result: %j', result)
}


if (typeof require != 'undefined' && require.main == module) {
    main()
}