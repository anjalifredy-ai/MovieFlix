import { useState, useEffect, useRef } from "react";

const KEY = "2dca580c2a14b55200e784d157207b4d";
const API = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";
const BG = "https://image.tmdb.org/t/p/original";

const TABS = [
  { id: "popular", label: "🔥 Popular" },
  { id: "bollywood", label: "🇮🇳 Bollywood" },
  { id: "hollywood", label: "🎬 Hollywood" },
  { id: "hindi_dubbed", label: "🎙️ Hindi Dubbed" },
  { id: "anime", label: "⛩️ Anime" },
  { id: "korean", label: "🇰🇷 Korean" },
  { id: "tamil", label: "🎭 Tamil" },
  { id: "telugu", label: "🎬 Telugu" },
  { id: "tv", label: "📺 TV" },
  { id: "wl", label: "❤️" },
];

const GENRES = [
  { id: "", name: "All" }, { id: 28, name: "Action" }, { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" }, { id: 27, name: "Horror" }, { id: 878, name: "Sci-Fi" },
  { id: 10749, name: "Romance" }, { id: 16, name: "Animation" }, { id: 53, name: "Thriller" },
];

function getEmbedUrl(item, kind, season, episode) {
  const id = item.id;
  if (kind === "tv" || kind === "anime_tv") {
    const s = season || 1;
    const e = episode || 1;
    return "https://www.2embed.cc/embedtv/" + id + "&s=" + s + "&e=" + e;
  }
  return "https://www.2embed.cc/embed/" + id;
}

function Stars({ n }) {
  const s = Math.round((n || 0) / 2);
  return (
    <span style={{ color: "#f5c518", fontSize: 11 }}>
      {"★".repeat(Math.max(0, s))}{"☆".repeat(Math.max(0, 5 - s))}
      <span style={{ color: "#888", marginLeft: 3 }}>{(n || 0).toFixed(1)}</span>
    </span>
  );
}

function Player({ item, kind, season, episode, onClose }) {
  const url = getEmbedUrl(item, kind, season, episode);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 9999, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: "#111", flexShrink: 0 }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
          {item.title || item.name}{season ? " S" + season + "E" + episode : ""}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); }}
            style={{ background: "#333", border: "none", color: "#fff", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>⛶ Full</button>
          <button onClick={onClose} style={{ background: "#e50914", border: "none", color: "#fff", padding: "5px 14px", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>✕ Close</button>
        </div>
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <iframe src={url} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          allowFullScreen allow="autoplay; fullscreen; picture-in-picture" title={item.title || item.name} />
      </div>
    </div>
  );
}

function EpisodeList({ itemId, kind, selSeason, setSelSeason, seasons, onPlay, item, onClose }) {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch(API + "/tv/" + itemId + "/season/" + selSeason + "?api_key=" + KEY)
      .then(r => r.json())
      .then(d => { setEpisodes(d.episodes || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [itemId, selSeason]);
  return (
    <div style={{ padding: "0 14px 16px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 7 }}>Seasons</div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
        {seasons.map(s => (
          <button key={s.season_number} onClick={() => setSelSeason(s.season_number)}
            style={{ padding: "4px 11px", borderRadius: 14, border: selSeason === s.season_number ? "1px solid #e50914" : "1px solid #333", background: selSeason === s.season_number ? "rgba(229,9,20,0.18)" : "transparent", color: selSeason === s.season_number ? "#e50914" : "#777", fontSize: 11, cursor: "pointer" }}>
            S{s.season_number}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 7 }}>Episodes — Season {selSeason}</div>
      {loading ? <div style={{ color: "#555", fontSize: 12, padding: "8px 0" }}>Loading...</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {episodes.map(ep => (
            <div key={ep.id} onClick={() => { onClose(); onPlay(item, kind, selSeason, ep.episode_number); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", background: "#151520", borderRadius: 9, cursor: "pointer", border: "1px solid #222" }}
              onMouseEnter={e => e.currentTarget.style.background = "#1e1e30"}
              onMouseLeave={e => e.currentTarget.style.background = "#151520"}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#e50914", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{ep.episode_number}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ep.name || "Episode " + ep.episode_number}</div>
                <div style={{ fontSize: 10, color: "#555" }}>{ep.air_date || ""}</div>
              </div>
              <div style={{ color: "#e50914", fontSize: 14 }}>▶</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoModal({ item, kind, onClose, onPlay, onToggle, saved }) {
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [seasons, setSeasons] = useState([]);
  const [selSeason, setSelSeason] = useState(1);
  const title = item.title || item.name || "";
  const isTv = kind === "tv" || kind === "anime_tv";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const ep = isTv ? "tv" : "movie";
    fetch(API + "/" + ep + "/" + item.id + "/videos?api_key=" + KEY)
      .then(r => r.json())
      .then(d => { const v = (d.results || []).find(x => x.site === "YouTube" && x.type === "Trailer"); if (v) setTrailerKey(v.key); })
      .catch(() => {});
    if (isTv) {
      fetch(API + "/tv/" + item.id + "?api_key=" + KEY)
        .then(r => r.json())
        .then(d => { setSeasons((d.seasons || []).filter(x => x.season_number > 0)); })
        .catch(() => {});
    }
    return () => { document.body.style.overflow = ""; };
  }, [item.id, kind]);

  return (
    <>
      {showTrailer && trailerKey && (
        <div onClick={() => setShowTrailer(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 780 }}>
            <button onClick={() => setShowTrailer(false)} style={{ display: "block", marginBottom: 8, marginLeft: "auto", background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer" }}>✕ Close</button>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
              <iframe src={"https://www.youtube.com/embed/" + trailerKey + "?autoplay=1"} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", borderRadius: 10 }} allowFullScreen allow="autoplay" />
            </div>
          </div>
        </div>
      )}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 14 }}>
        <div onClick={e => e.stopPropagation()} style={{ background: "#0d0d18", borderRadius: 18, overflow: "hidden", maxWidth: 680, width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative", border: "1px solid #222" }}>
          {item.backdrop_path && (
            <div style={{ position: "relative", height: 165 }}>
              <img src={BG + item.backdrop_path} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), #0d0d18)" }} />
            </div>
          )}
          <button onClick={onClose} style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.65)", border: "none", color: "#fff", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", fontSize: 17, zIndex: 10 }}>×</button>
          <div style={{ padding: "14px 14px 10px", display: "flex", gap: 12, flexWrap: "wrap" }}>
            <img src={item.poster_path ? IMG + item.poster_path : "https://placehold.co/90x135/111/555?text=N/A"} alt={title} style={{ width: 90, height: 135, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 150 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 5 }}>{title}</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 7, flexWrap: "wrap", alignItems: "center" }}>
                <Stars n={item.vote_average} />
                <span style={{ fontSize: 10, color: "#aaa", background: "#1a1a2e", padding: "2px 7px", borderRadius: 12 }}>{(item.release_date || item.first_air_date || "").slice(0, 4)}</span>
                <span style={{ fontSize: 10, color: "#e50914", background: "rgba(229,9,20,0.12)", padding: "2px 7px", borderRadius: 12 }}>HD</span>
              </div>
              <p style={{ fontSize: 11, color: "#bbb", lineHeight: 1.6, marginBottom: 10 }}>{item.overview || "No description."}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {!isTv && (
                  <button onClick={() => { onClose(); onPlay(item, kind, null, null); }} style={{ padding: "8px 16px", background: "#e50914", border: "none", color: "#fff", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>▶ Watch Now</button>
                )}
                {trailerKey && (
                  <button onClick={() => setShowTrailer(true)} style={{ padding: "8px 12px", background: "rgba(255,255,255,0.08)", border: "1px solid #444", color: "#fff", borderRadius: 7, fontSize: 12, cursor: "pointer" }}>🎬 Trailer</button>
                )}
                <button onClick={() => onToggle(item, kind)} style={{ padding: "8px 12px", background: saved ? "rgba(229,9,20,0.18)" : "rgba(255,255,255,0.06)", border: "1px solid " + (saved ? "#e50914" : "#333"), color: saved ? "#e50914" : "#ccc", borderRadius: 7, fontSize: 12, cursor: "pointer" }}>
                  {saved ? "♥ Saved" : "♡ Save"}
                </button>
              </div>
            </div>
          </div>
          {isTv && seasons.length > 0 && (
            <EpisodeList itemId={item.id} kind={kind} selSeason={selSeason} setSelSeason={setSelSeason} seasons={seasons} onPlay={onPlay} item={item} onClose={onClose} />
          )}
        </div>
      </div>
    </>
  );
}

function Card({ item, onInfo, onToggle, saved, kind }) {
  const title = item.title || item.name || "";
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  return (
    <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", background: "#111", cursor: "pointer" }}>
      <div onClick={() => onInfo(item, kind)}>
        <img src={item.poster_path ? IMG + item.poster_path : "https://placehold.co/300x450/111/555?text=" + encodeURIComponent(title.slice(0, 8))} alt={title} style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.88) 25%, transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Stars n={item.vote_average} />
            <span style={{ fontSize: 10, color: "#aaa" }}>{year}</span>
          </div>
        </div>
      </div>
      <button onClick={e => { e.stopPropagation(); onToggle(item, kind); }} style={{ position: "absolute", top: 6, right: 6, background: saved ? "#e50914" : "rgba(0,0,0,0.6)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 13 }}>
        {saved ? "♥" : "♡"}
      </button>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("popular");
  const [items, setItems] = useState([]);
  const [hero, setHero] = useState(null);
  const [info, setInfo] = useState(null);
  const [infoKind, setInfoKind] = useState("movie");
  const [player, setPlayer] = useState(null);
  const [playerKind, setPlayerKind] = useState("movie");
  const [playerSeason, setPlayerSeason] = useState(null);
  const [playerEp, setPlayerEp] = useState(null);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sec, setSec] = useState("popular");
  const [wl, setWl] = useState(() => { try { return JSON.parse(localStorage.getItem("mf_wl") || "[]"); } catch { return []; } });
  const timer = useRef(null);

  const saveWl = list => { setWl(list); try { localStorage.setItem("mf_wl", JSON.stringify(list)); } catch {} };
  const toggle = (item, kind) => {
    if (wl.find(x => x.id === item.id)) saveWl(wl.filter(x => x.id !== item.id));
    else saveWl([...wl, { ...item, _k: kind }]);
  };
  const inWl = id => wl.some(x => x.id === id);

  const buildUrl = (query, g, p, s, t) => {
    if (query) {
      const st = t === "tv" || t === "anime" ? "tv" : "movie";
      return API + "/search/" + st + "?api_key=" + KEY + "&query=" + encodeURIComponent(query) + "&page=" + p;
    }
    if (t === "popular") return API + "/trending/all/week?api_key=" + KEY + "&page=" + p;
    if (t === "bollywood") return API + "/discover/movie?api_key=" + KEY + "&with_original_language=hi&sort_by=popularity.desc&page=" + p + (g ? "&with_genres=" + g : "");
    if (t === "hollywood") {
      const e = s === "top" ? "top_rated" : s === "upcoming" ? "upcoming" : s === "now" ? "now_playing" : "popular";
      return API + "/movie/" + e + "?api_key=" + KEY + "&with_original_language=en&page=" + p + (g ? "&with_genres=" + g : "");
    }
    if (t === "hindi_dubbed") return API + "/discover/movie?api_key=" + KEY + "&with_original_language=hi&sort_by=vote_count.desc&page=" + p;
    if (t === "anime") return API + "/discover/tv?api_key=" + KEY + "&with_genres=16&with_origin_country=JP&sort_by=popularity.desc&page=" + p;
    if (t === "korean") return API + "/discover/movie?api_key=" + KEY + "&with_original_language=ko&sort_by=popularity.desc&page=" + p;
    if (t === "tamil") return API + "/discover/movie?api_key=" + KEY + "&with_original_language=ta&sort_by=popularity.desc&page=" + p;
    if (t === "telugu") return API + "/discover/movie?api_key=" + KEY + "&with_original_language=te&sort_by=popularity.desc&page=" + p;
    if (t === "tv") {
      const e = s === "top" ? "top_rated" : s === "on_air" ? "on_the_air" : "popular";
      return API + "/tv/" + e + "?api_key=" + KEY + "&page=" + p + (g ? "&with_genres=" + g : "");
    }
    return API + "/movie/popular?api_key=" + KEY + "&page=" + p;
  };

  const load = async (query, g, p, s, t) => {
    setLoading(true);
    try {
      const res = await fetch(buildUrl(query, g, p, s, t));
      const data = await res.json();
      const r = data.results || [];
      setItems(r);
      setPages(Math.min(data.total_pages || 1, 20));
      if (p === 1 && r.length > 0) setHero(r[0]);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { if (tab !== "wl") load(q, genre, page, sec, tab); }, [q, genre, page, sec, tab]);

  const doSearch = v => { setSearch(v); clearTimeout(timer.current); timer.current = setTimeout(() => { setQ(v); setPage(1); }, 500); };
  const switchTab = t => { setTab(t); setPage(1); setQ(""); setSearch(""); setGenre(""); setSec("popular"); };
  const showInfo = (item, k) => { setInfo(item); setInfoKind(k); };
  const play = (item, k, s, e) => { setPlayer(item); setPlayerKind(k); setPlayerSeason(s); setPlayerEp(e); };

  const list = tab === "wl" ? wl : items;
  const kind = tab === "tv" ? "tv" : tab === "anime" ? "anime_tv" : "movie";
  const showGenres = ["bollywood", "hollywood", "tv"].includes(tab);
  const showSections = tab === "hollywood" || tab === "tv";

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#e50914;border-radius:3px;}input::placeholder{color:#555;}@keyframes spin{to{transform:rotate(360deg);}}`}</style>

      {player && <Player item={player} kind={playerKind} season={playerSeason} episode={playerEp} onClose={() => setPlayer(null)} />}

      {hero && !q && tab !== "wl" && (
        <div style={{ position: "relative", height: 370, overflow: "hidden" }}>
          <img src={hero.backdrop_path ? BG + hero.backdrop_path : ""} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,rgba(8,8,16,.95) 30%,rgba(8,8,16,.1) 70%),linear-gradient(to top,#080810,transparent 50%)" }} />
          <div style={{ position: "absolute", bottom: 40, left: 0, padding: "0 16px", maxWidth: 440 }}>
            <div style={{ fontSize: 9, color: "#e50914", letterSpacing: 3, fontWeight: 700, marginBottom: 6 }}>🔥 FEATURED</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 6 }}>{hero.title || hero.name}</div>
            <Stars n={hero.vote_average} />
            <p style={{ fontSize: 11, color: "#bbb", lineHeight: 1.6, margin: "6px 0 10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{hero.overview}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => showInfo(hero, kind)} style={{ padding: "8px 18px", background: "#e50914", border: "none", color: "#fff", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>▶ Play</button>
              <button onClick={() => showInfo(hero, kind)} style={{ padding: "8px 14px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 7, fontSize: 12, cursor: "pointer" }}>ℹ Info</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(8,8,16,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid #181820", padding: "8px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#e50914", letterSpacing: 2, flexShrink: 0 }}>MOVIEFLIX</div>
          {tab !== "wl" && (
            <div style={{ flex: 1, position: "relative" }}>
              <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#444", fontSize: 12 }}>🔍</span>
              <input value={search} onChange={e => doSearch(e.target.value)} placeholder="Search..." style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid #222", borderRadius: 20, padding: "5px 10px 5px 26px", color: "#fff", fontSize: 12, outline: "none" }} />
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 4, overflowX: "auto", scrollbarWidth: "none", marginBottom: showSections ? 6 : 0 }}>
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => switchTab(id)} style={{ padding: "4px 10px", borderRadius: 18, border: tab === id ? "1px solid #e50914" : "1px solid #222", background: tab === id ? "rgba(229,9,20,0.18)" : "transparent", color: tab === id ? "#e50914" : "#666", fontSize: 11, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
              {id === "wl" ? label + " " + wl.length : label}
            </button>
          ))}
        </div>
        {showSections && (
          <div style={{ display: "flex", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
            {(tab === "hollywood" ? ["popular","top","upcoming","now"] : ["popular","top","on_air"]).map(s => (
              <button key={s} onClick={() => { setSec(s); setPage(1); }} style={{ padding: "3px 9px", borderRadius: 14, border: sec === s ? "1px solid #e50914" : "1px solid #222", background: sec === s ? "rgba(229,9,20,0.12)" : "transparent", color: sec === s ? "#e50914" : "#555", fontSize: 10, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600 }}>
                {s === "popular" ? "Popular" : s === "top" ? "Top" : s === "upcoming" ? "Upcoming" : s === "now" ? "Now Playing" : "On Air"}
              </button>
            ))}
          </div>
        )}
      </div>

      {showGenres && (
        <div style={{ padding: "6px 12px", display: "flex", gap: 5, overflowX: "auto", scrollbarWidth: "none" }}>
          {GENRES.map(g => (
            <button key={g.id} onClick={() => { setGenre(g.id); setPage(1); }} style={{ padding: "3px 10px", borderRadius: 18, border: genre === g.id ? "1px solid #e50914" : "1px solid #222", background: genre === g.id ? "#e50914" : "transparent", color: genre === g.id ? "#fff" : "#555", fontSize: 10, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600 }}>
              {g.name}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: "4px 12px 32px" }}>
        {tab === "wl" && wl.length === 0 ? (
          <div style={{ textAlign: "center", padding: 70, color: "#444" }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>❤️</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Watchlist Empty</div>
            <div style={{ fontSize: 12 }}>♡ button se save karo!</div>
          </div>
        ) : loading && tab !== "wl" ? (
          <div style={{ textAlign: "center", padding: 60, color: "#444" }}>
            <div style={{ fontSize: 32, animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</div>
            <div style={{ marginTop: 10, fontSize: 13 }}>Loading...</div>
          </div>
        ) : list.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#444" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎬</div>
            <div style={{ fontSize: 13 }}>Kuch nahi mila!</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
            {list.map(item => (
              <Card key={item.id} item={item} onInfo={showInfo} onToggle={toggle} saved={inWl(item.id)} kind={kind} />
            ))}
          </div>
        )}
        {!loading && tab !== "wl" && list.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 22, alignItems: "center" }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} style={{ padding: "6px 13px", borderRadius: 7, border: "1px solid #222", background: "transparent", color: page===1?"#333":"#ccc", cursor: page===1?"default":"pointer", fontSize: 12 }}>← Prev</button>
            <span style={{ color: "#555", fontSize: 12 }}>{page}/{pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page===pages} style={{ padding: "6px 13px", borderRadius: 7, border: "1px solid #222", background: "transparent", color: page===pages?"#333":"#ccc", cursor: page===pages?"default":"pointer", fontSize: 12 }}>Next →</button>
          </div>
        )}
      </div>

      {info && <InfoModal item={info} kind={infoKind} onClose={() => setInfo(null)} onPlay={play} onToggle={toggle} saved={inWl(info.id)} />}
    </div>
  );
}
