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
		User:require('./User'),
		Channel:require('./Channel')
	}
};

let VALIDATOR_ID = lib.deps.joi.string().regex(/^[a-z0-9]+$/).min(1).max(40);
let VALIDATOR_CHANNEL = lib.deps.joi.object().type(lib.models.Channel);
let VALIDATOR_AUTHOR = lib.deps.joi.object().type(lib.models.User);
let VALIDATOR_DATE = lib.deps.joi.date();
let VALIDATOR_TEXT = lib.deps.joi.string().min(1).max(100);

/**
	@class
	@classdesc		Channel message model.
	@alias			models.ChannelMessage
*/
class ChannelMessage extends lib.odin.Model {
	/**
		@desc										Constructs a new channel message.
		@param {Object} p_data						Channel message descriptor.
		@param {String} [p_data.id]					Unique id.
		@param {models.Channel} p_data.channel		Channel.
		@param {models.User} p_data.author			Author.
		@param {String} p_data.date					Creation date.
		@param {String} p_data.text					Text.
	*/
	constructor(p_data) {
		super(p_data);
	}

	[lib.odin.Model.SYMBOL_METHOD_POPULATE](p_data) {
		if(p_data.id) {
			this.id = p_data.id;
		}

		this.channel = p_data.channel;
		this.author = p_data.author;
		this.date = p_data.date;
		this.text = p_data.text;
	}

	/**
		@readonly
		@member {String}	models.ChannelMessage#id
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
		@member {models.Channel}	models.ChannelMessage#channel
		@desc						Channel.
	*/
	get channel() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('channel');
	}

	set channel(p_channel) {
		let channel = lib.odin.util.validate(p_channel, VALIDATOR_CHANNEL.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('channel', channel);
	}

	/**
		@member {models.User}		models.ChannelMessage#author
		@desc						Author.
	*/
	get author() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('author');
	}

	set author(p_author) {
		let author = lib.odin.util.validate(p_author, VALIDATOR_AUTHOR.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('author', author);
	}

	/**
		@member {String}	models.ChannelMessage#date
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
		@member {String}	models.ChannelMessage#text
		@desc				Text.
	*/
	get text() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('text');
	}

	set text(p_text) {
		let text = lib.odin.util.validate(p_text, VALIDATOR_TEXT.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('text', text);
	}
}

Object.defineProperty(ChannelMessage, 'VALIDATOR_ID', {enumerable:true, value:VALIDATOR_ID});

module.exports = ChannelMessage;