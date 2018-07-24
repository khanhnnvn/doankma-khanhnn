const shim = require('fabric-shim')
const ClientIdentity = require('fabric-shim').ClientIdentity;


class Person {
    /**
     * 
     * @param {string} clientId 
     * @param {string} name 
     * @param {string} address 
     * @param {string} population 
     * @param {string} resident 
     * @param {string} profile_status 
     * @param {string} description 
     * @param {string} creator 
     */
    constructor(clientId, name, address, population, resident, profile_status, description, creator) {
        this.clientId = clientId;
        this.name = name
        this.address = address
        this.population = population
        this.resident = resident
        this.profile_status = profile_status
        this.description = description
        this.creator = creator
    }

    toString() {
        console.log('Name: ' + this.name + '\nCLient ID: ' + this.clientId + '\nCreator: ' + this.creator);
    }
}


let Chaincode = class {

    async Init(stub) {
        return shim.success();
    }

    async Invoke(stub) {
        let client_id = new ClientIdentity(stub);
        let txn = stub.getTxID()
        let creator = stub.getCreator()
        let channelID = stub.getChannelID()
        client_id = client_id.getID()
        client_id = client_id.match('(\/CN=).+(::\/)')[0].replace('/CN=', '').replace('::/', '')
        console.log('================== INFORMATION ===================')
        console.log('client id: ' + client_id)
        console.log('txn: ' + txn)
        console.log('creator: ' + creator)
        console.log('channelID: ' + channelID)
        // Handler
        let ret = stub.getFunctionAndParameters();
        let method = this[ret.fcn];
        if (!method) {
            console.error('No function of name:' + ret.fcn + ' found');
            throw new Error('Received unknown function ' + ret.fcn + ' invocation');
        }
        try {
            let payload = await method(stub, ret.params, client_id);
            return shim.success(payload);
        } catch (err) {
            console.log(err);
            return shim.error(err);
        }
    }

    async createLoansDocument(stub, args, creator) {
        console.info('============= START : Create Loans Document ===========');
        if (args.length != 6) {
            throw new Error('Incorrect number of arguments. Expecting 5');
        }
        let person = {
            'clientId': args[0],
            'name': args[1],
            'address': args[2],
            'population': args[3],
            'resident': args[4],
            'profile_status': 'Lending',
            'description': args[5],
            'creator': creator
        }
        await stub.putState(person.clientId, Buffer.from(JSON.stringify(person)));
    }

    async queryPerson(stub, args, creator) {
        if (args.length != 1) {
            throw new Error('Incorrect number of arguments.');
        }
        let clientId = args[0];
        let personAsBytes = await stub.getState(clientId);
        if (!personAsBytes || personAsBytes.toString().length <= 0) {
            throw new Error('Client id ' + clientId + ' does not exist.');
        }
        return personAsBytes;
    }

    async changeProfileStatus(stub, args, creator) {
        console.info('============= START : Change Profile Status ===========');
        if (args.length != 1) {
            throw new Error('Incorrect number of arguments.');
        }
        let clientId = args[0];
        let personAsBytes = await stub.getState(clientId);
        let person = JSON.parse(personAsBytes);
        if (person.creator != creator) {
            throw new Error('User No permission');
        }
        person.profile_status = 'No lending';
        await stub.putState(clientId, Buffer.from(JSON.stringify(person)));
    }
};

shim.start(new Chaincode());