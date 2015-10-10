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

let VALIDATOR_KEY = lib.deps.joi.string().regex(/^[a-zA-Z0-9.]+$/).min(1).max(40);
let VALIDATOR_VALUE = lib.deps.joi.string().max(100);

/**
	@class
	@classdesc		Parameter model.
	@alias			models.Param
*/
class Param extends lib.odin.Model {
	/**
		@desc							Constructs a new parameter.
		@param {Object} p_data			Parameter descriptor.
		@param {String} p_data.key		Key.
		@param {String} p_data.value	Value.
	*/
	constructor(p_data) {
		super(p_data);
	}

	[lib.odin.Model.SYMBOL_METHOD_POPULATE](p_data) {
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('key', lib.odin.util.validate(p_data.key, VALIDATOR_KEY.required()));
		this.value = p_data.value;
	}

	/**
		@readonly
		@member {String}	models.Param#key
		@desc				Unique key.
	*/
	get key() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('key');
	}

	/**
		@member {String}	models.Param#value
		@desc				Value.
	*/
	get value() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('value');
	}

	set value(p_value) {
		let value = lib.odin.util.validate(p_value, VALIDATOR_VALUE.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('value', value);
	}
}

Object.defineProperty(Param, 'VALIDATOR_KEY', {enumerable:true, value:VALIDATOR_KEY});

module.exports = Param;