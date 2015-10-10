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
		ServiceChargeEntry:require('./ServiceChargeEntry')
	}
};

let VALIDATOR_ID = lib.deps.joi.string().regex(/^[a-z0-9]+$/).min(1).max(40);
let VALIDATOR_TYPE = lib.deps.joi.string().regex(/^[a-zA-Z0-9.]+$/).min(1).max(40);
let VALIDATOR_START = lib.deps.joi.date();
let VALIDATOR_END = lib.deps.joi.date();
let VALIDATOR_LABEL = lib.deps.joi.string().min(1).max(100);
let VALIDATOR_SHARES = lib.deps.joi.string().min(1).max(40);

/**
	@class
	@classdesc		Service charge model.
	@alias			models.ServiceCharge
*/
class ServiceCharge extends lib.odin.Model {
	/**
		@desc									Constructs a new service charge.
		@param {Object} p_data					Service charge descriptor.
		@param {String} [p_data.id]				Unique id.
		@param {String} p_data.type				Type.
		@param {Date} p_data.start				Validity start date.
		@param {Date} p_data.end				Validity end date.
		@param {String} p_data.label			Label.
		@param {Number} p_data.shares			Shares.
	*/
	constructor(p_data) {
		super(p_data);
	}

	[lib.odin.Model.SYMBOL_METHOD_POPULATE](p_data) {
		if(p_data.id) {
			this.id = p_data.id;
		}

		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('type', lib.odin.util.validate(p_data.type, VALIDATOR_TYPE.required()));
		this.start = p_data.start;
		this.end = p_data.end;
		this.label = p_data.label;
		this.shares = p_data.shares;

		this[lib.odin.Model.SYMBOL_METHOD_CREATE_ASSOCIATION].set('entries', lib.odin.constants.ASSOCIATION_TYPE_ARRAY);
	}

	/**
		@readonly
		@member {String}	models.ServiceCharge#id
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
		@readonly
		@member {String}	models.ServiceCharge#type
		@desc				Type.
	*/
	get type() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('type');
	}

	/**
		@member {Date}		models.ServiceCharge#start
		@desc				Validity start date.
	*/
	get start() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('start');
	}

	set start(p_start) {
		let start = lib.odin.util.validate(p_start, VALIDATOR_START.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('start', start);
	}

	/**
		@member {Date}		models.ServiceCharge#end
		@desc				Validity end date.
	*/
	get end() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('end');
	}

	set end(p_end) {
		let end = lib.odin.util.validate(p_end, VALIDATOR_END.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('end', end);
	}

	/**
		@member {String}	models.ServiceCharge#label
		@desc				Label.
	*/
	get label() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('label');
	}

	set label(p_label) {
		let value = lib.odin.util.validate(p_label, VALIDATOR_LABEL.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('label', value);
	}

	/**
		@member {Number}	models.ServiceCharge#shares
		@desc				Shares.
	*/
	get shares() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('shares');
	}

	set shares(p_shares) {
		let shares = lib.odin.util.validate(p_shares, VALIDATOR_SHARES.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('shares', shares);
	}

	/**
		@member {models.ServiceChargeEntry}		models.ServiceCharge#entries
		@desc									Entries.
	*/
	get entries() {
		return this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('entries');
	}

	/**
		@desc						Adds an entry to this service charge.
		@param {Object} p_entry		Entry descriptor.
	*/
	addEntry(p_entry) {
		let entry = new lib.models.Entry(p_entry);
		this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('entries').add(entry);
	}

	/**
		@desc						Inserts an entry at the specifed index in this service charge.
		@param {Number} p_index		Index.
		@param {Object} p_entry		Entry descriptor.
	*/
	insertEntry(p_index, p_entry) {
		let entry = new lib.models.Entry(p_entry);
		this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('entries').insert(p_index, entry);
	}

	/**
		@desc						Removes the entry at the specified index.
		@param {Number} p_index		Index.
	*/
	removeEntry(p_index) {
		this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('entries').remove(p_index);
	}
}

Object.defineProperty(ServiceCharge, 'VALIDATOR_ID', {enumerable:true, value:VALIDATOR_ID});
Object.defineProperty(ServiceCharge, 'VALIDATOR_TYPE', {enumerable:true, value:VALIDATOR_TYPE});

module.exports = ServiceCharge;