export type Chapter = { name: string; path: string; ext: string; href: string; lines: string[] };

export const chapters: Chapter[] = [
  {
    name: "chess-engine", path: "~/chess-engine", ext: "py",
    href: "https://github.com/Granted07/Chess-Engine-Python",
    lines: ["from scratch. no library to blame.", "press t. the board changes its mind.", "castling works. en passant, ask me how.", "the opponent is still on its way."],
  },
  {
    name: "p2pchat", path: "~/p2pchat", ext: "cpp",
    href: "https://github.com/Granted07/p2pchat",
    lines: ["two machines. nobody in the middle.", "the router had to be talked into it.", "upnp: a door that opens if you ask right."],
  },
  {
    name: "jimnios", path: "~/jimnios", ext: "arch",
    href: "https://github.com/JimniOS",
    lines: ["a linux for students. arch underneath.", "named after a fruit. dressed in its colour.", "i was the designer."],
  },
  {
    name: "genuprising", path: "~/genuprising", ext: "ts",
    href: "https://genuprising.com",
    lines: ["an advocacy hub. articles landing back to back.", "it could not afford to be slow.", "under 200ms. the edge did the lifting."],
  },
  {
    name: "repak-rebnk", path: "~/repak-rebnk", ext: "rs",
    href: "https://github.com/Granted07/repak-rebnk",
    lines: ["someone else's rust. i went in anyway.", "unreal engine pak files, cracked open.", "forked on purpose."],
  },
];

export const others = [
  { name: "anime-scraper", note: "scrapes shows off gogoanime", href: "https://github.com/Granted07/anime-scraper" },
  { name: "animdl", note: "a fork. downloads, streams", href: "https://github.com/Granted07/animdl" },
  { name: "dots", note: "where this terminal came from", href: "https://github.com/Granted07/dots" },
];
