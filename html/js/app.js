(function(){
	let MenuTpl = `
		<div id="menu_{{_namespace}}_{{_name}}" class="menu{{#align}} align-{{align}}{{/align}}">
			<div class="head">
				<h1>{{{title}}}</h1>
				<span>{{{subtitle}}}</span>
				<div class="head_bg"></div>
			</div>
			<div class="menu-items">
				{{#elements}}
				<div class="menu-item {{#selected}}selected{{/selected}}">
					<span>{{{label}}} {{#submenu}}<img src="img/arrow_right.png" class="sub-menu" />{{/submenu}}</span>
				</div>
				{{/elements}}
			</div>
			{{#border}}
				<div class="menu-border">
					<span>{{current}} of {{number}}</span>
				</div>
			{{/border}}
			{{#description}}
				<div class="menu-description">
					<span>{{{description}}}</span>
				</div>
			{{/description}}
			<div class="menu_bg"></div>
		</div>`;

	window.RDX_MENU = {};
	RDX_MENU.ResourceName = 'rdx_menu_default';
	RDX_MENU.opened = {};
	RDX_MENU.focus = [];
	RDX_MENU.pos = {};

	RDX_MENU.open = function(namespace, name, data) {
		if (typeof RDX_MENU.opened[namespace] == 'undefined') {
			RDX_MENU.opened[namespace] = {};
		}

		if (typeof RDX_MENU.opened[namespace][name] != 'undefined') {
			RDX_MENU.close(namespace, name);
		}

		if (typeof RDX_MENU.pos[namespace] == 'undefined') {
			RDX_MENU.pos[namespace] = {};
		}

		for (let i=0; i<data.elements.length; i++) {
			if (typeof data.elements[i].type == 'undefined') {
				data.elements[i].type = 'default';
			}
		}

		data._index = RDX_MENU.focus.length;
		data._namespace = namespace;
		data._name = name;

		for (let i=0; i<data.elements.length; i++) {
			data.elements[i]._namespace = namespace;
			data.elements[i]._name = name;
		}

		RDX_MENU.opened[namespace][name] = data;
		RDX_MENU.pos[namespace][name] = 0;

		for (let i=0; i<data.elements.length; i++) {
			if (data.elements[i].selected) {
				RDX_MENU.pos[namespace][name] = i;
			} else {
				data.elements[i].selected = false;
			}
		}

		RDX_MENU.focus.push({
			namespace: namespace,
			name: name
		});

		RDX_MENU.render();
		$('#menu_' + namespace + '_' + name).find('.menu-item.selected')[0].scrollIntoView();
	};

	RDX_MENU.close = function(namespace, name) {
		delete RDX_MENU.opened[namespace][name];

		for (let i=0; i<RDX_MENU.focus.length; i++) {
			if (RDX_MENU.focus[i].namespace == namespace && RDX_MENU.focus[i].name == name) {
				RDX_MENU.focus.splice(i, 1);
				break;
			}
		}

		RDX_MENU.render();
	};

	RDX_MENU.render = function() {
		let menuContainer = document.getElementById('menus');
		let focused = RDX_MENU.getFocused();
		menuContainer.innerHTML = '';
		$(menuContainer).hide();

		for (let namespace in RDX_MENU.opened) {
			for (let name in RDX_MENU.opened[namespace]) {
				let menuData = RDX_MENU.opened[namespace][name];
				let view = JSON.parse(JSON.stringify(menuData));
				let selectedNumber = 0

				if (typeof view.description != 'undefined') {
					delete view.description
				}

				for (let i=0; i<menuData.elements.length; i++) {
					let element = view.elements[i];

					switch (element.type) {
						case 'default': break;

						case 'slider': {
							element.isSlider = true;
							element.sliderLabel = (typeof element.options == 'undefined') ? element.value : element.options[element.value];

							break;
						}

						default: break;
					}

					if (i == RDX_MENU.pos[namespace][name]) {
						element.selected = true;
						selectedNumber = (i + 1);
					}

					if (element.selected && (typeof element.description != 'undefined' && element.description != false)) {
						view.description = [
							{ "description": element.description }
						];
					}
				}

				if (typeof view.border == 'undefined' || view.border != false) {
					view.border = [
						{ "current": selectedNumber, "number": menuData.elements.length }
					];
				}

				let menu = $(Mustache.render(MenuTpl, view))[0];
				$(menu).hide();
				menuContainer.appendChild(menu);
			}
		}

		if (typeof focused != 'undefined') {
			$('#menu_' + focused.namespace + '_' + focused.name).show();
		}

		$(menuContainer).show();

	};

	RDX_MENU.submit = function(namespace, name, data) {
		SendMessage(RDX_MENU.ResourceName, 'menu_submit', {
			_namespace: namespace,
			_name: name,
			current: data,
			elements: RDX_MENU.opened[namespace][name].elements
		});
	};

	RDX_MENU.cancel = function(namespace, name) {
		SendMessage(RDX_MENU.ResourceName, 'menu_cancel', {
			_namespace: namespace,
			_name: name
		});
	};

	RDX_MENU.change = function(namespace, name, data) {
		SendMessage(RDX_MENU.ResourceName, 'menu_change', {
			_namespace: namespace,
			_name: name,
			current: data,
			elements: RDX_MENU.opened[namespace][name].elements
		});
	};

	RDX_MENU.getFocused = function() {
		return RDX_MENU.focus[RDX_MENU.focus.length - 1];
	};

	window.onData = (data) => {
		switch (data.action) {

			case 'openMenu': {
				RDX_MENU.open(data.namespace, data.name, data.data);
				break;
			}

			case 'closeMenu': {
				RDX_MENU.close(data.namespace, data.name);
				break;
			}

			case 'controlPressed': {
				switch (data.control) {

					case 'ENTER': {
						let focused = RDX_MENU.getFocused();

						if (typeof focused != 'undefined') {
							let menu = RDX_MENU.opened[focused.namespace][focused.name];
							let pos = RDX_MENU.pos[focused.namespace][focused.name];
							let elem = menu.elements[pos];

							if (menu.elements.length > 0) {
								RDX_MENU.submit(focused.namespace, focused.name, elem);
							}
						}

						break;
					}

					case 'BACKSPACE': {
						let focused = RDX_MENU.getFocused();

						if (typeof focused != 'undefined') {
							RDX_MENU.cancel(focused.namespace, focused.name);
						}

						break;
					}

					case 'TOP': {
						let focused = RDX_MENU.getFocused();

						if (typeof focused != 'undefined') {
							let menu = RDX_MENU.opened[focused.namespace][focused.name];
							let pos = RDX_MENU.pos[focused.namespace][focused.name];

							if (pos > 0) {
								RDX_MENU.pos[focused.namespace][focused.name]--;
							} else {
								RDX_MENU.pos[focused.namespace][focused.name] = menu.elements.length - 1;
							}

							let elem = menu.elements[RDX_MENU.pos[focused.namespace][focused.name]];

							for (let i=0; i<menu.elements.length; i++) {
								if (i == RDX_MENU.pos[focused.namespace][focused.name]) {
									menu.elements[i].selected = true;
								} else {
									menu.elements[i].selected = false;
								}
							}

							RDX_MENU.change(focused.namespace, focused.name, elem);
							RDX_MENU.render();

							$('#menu_' + focused.namespace + '_' + focused.name).find('.menu-item.selected')[0].scrollIntoView();
						}

						break;
					}

					case 'DOWN': {
						let focused = RDX_MENU.getFocused();

						if (typeof focused != 'undefined') {
							let menu = RDX_MENU.opened[focused.namespace][focused.name];
							let pos = RDX_MENU.pos[focused.namespace][focused.name];
							let length = menu.elements.length;

							if (pos < length - 1) {
								RDX_MENU.pos[focused.namespace][focused.name]++;
							} else {
								RDX_MENU.pos[focused.namespace][focused.name] = 0;
							}

							let elem = menu.elements[RDX_MENU.pos[focused.namespace][focused.name]];

							for (let i=0; i<menu.elements.length; i++) {
								if (i == RDX_MENU.pos[focused.namespace][focused.name]) {
									menu.elements[i].selected = true;
								} else {
									menu.elements[i].selected = false;
								}
							}

							RDX_MENU.change(focused.namespace, focused.name, elem);
							RDX_MENU.render();

							$('#menu_' + focused.namespace + '_' + focused.name).find('.menu-item.selected')[0].scrollIntoView();
						}

						break;
					}

					case 'LEFT': {
						let focused = RDX_MENU.getFocused();

						if (typeof focused != 'undefined') {
							let menu = RDX_MENU.opened[focused.namespace][focused.name];
							let pos = RDX_MENU.pos[focused.namespace][focused.name];
							let elem = menu.elements[pos];

							switch(elem.type) {
								case 'default': break;

								case 'slider': {
									let min = (typeof elem.min == 'undefined') ? 0 : elem.min;

									if (elem.value > min) {
										elem.value--;
										RDX_MENU.change(focused.namespace, focused.name, elem);
									}

									RDX_MENU.render();
									break;
								}

								default: break;
							}

							$('#menu_' + focused.namespace + '_' + focused.name).find('.menu-item.selected')[0].scrollIntoView();
						}

						break;
					}

					case 'RIGHT': {
						let focused = RDX_MENU.getFocused();

						if (typeof focused != 'undefined') {
							let menu = RDX_MENU.opened[focused.namespace][focused.name];
							let pos = RDX_MENU.pos[focused.namespace][focused.name];
							let elem = menu.elements[pos];

							switch(elem.type) {
								case 'default': break;

								case 'slider': {
									if (typeof elem.options != 'undefined' && elem.value < elem.options.length - 1) {
										elem.value++;
										RDX_MENU.change(focused.namespace, focused.name, elem);
									}

									if (typeof elem.max != 'undefined' && elem.value < elem.max) {
										elem.value++;
										RDX_MENU.change(focused.namespace, focused.name, elem);
									}

									RDX_MENU.render();
									break;
								}

								default: break;
							}

							$('#menu_' + focused.namespace + '_' + focused.name).find('.menu-item.selected')[0].scrollIntoView();
						}

						break;
					}

					default: break;
				}

				break;
			}
		}
	};

	window.onload = function(e){
		window.addEventListener('message', (event) => {
			onData(event.data);
		});
	};

})();
