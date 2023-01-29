# CS:GO Chaos Mod Voting Overlay

### Installation
- Download the latest release and extract the zip file and run the `CSGO.Chaos.Mod.Voting.Setup.x.x.x.exe` to one-click install the app. It should run automatically after.
  
OR

### Running this locally
0. Clone the repository with `git clone https://github.com/b0ink/csgo-chaos-mod-voting-overlay.git` or download it as a ZIP file and extract it.
1. Using a terminal from within the folder, install the node modules with `npm install`.
2. `npm run compile` to compile the `src/` files.
3. `npm start` to run the app.
- Additionally, to build the app into a setup.exe, run `npm run build`
- You can use `npm run watch` in a separate terminal to automatically compile the app on every save, you can then run `npm start` to start the app every time.

### Usage
- Ensure that your CS:GO server's launch options uses the `-usercon` paramater to allow RCON connections.
- You can type `status` while on the csgo server to get the ip and port.
- The server's RCON password is either defined in your `server.cfg` or as a launch option parameter.
- Enter your Twitch or YouTube details and then your Servers connection details, and press Connect.
- If both connections are successful, two green ticks will be displayed and the `Open Voting` button will appear, clicking that will bring up the overlay.


### Preferences
A settings icon is present in the bottom right corner of the connection setup window. This allows you to change several mechanics of the voting system, theme/colour changes of the voting overlay, and a few other start-up options.

<p align="center">
	<img src="https://csgochaosmod.com/gallery/twitch-overlay/App_1.PNG" 	width="250" title="Twitch Setup">
	<img src="https://csgochaosmod.com/gallery/twitch-overlay/App_2.PNG" 	width="250" title="YouTube Setup">
</p>
<p align="center">
	<img src="https://csgochaosmod.com/gallery/twitch-overlay/Voting_Idle.png?v=1" 	width="250" title="Twitch Setup">
	<img src="https://csgochaosmod.com/gallery/twitch-overlay/Voting_Votes.png?v=1" 	width="250" title="YouTube Setup">
	<img src="https://csgochaosmod.com/gallery/twitch-overlay/Voting_Highlight.png" width="250" title="Voting Panel">
</p>

### OBS
Below is a setup on keying out the green from the voting panel, apply a Colour Key filter to the window capture of the voting panel.

<p align="center">
	<img src="https://csgochaosmod.com/gallery/twitch-overlay/OBS_1.PNG" 	width="550" title="Setup">
	<img src="https://csgochaosmod.com/gallery/twitch-overlay/OBS_2.PNG" 	width="550" title="Setup">
</p>

### Known Issues
- As of v1.2.1 the app ensures a constant connection to the CS:GO server via rcon, but if at any point you notice it has stopped sending requests, re-launch the app and reconnect.
- Often the voting overlay may not update its UI if it's minimised or behind another window, ensure it is visible on top of other windows, this may require a second monitor. A preference option (via the settings icon in the bottom right) is available to force the voting 'always-on-top' of other windows.