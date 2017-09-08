require('dotenv').load();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require("csvtojson");
const Brokers = require('./schemas/brokers');

mongoose.connect(process.env.DB_SECURITY_CONNECTION, function (err) {
    if (err) { console.error(err); process.exit(1); }

    _startProcess();
});


function _startProcess() {
    let filePath = path.join(process.cwd(), '/credentials.csv');

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
    let broker = await Brokers.findOne({ cnpj: brokerCnpj });
    if (!broker) { return; }

    let credentialsLength = credentials.length;
    let credentialIndex = 0;

    let _recursiveSaving = async function () {
        if (credentialIndex >= credentialsLength) { return; }

        if (credential.username && credential.password) {
            let credential = credentials[credentialIndex];
            let credentialName = credential.name.replace(/ /g, "").toLowerCase();
            let access = await broker.acessos.find(function (x) { return x.seguradoraId == credentialName });

            if (access && (credential.username != access.usuario || credential.password != access.password)) {
                access.usuario = credential.username != access.usuario ? credential.username : access.usuario;
                access.password = credential.password != access.password ? credential.password : access.password;

                broker.markModified('acessos');
            }
        }

        credentialIndex++;

        _recursiveSaving();

        if (broker.isModified('acessos')) {
            await broker.save();
        }
    }

    _recursiveSaving();
}