'use strict';

let lib = {
	deps:{
		joi:require('joi')
	},
	odin:{
		util:require('odin').util,
		Model:require('odin').Model
	}
};

let VALIDATOR_LABEL = lib.deps.joi.string().min(1).max(100);
let VALIDATOR_AMOUNT = lib.deps.joi.number().min(0);

/**
	@class
	@classdesc		Service charge entry model.
	@alias			models.ServiceChargeEntry
*/
class ServiceChargeEntry extends lib.odin.Model {
	/**
		@desc								Constructs a new service charge entry.
		@param {Object} p_data				Service charge entry descriptor.
		@param {String} p_data.label		Label.
		@param {Number} p_data.amount		Amount.
	*/
	constructor(p_data) {
		super(p_data);
	}

	[lib.odin.Model.SYMBOL_METHOD_POPULATE](p_data) {
		this.label = p_data.label;
		this.amount = p_data.amount;
	}

	/**
		@member {String}		models.ServiceChargeEntry#label
		@desc					Label.
	*/
	get label() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('label');
	}

	set label(p_label) {
		let label = lib.odin.util.validate(p_label, VALIDATOR_LABEL.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('label', label);
	}

	/**
		@member {Number}	models.ServiceChargeEntry#amount
		@desc				Amount.
	*/
	get amount() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('amount');
	}

	set amount(p_amount) {
		let amount = lib.odin.util.validate(p_amount, VALIDATOR_AMOUNT.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('amount', amount);
	}
}

module.exports = ServiceChargeEntry;