import {
  Component,
  ComponentProps,
  createEffect,
  createResource,
  createSignal,
  JSX,
  Match,
  ParentComponent,
  splitProps,
  Switch,
} from "solid-js";
import bannerBackgroundImage from "../assets/images/banner-background.svg";
import bannerTopImage from "../assets/images/banner-top.svg";
import bannerCenterImage from "../assets/images/banner-center.svg";
import bannerLeftImage from "../assets/images/banner-left.svg";
import bannerRightImage from "../assets/images/banner-right.svg";
import bannerFloatingImage from "../assets/images/banner-floating.svg";
import { classes } from "../utils";
import { Search } from "./Search";
import { IPublicPlayersAutocompletePlayerAPI } from "./types";
import { Icons } from "../assets/icons";

const Row: ParentComponent<{ step: number; label: string; description: string }> = (props) => (
  <div class="flex items-start gap-4">
    <div class="bg-green-700/20 text-green-500 w-6 h-6 rounded-full grid place-items-center">{props.step}</div>

    <div class="flex-auto">
      <h2 class="text-gray-100 mb-1 text-lg">{props.label}</h2>
      <p class="text-gray-300 leading-relaxed">{props.description}</p>
      {props.children}
    </div>
  </div>
);

const StyleOption: ParentComponent<
  { label: string; description: string; active: boolean } & ComponentProps<"button">
> = (props) => {
  const [local, rest] = splitProps(props, ["label", "description", "children", "active"]);
  return (
    <button class="mt-2 mr-4 inline-flex flex-col items-center group " {...rest}>
      <strong class={classes(local.active ? "text-white" : "text-gray-100/80")}>{local.label}</strong>
      <div
        class={classes(
          "relative my-2 outline-white:outline rounded-md flex flex-col items-center overflow-hidden transition duration-300 group-hover:saturate-100",
          local.active ? "outline saturate-100" : "saturate-0"
        )}
      >
        <img src={bannerBackgroundImage} />
        {local.children}
      </div>
      <small class="text-sm text-gray-200">{local.description}</small>
    </button>
  );
};

