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
let VALIDATOR_START = lib.deps.joi.date();
let VALIDATOR_END = lib.deps.joi.date();
let VALIDATOR_MEMBER = lib.deps.joi.object().type(lib.models.User);

/**
	@class
	@classdesc		Council model.
	@alias			models.Council
*/
class Council extends lib.odin.Model {
	/**
		@desc							Constructs a new council.
		@param {Object} p_data			Council descriptor.
		@param {String} [p_data.id]		Unique id.
		@param {Date} p_data.start		Mandate start date.
		@param {Date} p_data.end		Mandate end date.
	*/
	constructor(p_data) {
		super(p_data);
	}

	[lib.odin.Model.SYMBOL_METHOD_POPULATE](p_data) {
		if(p_data.id) {
			this.id = p_data.id;
		}

		this.start = p_data.start;
		this.end = p_data.end;

		this[lib.odin.Model.SYMBOL_METHOD_CREATE_ASSOCIATION]('members', lib.odin.constants.ASSOCIATION_TYPE_MAP);
	}

	/**
		@readonly
		@member {String}	models.Council#id
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
		@member {Date}		models.Council#start
		@desc				Mandate start date.
	*/
	get start() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('start');
	}

	set start(p_start) {
		let start = lib.odin.util.validate(p_start, VALIDATOR_START.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('start', start);
	}

	/**
		@member {Date}		models.Council#end
		@desc				Mandate end date.
	*/
	get end() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('end');
	}

	set end(p_end) {
		let end = lib.odin.util.validate(p_end, VALIDATOR_END.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('end', end);
	}

	/**
		@readonly
		@member {Iterator.<models.User>}		models.Council#members
		@desc									Members.
	*/
	get members() {
		return this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('members').values();
	}

	/**
		@desc							Tells whether the user is a member of this council or not.
		@param {models.User} p_user		User.
		@returns						The user affiliation.
	*/
	hasMember(p_user) {
		let user = lib.odin.util.validate(p_user, VALIDATOR_MEMBER.required());
		return this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('members').has(user.id);
	}

	/**
		@desc							Adds the provided member to this council.
		@param {models.User} p_user		User.
	*/
	addMember(p_user) {
		let user = lib.odin.util.validate(p_user, VALIDATOR_MEMBER.required());
		this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('members').set(user.id, user);
	}

	/**
		@desc							Removes the provided user from this council.
		@param {models.User} p_user		User.
	*/
	removeMember(p_user) {
		let user = lib.odin.util.validate(p_user, VALIDATOR_MEMBER.required());
		this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('members').remove(user.id);
	}
}

Object.defineProperty(Council, 'VALIDATOR_ID', {enumerable:true, value:VALIDATOR_ID});

module.exports = Council;