'use strict';

let lib = {
	node:{
		crypto:require('crypto')
	},
	deps:{
		joi:require('joi')
	},
	odin:{
		constants:require('odin').constants,
		util:require('odin').util,
		Model:require('odin').Model,
		http:{
			RightsTree:require('odin-http').RightsTree
		}
	}
};

let SYMBOL_MEMBER_RIGHTS = Symbol('rights');
let VALIDATOR_ID = lib.deps.joi.string().regex(/^[a-z0-9]+$/).min(1).max(40);
let VALIDATOR_EMAIL = lib.deps.joi.string().email().min(1).max(100);
let VALIDATOR_PASSWORD = lib.deps.joi.string().regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/).min(6).max(100);
let VALIDATOR_HASHED_PASSWORD = lib.deps.joi.string().hex().lowercase().length(64);
let VALIDATOR_FIRST_NAME = lib.deps.joi.string().min(1).max(40);
let VALIDATOR_LAST_NAME = lib.deps.joi.string().min(1).max(40);

/**
	@class
	@classdesc		User model.
	@alias			models.User
*/
class User extends lib.odin.Model {
	/**
		@desc										Constructs a new user.
		@param {Object} p_data						User descriptor.
		@param {String} [p_data.id]					Unique id.
		@param {String} p_data.email				Email.
		@param {String} p_data.password				Hashed password.
		@param {String} p_data.firstName			First name.
		@param {String} p_data.lastName				Last name.
		@param {Array.<String>} [p_data.rights]		Rights list.
	*/
	constructor(p_data) {
		super(p_data);
	}

	[lib.odin.Model.SYMBOL_METHOD_POPULATE](p_data) {
		if(p_data.id) {
			this.id = p_data.id;
		}

		this.email = p_data.email;
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('password', lib.odin.util.validate(p_data.password, VALIDATOR_HASHED_PASSWORD.required()));
		this.firstName = p_data.firstName;
		this.lastName = p_data.lastName;

		Object.defineProperty(this, SYMBOL_MEMBER_RIGHTS, {value:new lib.odin.http.RightsTree()});
		this[lib.odin.Model.SYMBOL_METHOD_CREATE_ASSOCIATION]('rights', lib.odin.constants.ASSOCIATION_TYPE_SET);
		this.rights = p_data.rights;
	}

	/**
		@readonly
		@member {String}	models.User#id
		@desc				Unique id.
	*/
	get id() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('id');
	}

	set id(p_id) {
		let id = lib.odin.util.validate(p_id, VALIDATOR_ID.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('id', id);
	}

	/**
		@member {String}	models.User#email
		@desc				Email.
	*/
	get email() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('email');
	}

	set email(p_email) {
		let email = lib.odin.util.validate(p_email, VALIDATOR_EMAIL.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('email', email);
	}

	/**
		@member {String}	models.User#password
		@desc				Password.
							The setter automatically hash the provided clear password.
	*/
	get password() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('password');
	}

	set password(p_password) {
		let password = lib.odin.util.validate(p_password, VALIDATOR_PASSWORD.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('password', User.hashPassword(password));
	}

	/**
		@member {String}	models.User#firstName
		@desc				First name.
	*/
	get firstName() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('firstName');
	}

	set firstName(p_firstName) {
		let firstName = lib.odin.util.validate(p_firstName, VALIDATOR_FIRST_NAME.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('firstName', firstName);
	}

	/**
		@member {String}	models.User#lastName
		@desc				Last name.
	*/
	get lastName() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('lastName');
	}

	set lastName(p_lastName) {
		let lastName = lib.odin.util.validate(p_lastName, VALIDATOR_LAST_NAME.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('lastName', lastName);
	}

	/**
		@readonly
		@member {Iterator.<String>}		models.User#rights
		@desc							Rights list.
	*/
	get rights() {
		return this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('rights').values();
	}

	set rights(p_rights) {
		let rights = lib.odin.util.validate(p_rights, lib.deps.joi.array().optional().default([]));

		this[SYMBOL_MEMBER_RIGHTS].clear();
		for(let right of rights) {
			this[SYMBOL_MEMBER_RIGHTS].add(right);
		}

		this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('rights').clear();
		for(let right of this[SYMBOL_MEMBER_RIGHTS]) {
			this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('rights').add(right);
		}
	}
	/**
		@desc						Tells whether the user has the provided right or not.
		@param {String} p_right		Right.
		@returns					The right presence.
	*/
	hasRight(p_right) {
		return this[SYMBOL_MEMBER_RIGHTS].has(p_right);
	}

	/**
		@desc							Hash the given password.
		@param {String} p_password		Password to hash.
		@returns {String}				Hashed password.
	*/
	static hashPassword(p_password) {
		return lib.node.crypto.createHash('sha256').update(p_password).digest('hex');
	}
}

Object.defineProperty(User, 'VALIDATOR_ID', {enumerable:true, value:VALIDATOR_ID});
Object.defineProperty(User, 'VALIDATOR_EMAIL', {enumerable:true, value:VALIDATOR_EMAIL});
Object.defineProperty(User, 'VALIDATOR_PASSWORD', {enumerable:true, value:VALIDATOR_PASSWORD});

module.exports = User;