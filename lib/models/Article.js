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

let VALIDATOR_ID = lib.deps.joi.string().regex(/^[a-z0-9.]+$/).min(1).max(40);
let VALIDATOR_AUTHOR = lib.deps.joi.object().type(lib.models.User);
let VALIDATOR_DATE = lib.deps.joi.date();
let VALIDATOR_TITLE = lib.deps.joi.string().min(1).max(100);
let VALIDATOR_TAG = lib.deps.joi.string().min(1).max(40);
let VALIDATOR_TEXT = lib.deps.joi.string().min(1).max(1000);

/**
	@class
	@classdesc		Article model.
	@alias			models.Article
*/
class Article extends lib.odin.Model {
	/**
		@desc										Constructs a new article.
		@param {Object} p_data						Article descriptor.
		@param {String} [p_data.id]					Unique id.
		@param {models.User} p_data.author			Author.
		@param {Date} p_data.date					Creation date.
		@param {String} p_data.title				Title.
		@param {Array.<String>} [p_data.tags]		Tags.
		@param {String} p_data.text					Text.
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
		this.title = p_data.title;
		this.text = p_data.text;

		this[lib.odin.Model.SYMBOL_METHOD_CREATE_ASSOCIATION].set('tags', lib.odin.constants.ASSOCIATION_TYPE_SET);
		let tags = lib.odin.util.validate(p_data.tags, lib.deps.joi.array().optional().default([]).items(VALIDATOR_TAG));
		for(let tag of tags) {
			this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('tags').add(tag);
		}
	}

	/**
		@readonly
		@member {String}	models.Article#id
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
		@member {models.User}		models.Article#author
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
		@member {String}	models.Article#date
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
		@member {String}	models.Article#title
		@desc				Title.
	*/
	get title() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('title');
	}

	set title(p_title) {
		let title = lib.odin.util.validate(p_title, VALIDATOR_TITLE.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('title', title);
	}

	/**
		@readonly
		@member {Iterator.<String>}		models.Article#tags
		@desc							Tags.
	*/
	get tags() {
		return this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('tags').values();
	}

	set tags(p_tags) {
		let tags = lib.odin.util.validate(p_tags, lib.deps.joi.array().optional().default([]));

		this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('tags').clear();
		for(let tag of tags) {
			this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('tags').add(tag);
		}
	}

	/**
		@desc						Tells whether the article has the provided tag or not.
		@param {String} p_tag		Tag.
		@returns					The tag presence.
	*/
	hasTag(p_tag) {
		return this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('tags').has(p_tag);
	}

	/**
		@member {String}	models.Article#text
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

Object.defineProperty(Article, 'VALIDATOR_ID', {enumerable:true, value:VALIDATOR_ID});

module.exports = Article;