'use strict';

const mongoose = require('mongoose');
const uuid = require('node-uuid');
require('mongoose-uuid2')(mongoose);
var UUID = mongoose.Types.UUID;
var Schema = mongoose.Schema;

var CorretoraSchema = new Schema({
	uuid: { type: UUID, default: uuid.v4 },
	nome: String,
	cnpj: String,
	susep: String,
	endereco: String,
	email: String,
	telefone: String,
	ativo: Boolean,
	contrato: {
		data: Date,
		plano: String,
		ativo: Boolean,
		formaPagamento: String
	},
	acessos: [{
		seguradoraId: String,
		usuario: String,
		password: String,
		status: String
	}]
}, { id: false });

CorretoraSchema.methods.toJSON = function () {
	var corretora = this.toObject({ getters: true });
	delete corretora.__v;

	return corretora;
};

module.exports = mongoose.model('Corretora', CorretoraSchema, 'corretora');