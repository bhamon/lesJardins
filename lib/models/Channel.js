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
let VALIDATOR_AUTHOR = lib.deps.joi.object().type(lib.models.User);
let VALIDATOR_DATE = lib.deps.joi.date();
let VALIDATOR_NAME = lib.deps.joi.string().regex(/^[a-zA-Z0-9_.-]{1,100}$/);
let VALIDATOR_SUMMARY = lib.deps.joi.string().min(1).max(100);
let VALIDATOR_TAG = lib.deps.joi.string().min(1).max(40);
let VALIDATOR_MEMBER = lib.deps.joi.object().type(lib.models.User);

/**
	@class
	@classdesc		Channel model.
	@alias			models.Channel
*/
class Channel extends lib.odin.Model {
	/**
		@desc										Constructs a new channel.
		@param {Object} p_data						Channel descriptor.
		@param {String} [p_data.id]					Unique id.
		@param {models.User} p_data.author			Author.
		@param {String} p_data.date					Creation date.
		@param {String} p_data.name					Name.
		@param {String} p_data.summary				Summary.
		@param {Array.<String>} [p_data.tags]		Tags.
	*/
	constructor(p_data) {
		super(p_data);
	}

	[lib.odin.Model.SYMBOL_METHOD_POPULATE](p_data) {
		if(p_data.id) {
			this.id = p_data.id;
		}

		this.author = p_data.author;
		this.date = p_data.date;
		this.name = p_data.name;
		this.summary = p_data.summary;

		this[lib.odin.Model.SYMBOL_METHOD_CREATE_ASSOCIATION].set('tags', lib.odin.constants.ASSOCIATION_TYPE_SET);
		let tags = lib.odin.util.validate(p_data.tags, lib.deps.joi.array().optional().default([]).items(VALIDATOR_TAG));
		for(let tag of tags) {
			this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('tags').add(tag);
		}

		this[lib.odin.Model.SYMBOL_METHOD_CREATE_ASSOCIATION]('members', lib.odin.constants.ASSOCIATION_TYPE_MAP);
	}

	/**
		@readonly
		@member {String}	models.Channel#id
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
		@member {String}	models.Channel#author
		@desc				Author.
	*/
	get author() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('author');
	}

	set author(p_value) {
		let value = lib.odin.util.validate(p_validate, VALIDATOR_AUTHOR.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('author', value);
	}

	/**
		@member {String}	models.Channel#date
		@desc				Date.
	*/
	get date() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('date');
	}

	set date(p_value) {
		let value = lib.odin.util.validate(p_validate, VALIDATOR_DATE.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('date', value);
	}

	/**
		@member {String}	models.Channel#name
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
		@member {String}	models.Channel#summary
		@desc				Summary.
	*/
	get summary() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('summary');
	}

	set summary(p_value) {
		let value = lib.odin.util.validate(p_validate, VALIDATOR_SUMMARY.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('summary', value);
	}

	/**
		@readonly
		@member {Iterator.<String>}		models.Channel#tags
		@desc							Tags.
	*/
	get tags() {
		return this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('tags').entries();
	}

	/**
		@desc						Tells whether the channel has the provided tag or not.
		@param {String} p_tag		Tag.
		@returns					The tag presence.
	*/
	hasTag(p_tag) {
		return this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('tags').has(p_tag);
	}

	/**
		@desc						Adds the provided tag to this channel.
		@param {String} p_tag		Tag to add.
	*/
	addTag(p_tag) {
		this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('tags').add(lib.odin.util.validate(p_tag, VALIDATOR_TAG.required()));
	}

	/**
		@desc						Removes the provided tag from this channel.
		@param {String} p_tag		Tag to remove.
	*/
	removeTag(p_tag) {
		this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('tags').remove(p_tag);
	}

	/**
		@readonly
		@member {Iterator.<models.User>}		models.Channel#members
		@desc									Channel members.
	*/
	get members() {
		return this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('members').values();
	}

	/**
		@desc							Tells whether the user is a member of this channel or not.
		@param {models.User} p_user		User.
		@returns						The user affiliation.
	*/
	hasMember(p_user) {
		let user = lib.odin.util.validate(p_user, VALIDATOR_MEMBER.required());
		return this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('members').has(user.id);
	}

	/**
		@desc							Adds the provided member to this channel.
		@param {models.User} p_user		User.
	*/
	addMember(p_user) {
		let user = lib.odin.util.validate(p_user, VALIDATOR_MEMBER.required());
		this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('members').set(user.id, user);
	}

	/**
		@desc							Removes the provided member from this channel.
		@param {models.User} p_user		User.
	*/
	removeMember(p_user) {
		let user = lib.odin.util.validate(p_user, VALIDATOR_MEMBER.required());
		return this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('members').remove(user.id);
	}
}

Object.defineProperty(Channel, 'VALIDATOR_ID', {enumerable:true, value:VALIDATOR_ID});

module.exports = Channel;