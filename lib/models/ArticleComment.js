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
		Article:require('./Article'),
		User:require('./User')
	}
};

let VALIDATOR_ID = lib.deps.joi.string().regex(/^[a-z0-9.]+$/).min(1).max(40);
let VALIDATOR_ARTICLE = lib.deps.joi.object().type(lib.models.Article);
let VALIDATOR_AUTHOR = lib.deps.joi.object().type(lib.models.User);
let VALIDATOR_DATE = lib.deps.joi.date();
let VALIDATOR_TEXT = lib.deps.joi.string().min(1).max(1000);

/**
	@class
	@classdesc		Article commet model.
	@alias			models.ArticleComment
*/
class ArticleComment extends lib.odin.Model {
	/**
		@desc										Constructs a new article comment.
		@param {Object} p_data						Article comment descriptor.
		@param {String} [p_data.id]					Unique id.
		@param {models.Article} p_data.article		Article.
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

		this.article = p_data.article;
		this.author = p_data.author;
		this.date = p_data.date;
		this.text = p_data.text;
	}

	/**
		@readonly
		@member {String}	models.ArticleComment#id
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
		@member {models.Article}	models.ArticleComment#article
		@desc						Article.
	*/
	get article() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('article');
	}

	set article(p_article) {
		let article = lib.odin.util.validate(p_article, VALIDATOR_ARTICLE.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('article', article);
	}

	/**
		@member {models.User}		models.ArticleComment#author
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
		@member {String}	models.ArticleComment#date
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
		@member {String}	models.ArticleComment#text
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

Object.defineProperty(ArticleComment, 'VALIDATOR_ID', {enumerable:true, value:VALIDATOR_ID});

module.exports = ArticleComment;