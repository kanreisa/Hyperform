/*!
 * Hyperform/[:version] for Prototype.js
 *
 * Copyright (c) 2012 Yuki KAN
 * Licensed under the MIT-License.
 *
 * http://akkar.in/projects/hyperform/
**/
var Hyperform = Class.create({
	/** 
	 *  new Hyperform(option) -> Hyperform
	 *
	 *  Constructor.
	**/
	initialize: function _initHyperform(opt) {
		this.fields      = opt.fields      || [];
		this.formID      = opt.formID      || null;
		this.formClass   = opt.formClass   || 'hyperform';
		this.formWidth   = opt.formWidth   || 'auto';
		this.formStyle   = opt.formStyle   || {};
		this.labelWidth  = opt.labelWidth  || '120px';
		this.labelAlign  = opt.labelAlign  || 'left';
		this.labelValign = opt.labelValign || 'middle';
		this.submitLabel = opt.submitLabel || 'Submit';
		this.validator   = opt.validator   || {};
		this.onSubmit    = opt.onSubmit    || null;
		this.onRendered  = opt.onRendered  || null;
		this.onValid     = opt.onValid     || null;
		this.onInvalid   = opt.onInvalid   || null;
		
		this.disableFormWhenSubmit = opt.disableFormWhenSubmit || false;
		this.disableSubmitButton   = opt.disableSubmitButton   || false;
		
		return this;
	}//<--initialize()
	,
	/**
	 *  Hyperform#render(element) -> Hyperform
	 *
	 *  Render the Hyperform.
	 *
	 *  ##### Examples
	 *
	 *      var form = new Hyperform({...});
	 *
	 *      var container = new Element('div');
	 *      form.render(container);
	 *      // -> Hyperform
	 *
	 *      //<div id="this-is-not-recommended"></div>
	 *      form.render('this-is-not-recommended');
	 *      // -> Hyperform
	**/
	render: function(p) {
		var target = $(p);//target element
		
		// create table element
		var table = this._table = new Element('table', {
			className: this.formClass
		});
		if (this.formID !== null) {
			table.writeAttribute('id', this.formID);
		}
		table.setStyle({
			width: this.formWidth
		});
		
		if ((this.formStyle !== {}) && (typeof this.formStyle === 'object')) {
			table.setStyle(this.formStyle);
		}
		
		// insert table to target
		if (target.innerHTML.empty() === false) {
			try {
				target.innerHTML = '';
				target.appendChild(table);
			} catch(e) {
				target.update(table);
			}
		} else {
			target.insert(table);
		}
		
		// create tbody element
		var tbody = new Element('tbody');
		table.insert(tbody);
		
		// fields
		this.fields.each(function(field, i) {
			var tr = field._tr = new Element('tr');//insert row
			tbody.insert(tr);
			
			//
			// th
			//
			var th = new Element('th');
			
			th.setStyle({
				width        : this.labelWidth,
				textAlign    : this.labelAlign,
				verticalAlign: this.labelValign
			});
			
			var label = new Element('label').insert(field.label || '&nbsp;');
			
			if (typeof field.icon !== 'undefined') {
				label.addClassName('hyperform-icon');
				label.setStyle({
					backgroundImage: 'url(' + field.icon + ')'
				})
			}
			
			th.insert(label);
			
			tr.insert(th);
			
			// adjust size by browser
			if (Prototype.Browser.WebKit === true) {
				setTimeout(function _adjustSizeWebkit() {
					if (this.labelWidth && (this.formWidth !== 'auto') && (table.getStyle('table-layout') === 'fixed')) {
						// adjust
						th.style.width = (
							parseInt(this.labelWidth.replace('px', ''), 10) +
							parseInt(th.getStyle('padding-left').replace('px', ''), 10) +
							parseInt(th.getStyle('padding-right').replace('px', ''), 10) +
							parseInt(th.getStyle('border-left-width').replace('px', ''), 10) +
							parseInt(th.getStyle('border-right-width').replace('px', ''), 10)
						) + 'px';
					}
				}.bind(this), 0);
			}
			
			//
			// td
			//
			// input/textarea
			if (typeof field.input !== 'undefined') {
				field._d = field.input;
				
				// basic input
				var isBasicInput = (
					(field.input.type === 'text') ||
					(field.input.type === 'password') ||
					(field.input.type === 'password-no-confirm')
				);
				if (isBasicInput) {
					// create input element
					field._f = new Element('input', {
						type       : (field.input.type === 'text') ? 'text' : 'password'
					});
					
					// create input container
					field._c = new Element('div', {className: 'input'}).insert(field._f);
					
					if (typeof field.input.maxlength !== 'undefined') {
						field._f.writeAttribute('maxlength', field.input.maxlength);
					}
					
					if (typeof field.input.placeholder !== 'undefined') {
						field._f.writeAttribute('placeholder', field.input.placeholder);
					}
					
					if (typeof field.input.value !== 'undefined') {
						field._f.writeAttribute('value', field.input.value);
					}
					
					if (typeof field.input.width !== 'undefined') {
						field._f.setStyle({width: field.input.width + 'px'});
					} else {
						field._f.setStyle({width: '200px'});
					}
					
					// observe onChange
					field._f.observe('change', function() {
						field.validate();
					});
					
					// for confirm input
					if (field.input.type === 'password') {
						// create input element
						field._fc = new Element('input', {
							type: 'password'
						});
						
						field._c.insert(field._fc);
						
						if (typeof field.input.maxlength !== 'undefined') {
							field._fc.writeAttribute('maxlength', field.input.maxlength);
						}
						
						if (typeof field.input.placeholder !== 'undefined') {
							field._fc.writeAttribute('placeholder', field.input.placeholder);
						}
						
						if (typeof field.input.value !== 'undefined') {
							field._fc.writeAttribute('value', field.input.value);
						}
						
						if (typeof field.input.width !== 'undefined') {
							field._fc.setStyle({width: field.input.width + 'px'});
						} else {
							field._fc.setStyle({width: '200px'});
						}
						
						// observe onChange
						field._fc.observe('change', function() {
							field.validate();
						});
					}
					
					// if appendText
					if (typeof field.input.appendText !== 'undefined') {
						field._c.insert(
							new Element('span', {className: 'append'}).insert(field.input.appendText)
						);
					}
					
					// if prependText
					if (typeof field.input.prependText !== 'undefined') {
						field._c.insert({top:
							new Element('span', {className: 'prepend'}).insert(field.input.prependText)
						});
					}
				}//<--if
				
				// textarea
				if (field.input.type === 'textarea') {
					// create textarea element
					field._f = new Element('textarea');
					
					if (typeof field.input.maxlength !== 'undefined') {
						field._f.writeAttribute('maxlength', field.input.maxlength);
					}
					
					if (typeof field.input.placeholder !== 'undefined') {
						field._f.writeAttribute('placeholder', field.input.placeholder);
					}
					
					if (typeof field.input.value !== 'undefined') {
						field._f.insert(field.input.value);
					}
					
					if (typeof field.input.width !== 'undefined') {
						field._f.setStyle({width: field.input.width + 'px'});
					} else {
						field._f.setStyle({width: '300px'});
					}
					
					if (typeof field.input.height !== 'undefined') {
						field._f.setStyle({height: field.input.height});
					} else {
						field._f.setStyle({height: '50px'});
					}
					
					// observe onChange
					field._f.observe('change', function() {
						field.validate();
					});
				}//<--if
				
				// radio
				if (field.input.type === 'radio') {
					// create *hidden* input element
					field._f = new Element('input', {type: 'hidden'});
					
					if (typeof field.input.value !== 'undefined') {
						field._f.writeAttribute('value', field.input.value);
					}
					
					// create *interface* container
					field._i = new Element('div', {className: 'radio'});
					
					// each items
					field.input.items.each(function _eachItemsInput(a) {
						// create radio button
						var button = new Element('button');
						field._i.insert(button);
						
						var label = new Element('label').insert(a.label);
						button.insert(label);
						
						if (typeof a.icon !== 'undefined') {
							label.addClassName('hyperform-icon');
							label.setStyle({
								backgroundImage: 'url(' + a.icon + ')'
							});
						}
						
						// observe onClick
						button.observe('click', function _onClickRadioBtn() {
							// write value
							field._f.writeAttribute('value', a.value);
							
							// rewrite selected className
							field._i.select('button').each(function _eachRadioBtns(b) {
								b.removeClassName('selected');
							});
							this.addClassName('selected');
							
							// validate
							field.validate();
						});
						
						// selected state
						if ((typeof a.isSelected !== 'undefined') && (a.isSelected === true)) {
							button.addClassName('selected');
							field._f.writeAttribute('value', a.value);
						}
						
						// button style customization
						if (typeof field.input.style !== 'undefined') {
							button.setStyle(field.input.style);
						}
					});//<--#each
				}//<--if
				
				// checkbox
				if (field.input.type === 'checkbox') {
					// create array
					field._a = [];
					
					// create *interface* container
					field._i = new Element('div', {className: 'checkbox'});
					
					// each items
					field.input.items.each(function _eachItemsInput(a) {
						// create radio button
						var button = new Element('button');
						
						var label = new Element('label').insert(a.label);
						
						if (typeof a.icon !== 'undefined') {
							label.addClassName('hyperform-icon');
							label.setStyle({
								backgroundImage: 'url(' + a.icon + ')'
							});
						}
						
						button.insert(label);
						
						// observe onClick
						button.observe('click', function _onClickChkboxBtn() {
							if (this.hasClassName('selected') === true) {
								// remove
								field._a = field._a.without(a.value);
								this.removeClassName('selected');
							} else {
								// add
								field._a.push(a.value);
								this.addClassName('selected');
							}
							
							// validate
							field.validate();
						});
						
						// insert to *interface* container
						field._i.insert(button);
						
						// selected state
						if ((typeof a.isSelected !== 'undefined') && (a.isSelected === true)) {
							button.addClassName('selected');
							field._a.push(a.value);
						}
						
						// button style customization
						if (typeof field.input.style !== 'undefined') {
							button.setStyle(field.input.style);
						}
					});//<--#each
				}//<--if
				
				// pulldown
				if (field.input.type === 'pulldown') {
					// create *hidden* input element
					field._f = new Element('input', {type : 'hidden'});
					
					if (typeof field.input.value !== 'undefined') {
						field._f.writeAttribute('value', field.input.value);
					}
					
					// create *interface* container
					field._i = new Element('div', {className: 'pulldown'});
					
					// interface
					var button = new Element('button');
					field._i.insert(button);
					
					var label = new Element('label');
					button.insert(label);
					
					var list = new Element('div', {className: 'pulldown-list'}).hide();
					field._i.insert(list);
					
					button.observe('click', function _onClickBtnPulldown() {
						button.toggleClassName('selecting');
						list.toggle();
					});
					
					field.input.items.unshift({
						label: '<span style="color: #999;">&mdash;</span>',
						value: ''
					});
					
					var selectItem = function _selectItem(n) {
						field._f.writeAttribute('value', field.input.items[n].value);
						
						label.update(field.input.items[n].label);
						
						if (typeof field.input.items[n].icon === 'undefined') {
							label.removeClassName('hyperform-icon');
							label.setStyle({
								backgroundImage: 'none'
							});
						} else {
							label.addClassName('hyperform-icon');
							label.setStyle({
								backgroundImage: 'url(' + field.input.items[n].icon + ')'
							});
						}
					};
					
					selectItem(0);
					
					// each items
					field.input.items.each(function _eachItemsInput(a, i) {
						var b = new Element('div').insert(a.label).observe('click', function() {
							selectItem(i);
							button.removeClassName('selecting');
							list.hide();
							
							// validate
							field.validate();
						});
						list.insert(b);
						
						if (typeof a.icon !== 'undefined') {
							b.addClassName('hyperform-icon');
							b.setStyle({
								backgroundImage: 'url(' + a.icon + ')'
							});
						}
						
						if (typeof a.isSelected === 'undefined') {
							return;//continue
						}
						
						if (a.isSelected !== true) {
							return;//continue
						}
						
						selectItem(i);
					});
				}//<--if
				
				// slider
				if (field.input.type === 'slider') {
					// create *hidden* input element
					field._f = new Element('input', {type : 'hidden'});
					
					if (typeof field.input.value !== 'undefined') {
						field._f.writeAttribute('value', field.input.value);
					}
					
					// create *interface* container
					field._i = new Element('div', {className: 'slider'});
					
					// interface
					var base = new Element('div', {className: 'slider-base'});
					field._i.insert(base);
					
					base.setStyle({
						width: (field.input.width || 300) + 'px'
					});
					
					var fill = new Element('div', {className: 'slider-fill'});
					base.insert(fill);
					
					fill.setStyle({
						//
					});
				}//<--if
			}//<--if
			
			// insert
			
			var td = new Element('td').setStyle({
				textAlign: field.align || 'left'
			});
			
			if (typeof field.style !== 'undefined') {
				td.setStyle(field.style);
			}
			
			if (typeof field._i !== 'undefined') {
				td.insert(field._i);
			}
			
			if (typeof field._c !== 'undefined') {
				td.insert(field._c);
			} else {
				if (typeof field._f !== 'undefined') {
					td.insert(field._f);
				}
			}
			
			if (typeof field.text !== 'undefined') {
				td.insert(new Element('div', {className: 'text'}).insert(field.text));
			}
			
			if (typeof field.description !== 'undefined') {
				td.insert(new Element('div', {className: 'text'}).insert(field.description));
			}
			
			if (typeof field.innerHTML !== 'undefined') {
				td.insert(new Element('div').insert(field.innerHTML));
			}
			
			// warn
			if (typeof field._d !== 'undefined') {
				field._warn = new Element('ul', {className:'warn'})
				td.insert({
					top: field._warn
				});
			}
			// insert
			tr.insert(td);
			
			// validate
			field.validate = function _validateRow() {
				this.validate(field.key);
				return field;
			}.bind(this);
			
			// leave a dependency check
			this.reliance(field);
		}.bind(this));
		
		//submit
		if ((this.onSubmit !== null) && (this.disableSubmitButton === false)) {
			var tr =  new Element('tr');//insert row
			tbody.insert(tr);
			
			table._submit = tr;
			//insert
			tr.insert(
				new Element('td', {
					align    : 'left',
					colspan  : 2,
					className: 'submit'
				}).insert(
					new Element('a').observe('click', function() { this.submit(); }.bind(this)).update(this.submitLabel)
				)
			);
		}
		
		this.applyStyle();
		
		return this;
	}//<--render
	,
	/**
	 *  Hyperform#validate([key]) -> Boolean
	 *
	 *  Validate the value of the specified item or all items of the form.
	 *  Will return a boolean as a result.
	**/
	validate: function(key) {
		this.fields.each(function(field) {
			// ignore
			if ((typeof key !== 'undefined') && (key !== field.key)) {
				return;//continue
			}
			
			field._valid = true;
			field._warn.update();
			
			// if unvisible
			if (field._tr.visible() === false) {
				return;//continue
			}
			
			if (typeof field._f !== 'undefined') {
				var value = $F(field._f);
				
				// if require
				if ((field._d.isRequired === true) && (value === '')) {
					field._valid = false;
				}
				
				// minlength
				if ((value !== '') && (field._d.minlength) && (field._d.minlength > value.length)) {
					field._valid = false;
				}
				
				// maxlength
				if ((value !== '') && (field._d.maxlength) && (field._d.maxlength < value.length)) {
					field._valid = false;
				}
				
				// if validator
				if ((value !== '') && (typeof field._d.validator !== 'undefined')) {
					if (value.replace(/\n/g, '').match(this.validator[field._d.validator].regex) === null) {
						field._valid = false;
						field._warn.insert(new Element('li').insert(this.validator[field._d.validator].warning));
					}
				}
				
				// if fc
				if (typeof field._fc !== 'undefined') {
					if (value !== $F(field._fc)) {
						field._valid = false;
					}
				}
			}
			
			if (typeof field._a !== 'undefined') {
				
			}
		}.bind(this));
		
		this.applyStyle();
		
		var isValid = true;
		
		this.fields.each(function(field) {
			if (typeof field._f == 'undefined') return;
			
			if (field._valid === false) {
				isValid = false;
				throw $break;
			}
		}.bind(this));
		
		return isValid;
	}
	,
	/**
	 *  Hyperform#submit() -> Hyperform
	 *
	 *  Submit the form.
	 *
	 *  That said, does not mean to send data automatically to somewhere.
	 *  Validates the entire form, call back the result to onSubmit If it is correct.
	**/
	submit: function() {
		// validate
		if (this.validate() === false) {
			return this;
		}
		
		// disable
		if (this.disableFormWhenSubmit === true) {
			this.disable();
		}
		
		if (this.onSubmit !== null) {
			this.onSubmit(this.result());
		}
		
		return this;
	}
	,
	/**
	 *  Hyperform#result() -> Object
	 *
	 *  Convert form data to the Object.
	**/
	result: function() {
		var result = {};
		
		this.fields.each(function(field) {
			if (field.key === null) return;//continue
			
			result[field.key] = this.getValue(field);
		}.bind(this));
		
		return result;
	}
	,
	/**
	 *  Hyperform#getValue(fieldObject) -> null, Number, String, Array
	 *
	 *  Get the value of the item.
	**/
	getValue: function _getValue(field) {
		if ((typeof field._f === 'undefined') && (typeof field._a === 'undefined')) {
			return null;
		}
		
		if (typeof field._d === 'undefined') {
			return null;
		}
		
		if (field._tr.visible() === false) {
			return null;
		}
		
		var isNumber = ((typeof field._d.isNumber !== 'undefined') && (field._d.isNumber === true));
		
		var result = null;
		
		if (Object.isArray(field._a) === true) {
			if (isNumber) {
				result = [];
				
				for (var i = 0; i < field._a.length; i++) {
					result.push(parseInt(field._a[i], 10));
				}
			} else {
				result = field._a;
			}
		}
		
		if (Object.isElement(field._f) === true) {
			if (isNumber) {
				result = parseInt($F(field._f), 10);
			} else {
				result = $F(field._f);
			}
		}
		
		return result;
	}
	,
	/**
	 *  Hyperform#disable() -> Hyperform
	**/
	disable: function _disable() {
		this.fields.each(function(field) {
			if (typeof field._f === 'undefined') {
				return;
			}
			
			field._f.disable();
		});
		
		this._table._submit.hide();
		
		return this;
	}
	,
	/**
	 *  Hyperform#enable() -> Hyperform
	**/
	enable: function _enable() {
		this.fields.each(function(field) {
			if (typeof field._f === 'undefined') {
				return;
			}
			
			field._f.enable();
		});
		
		this._table._submit.show();
		
		return this;
	}
	,
	/**
	 *  Hyperform#reliance(fieldObject) -> Boolean
	**/
	reliance: function _reliance(field) {
		if (typeof field.depends === 'undefined') {
			return false;
		}
		
		if ((field.depends.length === 0) || (Object.isArray(field.depends) === false)) {
			return false;
		}
		
		var depends = [];
		var entities= [];
		
		this.fields.each(function(r) {
			field.depends.findAll(function _findDepends(f) {
				return (f.key === r.key);
			}).each(function _eachDepends(f) {
				depends.push(f);
				entities.push(r);
			});
		});
		
		delete field.depends;
		
		if ((depends.length === 0) || (entities.length === 0) || (depends.length !== entities.length)) {
			return false;
		}
		
		(
			function _checkDependency() {
				var isActivation = true;
				
				for (var i = 0; i < depends.length; i++) {
					var value = this.getValue(entities[i]);
					
					if (typeof depends[i].operator === 'undefined') {
						if (typeof depends[i].value === 'undefined') {
							if (value === null) {
								isActivation = false;
							}
						} else {
							if (value !== depends[i].value) {
								isActivation = false;
							}
						}
					} else {
						if (eval(Object.inspect(value) + depends[i].operator + Object.inspect(depends[i].value))) {
							
						} else {
							isActivation = false;
						}
					}
				}
				
				var isChanged = false;
				
				if (isActivation) {
					if (field._tr.visible() === false) {
						isChanged = true;
						field._tr.show();
					}
				} else {
					if (field._tr.visible() === true) {
						isChanged = true;
						field._tr.hide();
					}
				}
				
				if (isChanged) {
					this.applyStyle();
				}
				
				setTimeout(arguments.callee.bind(this), 50);
			}.bind(this)
		)();
		
		return true;
	}
	,
	/**
	 *  Hyperform#applyStyle() -> Hyperform
	 *
	 *  Apply styles to the fields.
	**/
	applyStyle: function _applyStyle() {
		this.fields.findAll(function _findVisibleRows(field) {
			return ((typeof field._tr !== 'undefined') && field._tr.visible());
		}).each(function _eachRows(field, i) {
			// odd style
			if (i % 2 === 0) {
				field._tr.addClassName('hyperform-odd');
			} else {
				field._tr.removeClassName('hyperform-odd');
			}
			
			// intelli validations
			if (typeof field._valid !== 'undefined') {
				if (field._valid === true) {
					field._tr.removeClassName('invalid');
					field._tr.addClassName('valid');
				} else {
					field._tr.removeClassName('valid');
					field._tr.addClassName('invalid');
				}
			}
		});
		
		return this;
	}
});