import {
  Component,
  ComponentProps,
  createEffect,
  createResource,
  createSignal,
  Show,
  For,
  Match,
  on,
  onCleanup,
  onMount,
  splitProps,
  Switch,
} from "solid-js";
import { useParams, useSearchParams } from "@solidjs/router";
import { Race, CurrentGame, getLastGame, Player as TeamPlayer } from "./query";
import { BADGES } from "../assets";
import { classes } from "../utils";

// seconds
const CONFIG = {
  HIDE_GAME_ON_LOAD: 3,
  HIDE_GAME_AFTER: 20,
  SYNC_EVERY: 15,
};

const Flag: Component<ComponentProps<"img"> & { race: Race }> = (props) => {
  const [local, rest] = splitProps(props, ["race", "class", "color"]);
  return (
    <img
      src={local.race.flag}
      style={{ "filter": "drop-shadow(0 -4px 6px #000) drop-shadow(0 0 6px #000)", "width": "60px"}}
      class={classes(local.class)}
      alt={local.race.name}
      {...rest}
    />
  );
};

const Badge: Component<{ rank: string; class?: string }> = (props) => (
  <img src={BADGES[`./badges/${props.rank}.png`]} class={props.class} />
);

const Player: Component<{
  race: Race;
  player: TeamPlayer;
  class?: string;
  align: "left" | "right";
  size?: "compact";
  mode?: "split" | "center";
}> = (props) => {
  const compact = () => props.size === "compact";
  const center = () => props.mode === "center";
  const top = () => props.mode === "split" || props.mode === "center";
  const rightAligned = () => props.align === "right";
  return (
    <div class={classes("flex items-center gap-3", rightAligned() && "flex-row-reverse")}>
      <Flag
        race={props.race}
        class={classes(center() ? "-mt-2 scale-[1.1] mx-2 mb-2" : "")}
      />
      {props.player?.rank && (
        <Badge rank={props.player.rank} class={classes("rounded-sm scale-[1.2]", compact() ? "h-5" : "h-9")} />
      )}
      <div
        class={classes(
          "flex flex-col gap-1.5 justify-between overflow-hidden",
          rightAligned() && "text-right",
          compact() && "flex items-center gap-4",
          compact() && rightAligned() && "flex-row-reverse"
        )}
      >
        <Show when={!top()}>
          <h1
            class={classes(
              "font-bold text-xl truncate max-w-[350px]",
              props.player.result == "loss" && "text-red-500",
              props.player.result == "win" && "text-green-500"
            )}
          >
            {props.player.name}
          </h1>
        </Show>
        <div
          class={classes(
            "flex gap-2 text-xl leading-tight",
            compact() && "opacity-80",
            rightAligned() && "justify-end"
          )}
        >
          {props.player.mode_stats ? (
            <>
              <Show when={props.player.mode_stats.rank}>
                <span>#{props.player.mode_stats.rank}</span>
              </Show>
              <Show when={props.player.mode_stats.mmr}>
                <span>{props.player.mode_stats.mmr.toFixed()}</span>
              </Show>
              {!compact() && (
                <>
                  <span class="text-green-500">{props.player.mode_stats.wins}W</span>
                  <span class="text-red-500">{props.player.mode_stats.losses}L</span>
                  <span>{props.player.mode_stats.win_rate.toFixed(1)}%</span>
                </>
              )}
            </>
          ) : props.player.rank?.endsWith("unranked") ? (
            <span class="text-lg text-white/50">Unranked</span>
          ) : (
            <span class="text-lg text-white/50">No stats found</span>
          )}
        </div>
        <Show when={top()}>
          <h1
            class={classes(
              "font-bold text-xl truncate max-w-[350px]",
              props.player.result == "loss" && "text-red-500",
              props.player.result == "win" && "text-green-500"
            )}
          >
            {props.player.name}
          </h1>
        </Show>
      </div>
    </div>
  );
};

