'use strict';

let lib = {
	deps:{
		joi:require('joi')
	},
	odin:{
		util:require('odin').util,
		Model:require('odin').Model
	},
	models:{
		ServiceCharge:require('./ServiceCharge')
	}
};

let VALIDATOR_ID = lib.deps.joi.string().regex(/^[a-z0-9]+$/).min(1).max(40);
let VALIDATOR_NAME = lib.deps.joi.string().min(1).max(100);
let VALIDATOR_SHARES = lib.deps.joi.number().integer().min(0);

/**
	@class
	@classdesc		Car park model.
	@alias			models.CarPark
*/
class CarPark extends lib.odin.Model {
	/**
		@desc								Constructs a new car park.
		@param {Object} p_data				Car park descriptor.
		@param {String} [p_data.id]			Unique id.
		@param {String} p_data.name			Name.
	*/
	constructor(p_data) {
		super(p_data);
	}

	[lib.odin.Model.SYMBOL_METHOD_POPULATE](p_data) {
		if(p_data.id) {
			this.id = p_data.id;
		}

		this.name = p_data.name;

		this[lib.odin.Model.SYMBOL_METHOD_CREATE_ASSOCIATION]('shares', lib.odin.constants.ASSOCIATION_TYPE_MAP);
	}

	/**
		@readonly
		@member {String}	models.CarPark#id
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
		@member {String}	models.CarPark#name
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
		@member {Iterator.<String, Number>}		models.CarPark#shares
		@desc									Shares per service charge type.
	*/
	get shares() {
		return this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('shares').entries();
	}

	/**
		@desc							Sets shares number for the specified service charge type.
		@param {String} p_type			Service charge type.
		@param {Number} p_shares		Shares number.
	*/
	setShares(p_type, p_shares) {
		let args = lib.odin.util.validate({
			type:p_type,
			shares:p_shares
		}, {
			type:lib.models.ServiceCharge.VALIDATOR_TYPE.required(),
			shares:VALIDATOR_SHARES.required()
		});

		this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('shares').set(args.type, args.shares);
	}

	/**
		@desc						Removes the shares number for the specified service charge type.
		@param {String} p_type		Service charge type.
	*/
	removeShares(p_type) {
		let type = lib.odin.util.validate(p_type, lib.models.ServiceCharge.VALIDATOR_TYPE.required());
		this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('shares').remove(type);
	}
}

Object.defineProperty(CarPark, 'VALIDATOR_ID', {enumerable:true, value:VALIDATOR_ID});

module.exports = CarPark;