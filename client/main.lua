RDX = nil
local lastPressed = "NAV_UP"

Citizen.CreateThread(function()
	while RDX == nil do
		TriggerEvent('rdx:getSharedObject', function(obj) RDX = obj end)
		Citizen.Wait(0)
	end

	local GUI, MenuType = {}, 'default'
	GUI.Time = 0

	local openMenu = function(namespace, name, data)
		SendNUIMessage({
			action = 'openMenu',
			namespace = namespace,
			name = name,
			data = data
		})
	end

	local closeMenu = function(namespace, name)
		SendNUIMessage({
			action = 'closeMenu',
			namespace = namespace,
			name = name,
		})
	end

	RDX.UI.Menu.RegisterType(MenuType, openMenu, closeMenu)

	AddEventHandler('rdx_menu_default:message:menu_submit', function(data)
		local menu = RDX.UI.Menu.GetOpened(MenuType, data._namespace, data._name)

		Citizen.InvokeNative(0xCE5D0FFE83939AF1, -1, "SELECT", "HUD_SHOP_SOUNDSET", 1)

		if menu.submit ~= nil then
			menu.submit(data, menu)
		end
	end)

	AddEventHandler('rdx_menu_default:message:menu_cancel', function(data)
		local menu = RDX.UI.Menu.GetOpened(MenuType, data._namespace, data._name)

		Citizen.InvokeNative(0xCE5D0FFE83939AF1, -1, "BACK", "HUD_SHOP_SOUNDSET", 1)

		if menu.cancel ~= nil then
			menu.cancel(data, menu)
		end
	end)

	AddEventHandler('rdx_menu_default:message:menu_change', function(data)
		local menu = RDX.UI.Menu.GetOpened(MenuType, data._namespace, data._name)

		for i=1, #data.elements, 1 do
			menu.setElement(i, 'value', data.elements[i].value)

			if data.elements[i].selected then
				menu.setElement(i, 'selected', true)
			else
				menu.setElement(i, 'selected', false)
			end
		end

		Citizen.InvokeNative(0xCE5D0FFE83939AF1, -1, lastPressed, "HUD_SHOP_SOUNDSET", 1)

		if menu.change ~= nil then
			menu.change(data, menu)
		end
	end)

	Citizen.CreateThread(function()
		while true do
			Citizen.Wait(10)

			if IsControlPressed(0, 0xCDC4E4E9) and IsInputDisabled(0) and (GetGameTimer() - GUI.Time) > 150 then
				SendNUIMessage({action = 'controlPressed', control = 'ENTER'})
				GUI.Time = GetGameTimer()
			end

			if IsControlPressed(0, 0x156F7119) and IsInputDisabled(0) and (GetGameTimer() - GUI.Time) > 150 then
				SendNUIMessage({action  = 'controlPressed', control = 'BACKSPACE'})
				GUI.Time = GetGameTimer()
			end

			if IsControlPressed(0, 0x6319DB71) and IsInputDisabled(0) and (GetGameTimer() - GUI.Time) > 200 then
				lastPressed = 'NAV_UP'
				SendNUIMessage({action  = 'controlPressed', control = 'TOP'})
				GUI.Time = GetGameTimer()
			end

			if IsControlPressed(0, 0x05CA7C52) and IsInputDisabled(0) and (GetGameTimer() - GUI.Time) > 200 then
				lastPressed = 'NAV_DOWN'
				SendNUIMessage({action  = 'controlPressed', control = 'DOWN'})
				GUI.Time = GetGameTimer()
			end

			if IsControlPressed(0, 0xA65EBAB4) and IsInputDisabled(0) and (GetGameTimer() - GUI.Time) > 150 then
				lastPressed = 'NAV_LEFT'
				SendNUIMessage({action  = 'controlPressed', control = 'LEFT'})
				GUI.Time = GetGameTimer()
			end

			if IsControlPressed(0, 0xDEB34313) and IsInputDisabled(0) and (GetGameTimer() - GUI.Time) > 150 then
				lastPressed = 'NAV_RIGHT'
				SendNUIMessage({action  = 'controlPressed', control = 'RIGHT'})
				GUI.Time = GetGameTimer()
			end
		end
	end)
end)
