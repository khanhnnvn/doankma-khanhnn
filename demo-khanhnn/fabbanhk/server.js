var enrollAdmin = require('./enrollAdmin')
var registerUser = require('./registerUser')
var invoke = require('./invoke')
var query = require('./query')
var express = require('express')
var app = express()
app.use(express.json())


app.post('/query', async (request, response) => {
    try {
        data_request = request.body
        console.log(data_request);
        let account_user = data_request.account_user
        let person = data_request.person
        let channel_name = data_request.channel_name
        let chaincodeId = data_request.chaincodeId
        let url_peer = data_request.url_peer
        result = await query.Query.main(account_user = account_user,
            person = person,
            channel_name = channel_name,
            chaincodeId = chaincodeId,
            url_peer = url_peer
        )
        console.log('==> ' + new Date() + ':: /query' + ' <==\n')
        response.json(result)
    } catch (error) {
        response.end(error)
    }
})

app.post('/enrollAdmin', async (request, response) => {
    try {
        data_request = request.body
        console.log(data_request);
        let account = data_request.account
        let password = data_request.password
        let ca_hostname = data_request.ca_hostname
        let ca_name = data_request.ca_name
        result = await enrollAdmin.Enroll_Admin.main(account, password, ca_hostname, ca_name)
        console.log('==> ' + new Date() + ':: /enrollAdmin' + ' <==\n')
        response.json(result)
    } catch (error) {
        response.end(error)
    }
})


app.post('/registerUser', async (request, response) => {
    try {
        data_request = request.body
        console.log(data_request);
        let account_user = data_request.account_user
        let account_admin = data_request.account_admin
        let ca_hostname = data_request.ca_hostname
        let ca_name = data_request.ca_name
        let result = await registerUser.Register_User.main(account_user = account_user,
            account_admin = account_admin,
            ca_hostname = ca_hostname,
            ca_name = ca_name,
            affiliation_org = 'org1.department1',
            role = 'client'
        )
        console.log('==> ' + new Date() + ':: /registerUser' + ' <==\n')
        response.json(result)
    } catch (error) {
        response.end(error)
    }

})

app.post('/invoke/createLoansDocument', async (request, response) => {
    try {
        data_request = request.body
        console.log(data_request);
        let account_user = data_request.account_user
        let person = data_request.person
        let channel_name = data_request.channel_name
        let chaincodeId = data_request.chaincodeId
        let url_peer = data_request.url_peer
        let url_order = data_request.url_order
        let action = 'createLoansDocument'
        let result = await invoke.Invoke.main(account_user = account_user,
            person = person,
            action = action,
            channel_name = channel_name,
            chaincodeId = chaincodeId,
            chainId = chaincodeId,
            url_peer = url_peer,
            url_order = url_order
        )
        console.log('==> ' + new Date() + ':: /invoke/createLoansDocument' + ' <==\n')
        response.json(result)
    } catch (error) {
        response.end(error)
    }
})

app.post('/invoke/changeProfileStatus', async (request, response) => {
    try {
        data_request = request.body
        console.log(data_request);
        let account_user = data_request.account_user
        let person = data_request.person
        let channel_name = data_request.channel_name
        let chaincodeId = data_request.chaincodeId
        let url_peer = data_request.url_peer
        let url_order = data_request.url_order
        let action = 'changeProfileStatus'
        let result = await invoke.Invoke.main(account_user = account_user,
            person = person,
            action = action,
            channel_name = channel_name,
            chaincodeId = chaincodeId,
            chainId = chaincodeId,
            url_peer = url_peer,
            url_order = url_order
        )
        console.log('==> ' + new Date() + ':: /invoke/changeProfileStatus' + ' <==\n')
        response.json(result)
    } catch (error) {
        response.end(error)
    }
})


var server = app.listen(8080, '0.0.0.0', async () => {
    var host = server.address().address
    var port = server.address().port
    console.log('====================  START SERVER  ===================')
    console.log('* Running on http://%s:%s (Press CTRL+C to quit)', host, port)
    console.log('* Create time of ' + new Date() + '\n')
})