let sync;
let scheduledHide;
let lastGameWithoutResult;
const Overlay: Component = () => {
  const params = useParams();
  const [options] = useSearchParams();
  const profileId = params.profileId?.split("-")[0];
  const theme: "top" | "floating" | "center" | "left" | "right" = (options.theme as any) ?? "floating";
  const scale: number = parseInt(options.scale ?? '100') / 100;
  const hideAfter: number = parseInt(options.hideAfter ?? CONFIG.HIDE_GAME_AFTER.toString());
  // 70 till 120%
  const [currentGame, { refetch }] = createResource(
    (_, { value, refetching }: { value: CurrentGame; refetching: boolean }) =>
      getLastGame(
        profileId,
        { },
        { value, refetching }
      )
  );
  const [visible, setVisible] = createSignal(!!profileId);
  const game = () => (currentGame.loading ? currentGame.latest : currentGame.error ? null : currentGame());
  const teamGame = () => game()?.team.length > 1 || game()?.opponents.length > 1;

  const toggle = (show: boolean) => {
    setVisible(show);
    window.clearTimeout(scheduledHide);
  };

  onMount(() => {
    sync = setInterval(() => refetch(), 1000 * CONFIG.SYNC_EVERY);
  });

  onCleanup(() => {
    clearInterval(sync);
    clearTimeout(scheduledHide);
  });

  createEffect(
    on(game, () => {
      if (game() && game().result === null)
        lastGameWithoutResult = game().id;
      if (visible() && game()?.result && hideAfter != 0)
        scheduledHide = window.setTimeout(() => toggle(false), 1000 * (lastGameWithoutResult == game().id ? hideAfter : CONFIG.HIDE_GAME_ON_LOAD));
      else if (!visible() && game()?.state != 'finished') toggle(true);
    })
  );

  return (
    <div
      class={classes(
        'flex flex-col',
        (theme === 'left' || theme === 'right') ? 'w-full' : null,
        theme === 'left' ? 'items-start origin-top-left' : theme === 'right' ? 'items-end origin-top-right' : 'items-center origin-top'
      )}
      style={`transform: scale(${scale})`}
    >
      <Switch>
        <Match when={!profileId}>
          <div class="bg-red-900 p-6 text-sm m-4 rounded-md max-w-[800px]">
            <div class="font-bold text-white text-md mb-4">No profile selected</div>
            <span class="text-white">
              Generate a proper url via {window.location.protocol}//{window.location.host}.
            </span>
          </div>
        </Match>
        <Match when={currentGame.error}>
          <div class="bg-red-900 p-6 text-sm m-4 rounded-md max-w-[800px]">
            <div class="font-bold text-white text-md">Error while loading last match</div>
            <span class="text-white">{currentGame.error?.message}</span>
          </div>
        </Match>
        <Match when={game() && theme === 'center'}>
          <div
            class={classes(
              "component-bar",
              "bg-gradient-to-r rounded-md mt-0 w-[800px] text-white inline-flex items-center relative p-1.5 px-2.5",
              "duration-700 fade-in fade-out",
              visible() ? "animate-in" : "animate-out"
            )}
            onanimationend={(e) => {
              e.target.classList.contains("animate-out") && e.target.classList.add("hidden");
            }}
            style={themes[theme]}
          >
            <div class="basis-1/2 flex flex-col gap-2 min-w-0">
              <For each={game()?.team}>
                {(player) => (
                  <Player
                    player={player}
                    race={player.race} 
                    align="right" 
                    mode="center"
                  />
                )}
              </For>
            </div>
            <div class="relative">
              <p class="text-center text-sm uppercase text-white/80">vs</p>
            </div>
            <div class="basis-1/2 flex flex-col gap-2 min-w-0">
              <For each={game()?.opponents}>
                {(player) => (
                  <Player
                    player={player}
                    race={player.race}
                    align="left"
                    mode="center"
                  />
                )}
              </For>
            </div>
          </div>
        </Match>
        <Match when={game() && theme === 'top'}>
          <div 
            class={classes(
              "flex",
              "duration-700 fade-in fade-out",
              "slide-in-from-top slide-out-to-top-20",
              visible() ? "animate-in" : "animate-out"
            )}
            onanimationend={(e) => {
              e.target.classList.contains("animate-out") && e.target.classList.add("hidden");
            }}
          >
            <div
              class={classes(
                "basis-1/2 w-[450px] mr-[390px] overflow-hidden",
                "flex flex-col gap-2 items-end",
              )}
            >
              <div
                class={classes(
                  "component-bar",
                  "min-w-0",
                  "from-black/90 via-black/70 to-black/90 bg-gradient-to-r rounded-md mt-0 text-white inline-flex relative p-2.5 px-3.5"
                )}
                style={themes[theme+'-left']}
              >
                <For each={game()?.team}>
                  {(player) => (
                    <Player
                      player={player}
                      race={player.race} 
                      align="right"
                      mode="split"
                    />
                  )}
                </For>
              </div>
            </div>
            <div
              class={classes(
                "basis-1/2 w-[450px] ml-[390px] overflow-hidden",
                "flex flex-col gap-2 items-start",
              )}
            >
              <div
                class={classes(
                  "component-bar",
                  "min-w-0",
                  "from-black/90 via-black/70 to-black/90 bg-gradient-to-r rounded-md mt-0 text-white inline-flex relative p-2.5 px-3.5"
                )}
                style={themes[theme+'-right']}
              >
                <For each={game()?.opponents}>
                  {(player) => (
                    <Player
                      player={player}
                      race={player.race}
                      align="left"
                      mode="split"
                    />
                  )}
                </For>
              </div>
            </div>
          </div>
        </Match>
        <Match when={game() && (theme === 'left' || theme === 'right')}>
          <div 
            class={classes(
              "duration-700 fade-in fade-out",
              theme === 'left' ? "slide-in-from-left slide-out-to-left-20" : "slide-in-from-right slide-out-to-right-20",
              visible() ? "animate-in" : "animate-out"
            )}
            onanimationend={(e) => {
              e.target.classList.contains("animate-out") && e.target.classList.add("hidden");
            }}
          >
            <div
              class={classes(
                "component-bar",
                "flex flex-col gap-2",
                "px-3 max-w-[450px]",
                theme === 'left' ? "from-black/80 via-black/80 to-black/60 rounded-r-md" : "from-black/60 via-black/80 to-black/80 rounded-l-md",
                "bg-gradient-to-r mt-0 text-white inline-flex relative p-1.5"
              )}
            >
              <div class="flex flex-col gap-4 min-w-0">
                <For each={game()?.team}>
                  {(player) => (
                    <Player
                      player={player}
                      race={player.race} 
                      align={theme === 'left' ? "left" : "right"}
                    />
                  )}
                </For>
                <For each={game()?.opponents}>
                  {(player) => (
                    <Player
                      player={player}
                      race={player.race}
                      align={theme === 'left' ? "left" : "right"}
                    />
                  )}
                </For>
              </div>
            </div>
          </div>
        </Match>
        <Match when={game()}>
          <div
            class={classes(
              "component-bar",
              "from-black/90 via-black/70 to-black/90 bg-gradient-to-r rounded-md mt-0 min-w-[800px] text-white inline-flex items-center relative p-1.5",
              "duration-700 fade-in fade-out",
              visible() ? "animate-in" : "animate-out"
            )}
            onanimationend={(e) => {
              e.target.classList.contains("animate-out") && e.target.classList.add("hidden");
            }}
            style={themes[theme]}
          >
            <div class="basis-1/2 flex flex-col gap-2 min-w-0">
              <For each={game()?.team}>
                {(player) => (
                  <Player player={player} race={player.race} align="left" size={teamGame() ? "compact" : null} />
                )}
              </For>
            </div>
            <Show when={game()?.kind !== 'ranked 1v1'}>
              <div class="text-center flex flex-grow flex-col self-start	gap-1 px-4 whitespace-nowrap">
                <p class="text-sm uppercase text-white/80">{game()?.kind}</p>
              </div>
            </Show>
            <div class="basis-1/2 flex flex-col gap-2 min-w-0">
              <For each={game()?.opponents}>
                {(player) => (
                  <Player
                    player={player}
                    race={player.race}
                    align="right"
                    size={teamGame() ? "compact" : null}
                  />
                )}
              </For>
            </div>
          </div>
        </Match>
      </Switch>
    </div>
  );
};

const themes = {
  floating: `
    margin: 10px;
  `,
  center: `
    min-width: 822px;
    margin-top: 85px;
    background-image: radial-gradient(circle at 50% -70%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.0) 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.7) 90%);
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-left-radius: 20px 60px;
    border-bottom-right-radius: 20px 60px;
  `,
  'top-left': `
    background-image: radial-gradient(circle at 100% -70%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.7) 90%);
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-left-radius: 20px 60px;
    border-bottom-right-radius: 20px 35px;
  `,
  'top-right': `
    background-image: radial-gradient(circle at 0% -70%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.7) 90%);
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-left-radius: 20px 35px;
    border-bottom-right-radius: 20px 60px;
  `,
};

export default Overlay;
