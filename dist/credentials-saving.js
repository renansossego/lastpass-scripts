'use strict';

let _saveCredentials = (() => {
    var _ref = _asyncToGenerator(function* (credentials) {

        let credentialsLength = credentials.length;
        let groupments = {};

        let credentialsIndex = 0;

        let _recursiveSaving = function () {
            if (credentialsIndex >= credentialsLength) {
                return;
            }

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
        };

        _recursiveSaving();

        for (let brokerCnpj in groupments) {
            let credentials = groupments[brokerCnpj];

            yield _updateBrokerCredentials(brokerCnpj, credentials);
        }
    });

    return function _saveCredentials(_x) {
        return _ref.apply(this, arguments);
    };
})();

let _updateBrokerCredentials = (() => {
    var _ref2 = _asyncToGenerator(function* (brokerCnpj, credentials) {
        let broker = yield Brokers.findOne({ cnpj: brokerCnpj });
        if (!broker) {
            return;
        }

        let credentialsLength = credentials.length;
        let credentialIndex = 0;

        let _recursiveSaving = (() => {
            var _ref3 = _asyncToGenerator(function* () {
                if (credentialIndex >= credentialsLength) {
                    return;
                }

                if (credential.username && credential.password) {
                    let credential = credentials[credentialIndex];
                    let credentialName = credential.name.replace(/ /g, "").toLowerCase();
                    let access = yield broker.acessos.find(function (x) {
                        return x.seguradoraId == credentialName;
                    });

                    if (access && (credential.username != access.usuario || credential.password != access.password)) {
                        access.usuario = credential.username != access.usuario ? credential.username : access.usuario;
                        access.password = credential.password != access.password ? credential.password : access.password;

                        broker.markModified('acessos');
                    }
                }

                credentialIndex++;

                _recursiveSaving();

                if (broker.isModified('acessos')) {
                    yield broker.save();
                }
            });

            return function _recursiveSaving() {
                return _ref3.apply(this, arguments);
            };
        })();

        _recursiveSaving();
    });

    return function _updateBrokerCredentials(_x2, _x3) {
        return _ref2.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('dotenv').load();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require("csvtojson");
const Brokers = require('./schemas/brokers');

mongoose.connect(process.env.DB_SECURITY_CONNECTION, function (err) {
    if (err) {
        console.error(err);process.exit(1);
    }

    _startProcess();
});

function _startProcess() {
    let filePath = path.join(process.cwd(), '/credentials.csv');

    if (!fs.existsSync(filePath)) {
        console.log("File not found");return;
    }

    csv().fromFile(filePath).on("end_parsed", function (credentials) {
        if (!credentials || !credentials.length) {
            return;
        }
        _saveCredentials(credentials);
    });
}