export const Generator = () => {
  const [pickedPlayer, setPickedPlayer] = createSignal<IPublicPlayersAutocompletePlayerAPI>(undefined);
  const [isCopied, setIsCopied] = createSignal(false);
  const [params, setParams] = createSignal<{
    player_id: string;
    theme: "top" | "center" | "floating" | "left" | "right";
    scale: number;
  }>({
    player_id: undefined,
    theme: "top",
    scale: 100,
  });
  let urlField;
  let timeout;

  createEffect(() => {
    setParams((x) => ({
      ...x,
      player_id: pickedPlayer()?.player_id,
    }));
  });

  const url = () => {
    const urlParams = new URLSearchParams({
      theme: params()?.theme,
    });

    if (params()?.scale != 100) {
      urlParams.append('scale', params()?.scale.toString());
    }


    if (params().player_id)
      return `${window.location.protocol}//${window.location.host}/profile/${params().player_id}/bar?${urlParams.toString()}`;
    else return null;
  };
  function copy() {
    copyInputText(urlField);
    setIsCopied(true);
    clearTimeout(timeout);
    timeout = window.setTimeout(() => setIsCopied(false), 1200);
  }
  return (
    <div class="bg-gray-800 min-h-screen m-0 p-6 text-white">
      <div class="flex flex-col gap-6 max-w-3xl mx-auto">
        <div class="p-6">
          <h1 class="font-bold text-2xl my-8">
            <span class="border-4 border-white rounded-lg px-2 py-1">Stormgate World</span> Overlay
          </h1>
          <h2 class="font-bold text-xl max-w-lg text-gray-100 my-4">
            A tool for streamers to display information about ongoing games in their broadcasts.
          </h2>
          <p class="text-lg text-gray-50 leading-snug max-w-xl">
            Show your rank, rating and that of your opponent to your viewers using the tool build specifically for
            streamers. Use the below generator to create a url that you can add as a browser source in your streaming
            software.
          </p>
          <a
            href="https://github.com/stormgateworld/overlay"
            class="text-gray-300 my-6 hover:underline hover:text-white inline-block"
          >
            GitHub / Support
          </a>
        </div>
        <div class="rounded-xl bg-gray-600 p-6 flex flex-col gap-6">
          <Row step={1} label="Select your user profile" description="Search for your in-game name">
            <Switch fallback={<Search class="my-4" onSelect={setPickedPlayer} />}>
              <Match when={pickedPlayer()}>
                <div class="my-6 font-bold text-xl flex items-center">
                  {pickedPlayer()?.nickname}
                  <button
                    onClick={() => setPickedPlayer(undefined)}
                    class="ml-2 text-sm text-gray-300 hover:text-gray-100"
                  >
                    <Icons.X />
                  </button>
                </div>
              </Match>
            </Switch>
          </Row>

          <Row step={2} label="Choose your style" description="Pick the theme and alignment for your overlay">
            <StyleOption
              label="Top"
              description="On left and right of the Top Bar"
              active={params().theme === "top"}
              onClick={() => setParams((x) => ({ ...x, theme: "top" }))}
            >
              <img src={bannerTopImage} class="absolute top-0" />
            </StyleOption>
            <StyleOption
              label="Center"
              description="Below the Top Bar"
              active={params().theme === "center"}
              onClick={() => setParams((x) => ({ ...x, theme: "center" }))}
            >
              <img src={bannerCenterImage} class="absolute top-3" />
            </StyleOption>
            <StyleOption
              label="Left"
              description="List on left side of screen"
              active={params().theme === "left"}
              onClick={() => setParams((x) => ({ ...x, theme: "left" }))}
            >
              <img src={bannerLeftImage} class="absolute left-0 top-5" />
            </StyleOption>
            <StyleOption
              label="Right"
              description="List on right side of screen"
              active={params().theme === "right"}
              onClick={() => setParams((x) => ({ ...x, theme: "right" }))}
            >
              <img src={bannerRightImage} class="absolute right-0 top-5" />
            </StyleOption>
            <StyleOption
              label="Floating"
              description="Position anywhere on your screen"
              active={params().theme === "floating"}
              onClick={() => setParams((x) => ({ ...x, theme: "floating" }))}
            >
              <img src={bannerFloatingImage} class="absolute top-5 right-1.5" />
            </StyleOption>
          </Row>
          <Row
            step={3}
            label="Match scaling to ingame settings"
            description="Set to your Settings->Gameplay->Console Scale ingame setting (70-120%)."
          >
            <label class="block py-2">
              <input
                type="number"
                min="70"
                max="120"
                value={params()?.scale}
                onChange={(e) => setParams((x) => ({ ...x, scale: parseInt(e.currentTarget.value) }))}
                class="bg-black p-1 border border-gray-400/80 rounded-sm"
              />
              <span class="ml-2 text-gray-100">Ingame Console Scale setting (defaults to 100%)</span>
            </label>
          </Row>
          <Row
            step={4}
            label="Add as Browser Source"
            description="In your streaming software, add a new Browser Source and paste the URL below."
          >
            {url() ? (
              <div class="bg-gray-400 rounded-lg  w-full flex gap-2 relative my-4" onClick={(e) => urlField.select()}>
                <input
                  value={url()}
                  class=" outline-none bg-transparent p-2 flex-auto selection:bg-green-800/40 selection:text-green-500"
                  readonly
                  ref={urlField}
                />
                <div
                  style={{ display: isCopied() ? "block" : "none" }}
                  class="absolute inset-1 rounded-lg bg-gray-400 p-2"
                >
                  Url copied to clipboard!
                </div>
                <button
                  class={classes("z-10  p-1 rounded w-8 m-2", !isCopied() && "hover:bg-gray-500")}
                  onClick={() => copy()}
                >
                  {isCopied() ? (
                    <Icons.CircleCheck class="text-green-500" />
                  ) : (
                    <Icons.Clipboard class="text-gray-200" />
                  )}
                </button>
              </div>
            ) : (
              <div class="text-gray-400 my-4">First select a player</div>
            )}
            <div class="text-gray-300">
              Learn more about adding a browser source in{" "}
              <a
                href="https://obsproject.com/wiki/Sources-Guide#browser-source"
                target="_blank"
                class="text-gray-200 hover:text-white"
              >
                OBS Project
              </a>{" "}
              and{" "}
              <a
                href="https://blog.streamlabs.com/introducing-browser-source-interaction-for-streamlabs-obs-d8fc4dcbb1fb"
                target="_blank"
                class="text-gray-200 hover:text-white"
              >
                Streamlabs OBS
              </a>
              .
            </div>
            <div class="text-gray-300 mt-4">
              {" "}
              For Top/Center theme, you should set it to 1920px / 1080px resolution. This should allow it to line up properly with the Top Bar. (don't forget to set<br/>
              Otherwise use a width of at least 800px and a height of 400px.<br/>
              For Left/Right theme, adjust the vertical position to your liking.
            </div>
          </Row>
        </div>
      </div>
    </div>
  );
};

function copyInputText(el: HTMLInputElement) {
  navigator.clipboard.writeText(el.value).catch(() => {
    el.select();
    document.execCommand("copy");
  });
}

export default Generator;
