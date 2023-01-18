# CS:GO Chaos Mod Voting Overlay

### Installation
- Download the latest release and run the `setup.exe`
  
OR
### Running this locally
1. Install the node modules by running `npm i`.
2. Run `npm run compile` and wait for the app to compile.
3. Run `npm start`.
- To build the app into a .exe, run `npm run build`
- You can use `npm run watch` in a separate terminal to automatically compile the app on every save, you can then run `npm start` to start the app every time.

### Usage
- Ensure that your CS:GO server's launch options uses the `-usercon` paramater to allow RCON connections.
- You can type `status` while on the csgo server to get the ip and port.
- The server's RCON password is either defined in your `server.cfg` or as a launch option parameter.
- Enter your Twitch or YouTube details and then your Servers connection details, and press Connect.
- If both connections are successful, two green ticks will be displayed and the `Open Voting` button will appear, clicking that will bring up the overlay.
  
<p align="center">
	<img src="https://csgochaosmod.com/gallery/twitch-overlay/App_1.PNG" 	width="250" title="Twitch Setup">
	<img src="https://csgochaosmod.com/gallery/twitch-overlay/App_2.PNG" 	width="250" title="YouTube Setup">
	<img src="https://csgochaosmod.com/gallery/twitch-overlay/Voting_3.PNG" width="250" title="Voting Panel">
</p>

### OBS
Below is a setup on keying out the green from the voting panel, apply a Colour Key filter to the window capture of the voting panel.

<p align="center">
	<img src="https://csgochaosmod.com/gallery/twitch-overlay/OBS_1.PNG" 	width="550" title="Setup">
	<img src="https://csgochaosmod.com/gallery/twitch-overlay/OBS_2.PNG" 	width="550" title="Setup">
</p>

### Known Issues
- Due to the nature of the RCON connection, the app may crash or stop sending requests when the map changes. Simply restart the app and re-connect after a map change.
- Often the voting overlay may not update its UI if its minimised or behind another window, ensure it is visible on top of other windows, this may require a second monitor.