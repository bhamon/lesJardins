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
		User:require('./User')
	}
};

let VALIDATOR_ID = lib.deps.joi.string().regex(/^[a-z0-9]+$/).min(1).max(40);
let VALIDATOR_USER = lib.deps.joi.object().type(lib.models.User);
let VALIDATOR_DATE = lib.deps.joi.date();
let VALIDATOR_TEXT = lib.deps.joi.string().min(1).max(1000);
let VALIDATOR_LINK = lib.deps.joi.string().uri().max(100);

/**
	@class
	@classdesc		Alert model.
	@alias			models.Alert
*/
class Alert extends lib.odin.Model {
	/**
		@desc									Constructs a new alert.
		@param {Object} p_data					Alert descriptor.
		@param {String} [p_data.id]				Unique id.
		@param {models.User} p_data.user		User.
		@param {Date} p_data.date				Date.
		@param {String} p_data.text				Text.
		@param {String} [p_data.link]			Link.
	*/
	constructor(p_data) {
		super(p_data);
	}

	[lib.odin.Model.SYMBOL_METHOD_POPULATE](p_data) {
		if(p_data.id) {
			this.id = p_data.id;
		}

		this.user = p_data.user;
		this.date = p_data.date;
		this.text = p_data.text;
		this.link = p_data.link;
	}

	/**
		@readonly
		@member {String}	models.Alert#id
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
		@member {models.User}		models.Alert#user
		@desc						User.
	*/
	get user() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('user');
	}

	set user(p_user) {
		let user = lib.odin.util.validate(p_user, VALIDATOR_USER.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('user', user);
	}

	/**
		@member {Date}		models.Alert#date
		@desc				Date.
	*/
	get date() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('date');
	}

	set date(p_date) {
		let date = lib.odin.util.validate(p_date, VALIDATOR_DATE.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('date', date);
	}

	/**
		@member {String}	models.Alert#text
		@desc				Text.
	*/
	get text() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('text');
	}

	set text(p_text) {
		let text = lib.odin.util.validate(p_text, VALIDATOR_TEXT.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('text', text);
	}

	/**
		@member {String}	models.Alert#link
		@desc				link.
	*/
	get link() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('link');
	}

	set link(p_link) {
		let link = lib.odin.util.validate(p_link, VALIDATOR_LINK);
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('link', link);
	}
}

Object.defineProperty(Alert, 'VALIDATOR_ID', {enumerable:true, value:VALIDATOR_ID});

module.exports = Alert;