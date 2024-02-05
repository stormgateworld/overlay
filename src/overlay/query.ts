import { FLAGS } from "../assets";

export type Race = {
  name: string;
  flag: string;
  color: string;
};

const RACES: Record<string, Race> = {
  vanguard: {
    name: "Vanguard",
    color: "rgba(40, 40, 255, 1.0)",
    flag: FLAGS.vanguard,
  },

  infernals: {
    name: "Infernals",
    color: "rgba(255, 40, 40, 1.0)",
    flag: FLAGS.infernals,
  },
};

const UNKNOWN_RACE = {
  name: "Unknown Civilization",
  color: "#000000",
  flag: undefined,
};

type Modes = "ranked_1v1";

const mapPlayer = (leaderboard: string) =>
  (player_game: ApiPlayerGame): Player => {
    const player: ApiPlayer = player_game.player ?? {} as ApiPlayer;
    const mode = player_game.player_leaderboard_entry;
    const rank_level = mode?.league ? `${mode.league}_${mode.tier}` : "unranked";
    return {
      name: player.nickname ?? "Unknown",
      race: RACES[player_game.race] ?? UNKNOWN_RACE,
      mode_stats: mode?.matches ? mode : null,
      rank: rank_level,
      result: player_game.result,
    };
  };

export type Player = {
  name: string;
  race: Race;
  rank?: string;
  result?: "win" | "loss" | "undecided";
  mode_stats: ApiPlayerLeaderboardEntry;
};

export type CurrentGame = {
  id: string;
  duration: number;
  team: Player[];
  opponents: Player[];
  kind: string;
  state: "ongoing" | "finished";
  result?: "win" | "loss" | "undecided";
};

export async function getLastGame(
  player_id: string,
  params: { },
  { value, refetching }: { value: CurrentGame; refetching: boolean }
): Promise<CurrentGame> {
  try {
    const response: ApiGame = await fetch(`https://api.stormgateworld.com/v0/players/${player_id}/matches/last`).then((r) => r.json());

    if ((response as any).error) throw new Error((response as any).error);

    if (refetching && value && value.id == response.match_id && value.duration == response.duration) return value;

    const { players, duration, leaderboard } = response;

    // Workaround: get player leaderboard stats separately
    const player_details = (await Promise.all(players.filter(p => p.player?.player_id).map(p => fetch(`https://api.stormgateworld.com/v0/players/${p.player.player_id}`).then((r) => r.json())))).reduce((p, c) => { p[c.id] = c; return p; }, {});
    
    players.forEach(player_game => {
      const player_detail = player_details[player_game.player?.player_id];
      player_game.player_leaderboard_entry = player_detail?.leaderboard_entries.find(l => l.leaderboard == leaderboard && l.race == player_game.race);
    });

    const player = players.find(p => p.player?.player_id == player_id);
    const team = players.filter(p => p.team == player.team);
    const opponents = players.filter(p => p.team !== player.team);
    return {
      id: response.match_id,
      team: team.map(mapPlayer(leaderboard)),
      opponents: opponents.map(mapPlayer(leaderboard)),
      kind: response.leaderboard.replace(/_/g, " "),
      state: response.state,
      duration,
      result: player?.result,
    };
  } catch (e) {
    if (refetching && value) return value;
    else throw e;
  }
}

interface ApiGame {
  match_id: string;
  state: "ongoing" | "finished";
  leaderboard: string;
  server: string;
  players: ApiPlayerGame[];
  created_at: string;
  ended_at?: string;
  duration?: number;
}

interface ApiPlayerGame {
  player: ApiPlayer;
  player_leaderboard_entry?: ApiPlayerLeaderboardEntry;
  race: string;
  team: number;
  party: number;
  rating?: number;
  rating_updated?: number;
  rating_diff?: number;
  result?: "win" | "loss" | "undecided";
  ping?: number;
  scores: ApiPlayerScore;
}

interface ApiPlayer {
  player_id: string;
  nickname?: string;
  nickname_discriminator: string;
}

interface ApiPlayerLeaderboardEntry {
  race: string;
  league: string;
  tier: number;
  rank: number;
  mmr?: number;
  max_confirmed_mmr?: number;
  points?: number;
  wins?: number;
  losses?: number;
  ties?: number;
  matches?: number;
  win_rate?: number;
}

interface ApiPlayerScore {
  xp: number;
  units_killed: number;
  resources_mined: number;
  structures_killed: number;
  creep_resources_collected: number;
}

