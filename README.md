
# Stormgate World Overlay

### A tool for streamers to display information about ongoing games in their broadcasts.

* Supports Ranked 1v1 games using Stormgate World api
* Shows players' names, ranking, race and win rate
* Ready to use as a browser source in OBS and Streamlabs OBS

Get yours at [overlay.stormgateworld.com](https://overlay.stormgateworld.com/)

<img width="1005" alt="CleanShot 2022-11-13 at 02 08 30@2x" src="https://user-images.githubusercontent.com/6642554/201501074-ea967231-59cb-44b4-b339-437bf741255c.png">


> **Note** 
> You can post feedback or suggestions in the #stormgateworld-leaderboard and #stormgateworld-api channels on the official Stormgate playtest discord.

---

## Set up

To get the Stormgate World Overlay for your account, follow the steps outline on [overlay.stormgateworld.com](https://overlay.stormgateworld.com/). 

--- 

## Manual Set up 
The overlay is actually a personalized web page that you can include as a browser source in your streaming software. First, you will need to create the right url, outlined below, then you can add it as a source.

#### Profile ID
The url for your overlay needs your Stormgate World player ID. Your player ID is the alphanumberic digits in the url of your profile page on aoe4world.com. For example, VortiX's profile url is https://stormgateworld.com/players/9qgUTN-VortiX, so his player ID is 9qgUTN. 

### Default url
To use the overlay in the default setup, replace the digits in the below url with your player ID.

```
https://overlay.stormgateworld.com/profile/9qgUTN/bar?theme=top
```

> **Note** This url will change once the overlay comes out of beta

#### Default theme
The default behavior is intended for showing the overlay at the top of your stream, split up to left and right side of the Top Ability Bar.

#### Center theme
The default behavior is intended for showing the overlay at the top of your stream, centered to the screen below the Top Ability Bar. This covers more of the playable area. Replace `theme=top` with `theme=center` in your url.

#### Left/Right theme
If you want to show the overlay in an arbitrary position on the side of the screen, you can use the left/right side list theme. This will show the players as a vertical list. Replace `theme=top` with `theme=left`/`theme=right` in your url.

#### Floating theme
If you want to show the overlay in an arbitrary position, like the  corner of your stream, you can use the floating theme. This will render the overlay in a fixed width with round corners on all sides. To use the floating theme, replace `theme=top` with `theme=floating` in your url.

### Add as a browser source
Once you have the url, you can add it as a browser source in your streaming software, following these guides:

* [OBS](https://obsproject.com/wiki/Sources-Guide#browser-source)
* [Streamlabs OBS](https://blog.streamlabs.com/introducing-browser-source-interaction-for-streamlabs-obs-d8fc4dcbb1fb)

In both instances, you should set it to 1920px / 1080px resolution. This makes it easier to position it in Default and Center themes. Otherwise use a width of at least 800px and a height of 400px.

### Auto hiding behavior
The overlay will automatically hide when you are not in a game. This is to prevent the overlay from showing outdated info when you are in the lobby, in the main menu or loading a new game.

When first loading the overlay, it will always show your current/last game to help you set up the overlay for a few seconds, add `&hideAfter=0` to prevent it from disappearing entirely.

To prevent the overlay from displaying at the start, when you switch to a configured scene, make sure un uncheck the 'Refresh browser when scene becomes active' option in your browser source settings.

---

## About
### Bugs & Support
Open an issue in this GitHub repo or connect with us on Stormgate playtest discord.

### Contributing
We are open to contributions and feedback. If you want to contribute, please open an issue or a pull request on this GitHub repo. The stack is fairly straightforward:
- [SolidJS](https://www.solidjs.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

### Credits
Build and maintained by the [Stormgate World team](https://stormgateworld.com).

This overlay is based on the AoE4 World overlay [AoE4 World](https://aoe4world.com).
