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

/*
	Statuses graph:
		PENDING -->
			(majority won't assist)		CANCELED
			(canceled by creator)		CANCELED
			(canceled by admin)			CANCELED
			(majority ok)				CONFIRMED -->
											(canceled by creator)							CANCELED
											(canceled by admin)								CANCELED
											(date behind schedule + report published)		DONE
*/
let STATUS_PENDING = Symbol('pending');
let STATUS_CANCELED = Symbol('canceled');
let STATUS_CONFIRMED = Symbol('confirmed');
let STATUS_DONE = Symbol('done');

let STATUSES = new Set([
	STATUS_PENDING,
	STATUS_CANCELED,
	STATUS_CONFIRMED,
	STATUS_DONE
]);

let STATUSES_DESCENDANTS = new Map([
	[STATUS_PENDING, new Set([STATUS_CANCELED, STATUS_CONFIRMED])],
	[STATUS_CANCELED, new Set()],
	[STATUS_CONFIRMED, new Set([STATUS_CANCELED, STATUS_DONE])],
	[STATUS_DONE, new Set()]
]);

let VALIDATOR_ID = lib.deps.joi.string().regex(/^[a-z0-9]+$/).min(1).max(40);
let VALIDATOR_STATUS = lib.deps.joi.object().valid(Array.from(STATUSES));
let VALIDATOR_USER = lib.deps.joi.object().type(lib.models.User);
let VALIDATOR_DATE = lib.deps.joi.date();
let VALIDATOR_LOCATION = lib.deps.joi.string().min(1).max(100);
let VALIDATOR_AGENDA_ITEM = lib.deps.joi.string().min(1).max(100);

/**
	@class
	@classdesc		Meeting model.
	@alias			models.Meeting
*/
class Meeting extends lib.odin.Model {
	/**
		@desc													Constructs a new meeting.
		@param {Object} p_data									Meeting descriptor.
		@param {String} [p_data.id]								Unique id.
		@param {Symbol} p_data.status							Status (one of {@link models.Meeting.STATUSES}).
		@param {models.User} p_data.user						User.
		@param {Date} p_data.date								Meeting planned date/time.
		@param {String} p_data.location							Meeting planned location.
		@param {Array.<String>} p_data.agenda					Agenda.
	*/
	constructor(p_data) {
		super(p_data);
	}

	[lib.odin.Model.SYMBOL_METHOD_POPULATE](p_data) {
		if(p_data.id) {
			this.id = p_data.id;
		}

		this.status = p_data.status;
		this.user = p_data.user;
		this.date = p_data.date;
		this.location = p_data.location;

		this[lib.odin.Model.SYMBOL_METHOD_CREATE_ASSOCIATION]('agenda', lib.odin.constants.ASSOCIATION_TYPE_ARRAY);
		let agenda = lib.odin.util.validate(p_data.agenda, lib.deps.joi.array().required().items(VALIDATOR_AGENDA_ITEM));
		for(let item of agenda) {
			this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('agenda').add(item);
		}

		this[lib.odin.Model.SYMBOL_METHOD_CREATE_ASSOCIATION]('confirmations', lib.odin.constants.ASSOCIATION_TYPE_MAP);
		this[lib.odin.Model.SYMBOL_METHOD_CREATE_ASSOCIATION]('rejections', lib.odin.constants.ASSOCIATION_TYPE_MAP);
	}

	/**
		@readonly
		@member {String}	models.Meeting#id
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
		@member {Symbol}	models.Meeting#status
		@desc				Status (one of {@link models.Meeting.STATUSES}).
	*/
	get status() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('status');
	}

	set status(p_status) {
		let status = lib.odin.util.validate(p_status, VALIDATOR_STATUS.required());

		let descendants = STATUSES_DESCENDANTS.get(status);
		lib.odin.util.validate(status, lib.deps.joi.any().valid(Array.from(descendants)));

		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('status', status);
	}

	/**
		@member {models.User}		models.Meeting#user
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
		@member {Date}		models.Meeting#date
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
		@member {String}	models.Meeting#location
		@desc				Location.
	*/
	get location() {
		return this[lib.odin.Model.SYMBOL_MEMBER_DATA].get('location');
	}

	set location(p_location) {
		let location = lib.odin.util.validate(p_location, VALIDATOR_LOCATION.required());
		this[lib.odin.Model.SYMBOL_MEMBER_DATA].set('location', location);
	}

	/**
		@readonly
		@member {Iterator.<String>}			models.Meeting#agenda
		@desc								Agenda.
	*/
	get agenda() {
		return this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('agenda').entries();
	}

	/**
		@desc						Adds an item to the agenda.
		@param {String} p_item		Agenda item.
	*/
	addAgendaItem(p_item) {
		let item = lib.odin.util.validate(p_item, VALIDATOR_AGENDA_ITEM);
		this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('agenda').add(item);
	}

	/**
		@desc						Inserts an item at the specified index in the agenda.
		@param {Number} p_index		Index.
		@param {String} p_item		Item.
	*/
	insertAgendaItem(p_index, p_item) {
		let item = lib.odin.util.validate(p_item, VALIDATOR_AGENDA_ITEM);
		this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('agenda').insert(p_index, item);
	}

	/**
		@desc						Removes an item from the agenda.
		@param {Number} p_index		Index.
	*/
	removeAgendaItem(p_index) {
		this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('agenda').remove(index);
	}

	/**
		@readonly
		@member {Iterator.<models.User>}		models.Meeting#confirmations
		@desc									User confirmations.
	*/
	get confirmations() {
		return this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('confirmations').entries();
	}

	/**
		@desc							Adds an user confirmation to this meeting.
										Removes the eventual rejection for the specified user.
		@param {models.User} p_user		User.
	*/
	addConfirmation(p_user) {
		let user = lib.odin.util.validate(p_user, VALIDATOR_USER.required());
		this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('rejections').remove(user.id);
		this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('confirmations').set(user.id, user);
	}

	/**
		@readonly
		@member {Iterator.<models.User>}		models.Meeting#rejections
		@desc									User rejections.
	*/
	get rejections() {
		return this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('rejections').entries();
	}

	/**
		@desc							Adds an user rejection to this meeting.
										Removes the eventual confirmation for the specified user.
		@param {models.User} p_user		User.
	*/
	addRejection(p_user) {
		let user = lib.odin.util.validate(p_user, VALIDATOR_USER.required());
		this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('confirmations').remove(user.id);
		this[lib.odin.Model.SYMBOL_MEMBER_ASSOCIATIONS].get('rejections').set(user.id, user);
	}
}

Object.defineProperty(Meeting, 'STATUS_PENDING', {enumerable:true, value:STATUS_PENDING});
Object.defineProperty(Meeting, 'STATUS_CANCELED', {enumerable:true, value:STATUS_CANCELED});
Object.defineProperty(Meeting, 'STATUS_CONFIRMED', {enumerable:true, value:STATUS_CONFIRMED});
Object.defineProperty(Meeting, 'STATUS_DONE', {enumerable:true, value:STATUS_DONE});
Object.defineProperty(Meeting, 'STATUSES', {enumerable:true, value:STATUSES});
Object.defineProperty(Meeting, 'VALIDATOR_ID', {enumerable:true, value:VALIDATOR_ID});

module.exports = Meeting;