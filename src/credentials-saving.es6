require('dotenv').load();
const fs = require('fs');
const path = require('path');
const csv = require("csvtojson");
const http = require('http');

_startProcess();

function _startProcess() {
    let filePath = path.join(process.cwd(), '/credentials.csv');
    console.log(filePath);

    if (!fs.existsSync(filePath)) { console.log("File not found"); return; }

    csv()
        .fromFile(filePath)
        .on("end_parsed", function (credentials) {
            if (!credentials || !credentials.length) { return; }
            _saveCredentials(credentials);
        });
}

async function _saveCredentials(credentials) {

    let credentialsLength = credentials.length;
    let groupments = {};

    let credentialsIndex = 0;

    let _recursiveSaving = function () {
        if (credentialsIndex >= credentialsLength) { return; }

        let credential = credentials[credentialsIndex];
        let credentialGrouping = credential.grouping.split('-');

        if (credentialGrouping && credentialGrouping.length) {
            let brokerCnpj = credentialGrouping[1];

            if (!groupments[brokerCnpj]) {
                groupments[brokerCnpj] = [];
            }

            groupments[brokerCnpj].push(credential);

        }

        credentialsIndex++;

        _recursiveSaving();
    }

    _recursiveSaving();

    for (let brokerCnpj in groupments) {
        let credentials = groupments[brokerCnpj];

        await _updateBrokerCredentials(brokerCnpj, credentials);
    }
}

async function _updateBrokerCredentials(brokerCnpj, credentials) {
    let credentialsLength = credentials.length;
    let credentialIndex = 0;
    let accesses = [];

    let _recursiveAccessCreation = async function () {
        if (credentialIndex >= credentialsLength) { return; }

        let credential = credentials[credentialIndex];

        if (credential.username && credential.password) {
            let credential = credentials[credentialIndex];
            let insurerId = credential.name.replace(/ /g, "").toLowerCase();
            let access = {
                seguradoraId: insurerId,
                usuario: credential.username,
                password: credential.password
            };

            await accesses.push(access);
        }

        credentialIndex++;
        _recursiveAccessCreation();
    }

    _recursiveAccessCreation();
    if (!accesses.length) { return; }

    let req = http.request({
        "method": "PUT",
        "hostname": process.env.API_SECURITY_HOSTNAME,
        "port": process.env.API_SECURITY_PORT,
        "path": `/acessos/${brokerCnpj}`,
        "headers": {
            "content-type": "application/json",
            "authorization": process.env.API_SECURITY_AUTHTOKEN,
        }
    }, function (res) {
        let chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            let body = Buffer.concat(chunks);
            body = body.toString();

            if (!body) { return; }

            let result = JSON.parse(body);

            console.log(result.message);
        });
    });

    await req.write(JSON.stringify(accesses));
    await req.end();
}