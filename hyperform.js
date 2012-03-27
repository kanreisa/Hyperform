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
		this.form        = opt.form        || [];
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
		
		// rows
		this.form.each(function(row, i) {
			var r = row._tr = new Element('tr');
			tbody.insert(r);
			
			if (i % 2 === 0) {
				r.addClassName('hyperform-odd');
			}
			
			//
			// th
			//
			var th = new Element('th');
			
			th.setStyle({
				width        : this.labelWidth,
				textAlign    : this.labelAlign,
				verticalAlign: this.labelValign
			});
			
			var label = new Element('label').insert(row.label || '&nbsp;');
			
			if (typeof row.icon !== 'undefined') {
				label.addClassName('hyperform-icon');
				label.setStyle({
					backgroundImage: 'url(' + row.icon + ')'
				})
			}
			
			th.insert(label);
			
			r.insert(th);
			
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
			if (typeof row.input !== 'undefined') {
				row._d = row.input;
				
				// basic input
				var isBasicInput = (
					(row.input.type === 'text') ||
					(row.input.type === 'password') ||
					(row.input.type === 'password-no-confirm')
				);
				if (isBasicInput) {
					// create input element
					row._f = new Element('input', {
						type       : (row.input.type === 'text') ? 'text' : 'password'
					});
					
					// create input container
					row._c = new Element('div', {className: 'input'}).insert(row._f);
					
					if (typeof row.input.maxlength !== 'undefined') {
						row._f.writeAttribute('maxlength', row.input.maxlength);
					}
					
					if (typeof row.input.placeholder !== 'undefined') {
						row._f.writeAttribute('placeholder', row.input.placeholder);
					}
					
					if (typeof row.input.value !== 'undefined') {
						row._f.writeAttribute('value', row.input.value);
					}
					
					if (typeof row.input.width !== 'undefined') {
						row._f.setStyle({width: row.input.width});
					} else {
						row._f.setStyle({width: '200px'});
					}
					
					// observe onChange
					row._f.observe('change', function() {
						row.validate();
					});
					
					// for confirm input
					if (row.input.type === 'password') {
						// create input element
						row._fc = new Element('input', {
							type: 'password'
						});
						
						row._c.insert(row._fc);
						
						if (typeof row.input.maxlength !== 'undefined') {
							row._fc.writeAttribute('maxlength', row.input.maxlength);
						}
						
						if (typeof row.input.placeholder !== 'undefined') {
							row._fc.writeAttribute('placeholder', row.input.placeholder);
						}
						
						if (typeof row.input.value !== 'undefined') {
							row._fc.writeAttribute('value', row.input.value);
						}
						
						if (typeof row.input.width !== 'undefined') {
							row._fc.setStyle({width: row.input.width});
						} else {
							row._fc.setStyle({width: '200px'});
						}
						
						// observe onChange
						row._fc.observe('change', function() {
							row.validate();
						});
					}
					
					// if appendText
					if (typeof row.input.appendText !== 'undefined') {
						row._c.insert(
							new Element('span', {className: 'append'}).insert(row.input.appendText)
						);
					}
					
					// if prependText
					if (typeof row.input.prependText !== 'undefined') {
						row._c.insert({top:
							new Element('span', {className: 'prepend'}).insert(row.input.prependText)
						});
					}
				}//<--if
				
				// textarea
				if (row.input.type === 'textarea') {
					// create textarea element
					row._f = new Element('textarea');
					
					if (typeof row.input.maxlength !== 'undefined') {
						row._f.writeAttribute('maxlength', row.input.maxlength);
					}
					
					if (typeof row.input.placeholder !== 'undefined') {
						row._f.writeAttribute('placeholder', row.input.placeholder);
					}
					
					if (typeof row.input.value !== 'undefined') {
						row._f.insert(row.input.value);
					}
					
					if (typeof row.input.width !== 'undefined') {
						row._f.setStyle({width: row.input.width});
					} else {
						row._f.setStyle({width: '300px'});
					}
					
					if (typeof row.input.height !== 'undefined') {
						row._f.setStyle({height: row.input.height});
					} else {
						row._f.setStyle({height: '50px'});
					}
					
					// observe onChange
					row._f.observe('change', function() {
						row.validate();
					});
				}//<--if
				
				// radio
				if (row.input.type === 'radio') {
					// create *hidden* input element
					row._f = new Element('input', {type: 'hidden'});
					
					if (typeof row.input.value !== 'undefined') {
						row._f.writeAttribute('value', row.input.value);
					}
					
					// create *interface* container
					row._i = new Element('div', {className: 'radio'});
					
					// each items
					row.input.items.each(function _eachItemsInput(a) {
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
						button.observe('click', function _onClickRadioBtn() {
							// write value
							row._f.writeAttribute('value', a.value);
							
							// rewrite selected className
							row._i.select('button').each(function _eachRadioBtns(b) {
								b.removeClassName('selected');
							});
							this.addClassName('selected');
							
							// validate
							row.validate();
						});
						
						// insert to *interface* container
						row._i.insert(button);
						
						// selected state
						if ((typeof i.selected !== 'undefined') && (i.selected === true)) {
							button.addClassName('selected');
							row._f.writeAttribute('value', a.value);
						}
						
						// button style customization
						if (typeof row.input.style !== 'undefined') {
							button.setStyle(row.input.style);
						}
					});//<--#each
				}//<--if
				
				// checkbox
				if (row.input.type === 'checkbox') {
					// create array
					row._a = [];
					
					// create *interface* container
					row._i = new Element('div', {className: 'checkbox'});
					
					// each items
					row.input.items.each(function _eachItemsInput(a) {
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
								row._a = row._a.without(a.value);
								this.removeClassName('selected');
							} else {
								// add
								row._a.push(a.value);
								this.addClassName('selected');
							}
							
							// validate
							row.validate();
						});
						
						// insert to *interface* container
						row._i.insert(button);
						
						// selected state
						if ((typeof i.selected !== 'undefined') && (i.selected === true)) {
							button.addClassName('selected');
							row._a.push(a.value);
						}
						
						// button style customization
						if (typeof row.input.style !== 'undefined') {
							button.setStyle(row.input.style);
						}
					});//<--#each
				}//<--if
				
				//pulldown
				if (row.input.type == 'pulldown') {
					row._f = new Element('input', {
						type : 'hidden',
						value: row.input.value || ''
					});
					
					row._i = new Element('select', {className:'pulldown'}).setStyle({
						width: (row.input.width  || 250) + 'px'
					});
					row.input.items.each(function(i) {
						row._i.insert('<option value="' + i.value + '">' + i.label + '</option>');
					});
					
					row._i.observe('change', function _onChangePulldown() {
						row._f.value = $F(row._i);
						
						// validate
						row.validate();
					});
					
					row._i.options.selectedIndex = 0;
					
					row.input.items.each(function(i, count) {
						if (!i.selected) return;
						//if selected
						row._i.options.selectedIndex = count;
					});
					
					row._f.value = $F(row._i);
				}//<--if
			}//<--if
			
			// insert
			
			var td = new Element('td').setStyle({
				textAlign: row.align || 'left'
			});
			
			if (typeof row.style !== 'undefined') {
				td.setStyle(row.style);
			}
			
			if (typeof row._i !== 'undefined') {
				td.insert(row._i);
			}
			
			if (typeof row._c !== 'undefined') {
				td.insert(row._c);
			} else {
				if (typeof row._f !== 'undefined') {
					td.insert(row._f);
				}
			}
			
			if (typeof row.text !== 'undefined') {
				td.insert(new Element('div', {className: 'text'}).insert(row.text));
			}
			
			if (typeof row.description !== 'undefined') {
				td.insert(new Element('div', {className: 'text'}).insert(row.description));
			}
			
			if (typeof row.innerHTML !== 'undefined') {
				td.insert(new Element('div').insert(row.innerHTML));
			}
			
			// warn
			if (typeof row._d !== 'undefined') {
				row._warn = new Element('ul', {className:'warn'})
				td.insert({
					top: row._warn
				});
			}
			// insert
			r.insert(td);
			
			// validate
			row.validate = function _validateRow() {
				this.validate(row.key);
				return row;
			}.bind(this);
			
			// leave a dependency check
			this.reliance(row);
		}.bind(this));
		
		//submit
		if ((this.onSubmit !== null) && (this.disableSubmitButton === false)) {
			var r = $(table.insertRow(-1));//insert row
			table._submit = r;
			//insert
			r.insert(
				new Element('td', {
					align    : 'left',
					colspan  : 2,
					className: 'submit'
				}).insert(
					new Element('a').observe('click', function() { this.submit(); }.bind(this)).update(this.submitLabel)
				)
			);
		}
		
		return this;
	}//<--render
	,
	/**
	 *  Hyperform#validate([key]) -> Boolean
	 *
	 *  Validate the value of the specified item or all items of the form.
	 *  Then apply the CSS class name to input interface of each item. (.valid/.invalid)
	 *  Will return a boolean as a result.
	**/
	validate: function(key) {
		this.form.each(function(row) {
			// ignore
			if ((typeof key !== 'undefined') && (key !== row.key)) {
				return;//continue
			}
			
			if ((typeof row._f === 'undefined') && (typeof row._a === 'undefined')) {
				return;//continue
			}
			
			if (typeof row._d === 'undefined') {
				return;//continue
			}
			
			
			row._valid = true;
			row._warn.update();
			
			if (typeof row._f !== 'undefined') {
				var value = $F(row._f);
				
				// if require
				if ((row._d.isRequired === true) && (value === '')) {
					row._valid = false;
				}
				
				// minlength
				if ((value !== '') && (row._d.minlength) && (row._d.minlength > value.length)) {
					row._valid = false;
				}
				
				// maxlength
				if ((value !== '') && (row._d.maxlength) && (row._d.maxlength < value.length)) {
					row._valid = false;
				}
				
				// if validator
				if ((value !== '') && (typeof row._d.validator !== 'undefined')) {
					if (value.replace(/\n/g, '').match(this.validator[row._d.validator].regex) === null) {
						row._valid = false;
						row._warn.insert(new Element('li').insert(this.validator[row._d.validator].warning));
					}
				}
				
				// if fc
				if (typeof row._fc !== 'undefined') {
					if (value !== $F(row._fc)) {
						row._valid = false;
					}
				}
				
				// result
				if (row._valid === true) {
					row._f.removeClassName('invalid');
					row._f.addClassName('valid');
					
					if (typeof row._fc !== 'undefined') {
						row._fc.removeClassName('invalid');
						row._fc.addClassName('valid');
					}
					
					if (typeof row._i !== 'undefined') {
						row._i.removeClassName('invalid');
						row._i.addClassName('valid');
					}
				}else{
					row._f.removeClassName('valid');
					row._f.addClassName('invalid');
					
					if (typeof row._fc !== 'undefined') {
						row._fc.removeClassName('valid');
						row._fc.addClassName('invalid');
					}
					
					if (typeof row._i !== 'undefined') {
						row._i.removeClassName('valid');
						row._i.addClassName('invalid');
					}
				}
			}
			
			if (typeof row._a !== 'undefined') {
				
			}
		}.bind(this));
		
		var isValid = true;
		
		this.form.each(function(row) {
			if (typeof row._f == 'undefined') return;
			
			if (row._valid === false) {
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
		
		this.form.each(function(row) {
			result[row.key] = null;
			
			if ((typeof row._f === 'undefined') && (typeof row._a === 'undefined')) {
				return;//continue
			}
			
			if (typeof row._d === 'undefined') {
				return;//continue
			}
			
			var isNumber = ((typeof row._d.isNumber !== 'undefined') && (row._d.isNumber === true));
			
			if (Object.isArray(row._a) === true) {
				if (isNumber) {
					result[row.key] = [];
					
					for (var i = 0; i < row._a.length; i++) {
						result[row.key].push(parseInt(row._a[i], 10));
					}
				} else {
					result[row.key] = row._a;
				}
			}
			
			if (Object.isElement(row._f) === true) {
				if (isNumber) {
					result[row.key] = parseInt($F(row._f), 10);
				} else {
					result[row.key] = $F(row._f);
				}
			}
		});
		
		return result;
	}
	,
	/**
	 *  Hyperform#disable() -> Hyperform
	**/
	disable: function _disable() {
		//disable form
		this.form.each(function(row) {
			if (typeof row._f === 'undefined') {
				return;
			}
			
			row._f.disable();
		});
		
		this._table._submit.hide();
		
		return this;
	}
	,
	/**
	 *  Hyperform#enable() -> Hyperform
	**/
	enable: function _enable() {
		//disable form
		this.form.each(function(row) {
			if (typeof row._f === 'undefined') {
				return;
			}
			
			row._f.enable();
		});
		
		this._table._submit.show();
		
		return this;
	}
	,
	/**
	 *  Hyperform#reliance(rowObject) -> Boolean
	**/
	reliance: function _reliance(row) {
		if (typeof row.depend === 'undefined') {
			return false;
		}
	}
});