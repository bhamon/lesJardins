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

let VALIDATOR_ID = lib.deps.joi.string().regex(/^[a-z0-9]+$/).min(1).max(40);
let VALIDATOR_NAME = lib.deps.joi.string().max(100);
let VALIDATOR_ACCESS_CODE = lib.deps.joi.string().regex(/[0-9]{4}/);

/**
	@class
	@classdesc		Building model.
	@alias			models.Building
*/
class Building extends lib.odin.Model {
	/**
		@desc									Constructs a new building.
		@param {Object} p_data					Building descriptor.
		@param {String} [p_data.id]				Unique id.
		@param {String} p_data.name				Name.
		@param {String} p_data.accessCode		Access code.
	*/
	constructor(p_data) {
		super(p_data);
	}

	[lib.odin.Model.SYMBOL_METHOD_POPULATE](p_data) {
		if(p_data.id) {
			this.id = p_data.id;
		}

		this.name = p_data.name;
		this.accessCode = p_data.accessCode;
	}

	/**
		@readonly
		@member {String}	models.Building#id
		@desc				Unique id.
	*/
	get id() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('id');
	}

	set id(p_id) {
		let id = lib.odin.util.validate(p_data.id, VALIDATOR_ID.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('id', id);
	}

	/**
		@member {String}	models.Building#name
		@desc				Name.
	*/
	get name() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('name');
	}

	set name(p_name) {
		let name = lib.odin.util.validate(p_name, VALIDATOR_NAME.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('name', name);
	}

	/**
		@member {String}	models.Building#accessCode
		@desc				Access code.
	*/
	get accessCode() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('accessCode');
	}

	set accessCode(p_accessCode) {
		let accessCode = lib.odin.util.validate(p_accessCode, VALIDATOR_ACCESS_CODE.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('accessCode', accessCode);
	}
}

Object.defineProperty(Building, 'VALIDATOR_ID', {enumerable:true, value:VALIDATOR_ID});

module.exports = Building;