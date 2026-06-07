import { useState, useEffect, useRef } from "react";

const KEY = "2dca580c2a14b55200e784d157207b4d";
const API = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w185";
const BG = "https://image.tmdb.org/t/p/original";

const SECTIONS = [
  { id: "trending", label: "🔥 Trending" },
  { id: "bollywood", label: "🇮🇳 Bollywood" },
  { id: "hollywood", label: "🎬 Hollywood" },
  { id: "anime", label: "⛩️ Anime" },
  { id: "korean", label: "🇰🇷 Korean" },
  { id: "tamil", label: "🎭 Tamil" },
  { id: "telugu", label: "🎬 Telugu" },
  { id: "tv", label: "📺 TV Shows" },
  { id: "wl", label: "❤️ Watchlist" },
];

const ROWS = [
  { id: "trending", label: "🔥 Trending Now", url: API + "/trending/all/week?api_key=" + KEY },
  { id: "bollywood", label: "🇮🇳 Bollywood Hits", url: API + "/discover/movie?api_key=" + KEY + "&with_original_language=hi&sort_by=popularity.desc" },
  { id: "hollywood", label: "🎬 Hollywood", url: API + "/movie/popular?api_key=" + KEY },
  { id: "anime", label: "⛩️ Anime", url: API + "/discover/tv?api_key=" + KEY + "&with_genres=16&with_origin_country=JP&sort_by=popularity.desc" },
  { id: "korean", label: "🇰🇷 Korean", url: API + "/discover/movie?api_key=" + KEY + "&with_original_language=ko&sort_by=popularity.desc" },
  { id: "tamil", label: "🎭 Tamil", url: API + "/discover/movie?api_key=" + KEY + "&with_original_language=ta&sort_by=popularity.desc" },
  { id: "top_rated", label: "⭐ Top Rated", url: API + "/movie/top_rated?api_key=" + KEY },
  { id: "tv", label: "📺 TV Shows", url: API + "/tv/popular?api_key=" + KEY },
];

const GENRES = [
  { id: "", name: "All" }, { id: 28, name: "Action" }, { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" }, { id: 27, name: "Horror" }, { id: 878, name: "Sci-Fi" },
  { id: 10749, name: "Romance" }, { id: 16, name: "Animation" }, { id: 53, name: "Thriller" },
];

function getServerUrl(item, kind, season, episode, serverIdx) {
  const id = item.id;
  const isTv = kind === "tv" || kind === "anime_tv";
  const s = season || 1;
  const e = episode || 1;
  if (serverIdx === 0) return isTv ? "https://www.2embed.cc/embedtv/" + id + "&s=" + s + "&e=" + e : "https://www.2embed.cc/embed/" + id;
  if (serverIdx === 1) return isTv ? "https://vidsrc.to/embed/tv/" + id + "/" + s + "/" + e : "https://vidsrc.to/embed/movie/" + id;
  return isTv ? "https://vidsrc.me/embed/tv?tmdb=" + id + "&season=" + s + "&episode=" + e : "https://vidsrc.me/embed/movie?tmdb=" + id;
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

function SkeletonCard() {
  return (
    <div style={{ width: 130, flexShrink: 0, borderRadius: 10, overflow: "hidden", background: "#111" }}>
      <div style={{ width: "100%", aspectRatio: "2/3", background: "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      <div style={{ padding: 8 }}>
        <div style={{ height: 10, borderRadius: 4, background: "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", marginBottom: 6 }} />
        <div style={{ height: 8, borderRadius: 4, width: "60%", background: "linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      </div>
    </div>
  );
}

function Card({ item, onInfo, onToggle, saved, kind }) {
  const [hovered, setHovered] = useState(false);
  const title = item.title || item.name || "";
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ width: 130, flexShrink: 0, borderRadius: 10, overflow: "hidden", background: "#111", cursor: "pointer", transition: "transform 0.25s, box-shadow 0.25s", transform: hovered ? "scale(1.06)" : "scale(1)", boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.8)" : "none", position: "relative", zIndex: hovered ? 10 : 1 }}>
      <div onClick={() => onInfo(item, kind)}>
        <img src={item.poster_path ? IMG + item.poster_path : "https://placehold.co/130x195/111/333?text=No+Img"} alt={title}
          style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" }} loading="lazy" decoding="async" />
        <div style={{ position: "absolute", inset: 0, background: hovered ? "linear-gradient(to top,rgba(0,0,0,0.95) 40%,rgba(0,0,0,0.2) 100%)" : "linear-gradient(to top,rgba(0,0,0,0.85) 25%,transparent 65%)", transition: "all 0.3s" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Stars n={item.vote_average} />
            <span style={{ fontSize: 10, color: "#aaa" }}>{year}</span>
          </div>
          {hovered && (
            <div style={{ marginTop: 6, animation: "fadeUp 0.2s ease" }}>
              <div style={{ fontSize: 10, color: "#ccc", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.overview}</div>
              <button onClick={e => { e.stopPropagation(); onInfo(item, kind); }}
                style={{ marginTop: 6, width: "100%", padding: 5, background: "#e50914", border: "none", color: "#fff", borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>▶ Play</button>
            </div>
          )}
        </div>
      </div>
      <button onClick={e => { e.stopPropagation(); onToggle(item, kind); }}
        style={{ position: "absolute", top: 6, right: 6, background: saved ? "#e50914" : "rgba(0,0,0,0.7)", border: "none", color: "#fff", width: 26, height: 26, borderRadius: "50%", cursor: "pointer", fontSize: 12, transition: "all 0.2s" }}>
        {saved ? "♥" : "♡"}
      </button>
    </div>
  );
}

function Row({ section, onInfo, onToggle, inWl }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const scrollRef = useRef(null);
  const rowRef = useRef(null);
  const kind = section.id === "tv" ? "tv" : section.id === "anime" ? "anime_tv" : "movie";

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } }, { rootMargin: "200px" });
    if (rowRef.current) obs.observe(rowRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    fetch(section.url).then(r => r.json()).then(d => { setItems(d.results || []); setLoading(false); }).catch(() => setLoading(false));
  }, [visible, section.url]);

  const scroll = dir => { if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 400, behavior: "smooth" }); };

  return (
    <div ref={rowRef} style={{ marginBottom: 32, animation: "fadeUp 0.5s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{section.label}</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => scroll(-1)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid #333", color: "#fff", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <button onClick={() => scroll(1)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid #333", color: "#fff", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        </div>
      </div>
      <div ref={scrollRef} style={{ display: "flex", gap: 10, overflowX: "auto", padding: "4px 16px 8px", scrollbarWidth: "none" }}>
        {loading ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />) : items.map(item => (
          <Card key={item.id} item={item} onInfo={onInfo} onToggle={onToggle} saved={inWl(item.id)} kind={kind} />
        ))}
      </div>
    </div>
  );
}

function Player({ item, kind, season, episode, onClose }) {
  const [server, setServer] = useState(0);
  const s = season || 1;
  const e = episode || 1;

  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 9999, display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: "#111", flexShrink: 0, gap: 6, flexWrap: "wrap" }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "30%" }}>
          {item.title || item.name}{season ? " S" + s + "E" + e : ""}
        </span>
        <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
          {["Server 1", "Server 2", "Server 3"].map((label, i) => (
            <button key={i} onClick={() => setServer(i)}
              style={{ padding: "4px 10px", borderRadius: 6, border: server === i ? "1px solid #e50914" : "1px solid #333", background: server === i ? "rgba(229,9,20,0.25)" : "#222", color: server === i ? "#e50914" : "#aaa", fontSize: 11, cursor: "pointer", fontWeight: 600, transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
          <button onClick={() => { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); }}
            style={{ background: "#222", border: "1px solid #333", color: "#fff", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>⛶</button>
          <button onClick={onClose} style={{ background: "#e50914", border: "none", color: "#fff", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: 11 }}>✕ Close</button>
        </div>
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <iframe src={getServerUrl(item, kind, s, e, server)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          allowFullScreen allow="autoplay; fullscreen; picture-in-picture" title={item.title || item.name} />
      </div>
    </div>
  );
}

function InfoModal({ item, kind, onClose, onPlay, onToggle, saved }) {
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [seasons, setSeasons] = useState([]);
  const [selSeason, setSelSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [loadingEp, setLoadingEp] = useState(false);
  const title = item.title || item.name || "";
  const isTv = kind === "tv" || kind === "anime_tv";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    fetch(API + "/" + (isTv ? "tv" : "movie") + "/" + item.id + "/videos?api_key=" + KEY)
      .then(r => r.json()).then(d => { const v = (d.results || []).find(x => x.site === "YouTube" && x.type === "Trailer"); if (v) setTrailerKey(v.key); }).catch(() => {});
    if (isTv) {
      fetch(API + "/tv/" + item.id + "?api_key=" + KEY).then(r => r.json()).then(d => { setSeasons((d.seasons || []).filter(x => x.season_number > 0)); }).catch(() => {});
    }
    return () => { document.body.style.overflow = ""; };
  }, [item.id, kind]);

  useEffect(() => {
    if (!isTv) return;
    setLoadingEp(true);
    fetch(API + "/tv/" + item.id + "/season/" + selSeason + "?api_key=" + KEY)
      .then(r => r.json()).then(d => { setEpisodes(d.episodes || []); setLoadingEp(false); }).catch(() => setLoadingEp(false));
  }, [item.id, selSeason, isTv]);

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
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 14, animation: "fadeIn 0.25s ease" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(180deg,#0d0d18,#080810)", borderRadius: 20, overflow: "hidden", maxWidth: 680, width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative", border: "1px solid #1a1a2e", boxShadow: "0 30px 80px rgba(0,0,0,0.8)" }}>
          {item.backdrop_path && (
            <div style={{ position: "relative", height: 190 }}>
              <img src={BG + item.backdrop_path} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.2),#0d0d18)" }} />
            </div>
          )}
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.7)", border: "1px solid #333", color: "#fff", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", fontSize: 17, zIndex: 10 }}>×</button>
          <div style={{ padding: "14px 16px 10px", display: "flex", gap: 14, flexWrap: "wrap" }}>
            <img src={item.poster_path ? IMG + item.poster_path : "https://placehold.co/90x135/111/555?text=N/A"} alt={title}
              style={{ width: 90, height: 135, objectFit: "cover", borderRadius: 10, flexShrink: 0, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }} />
            <div style={{ flex: 1, minWidth: 150 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 6 }}>{title}</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
                <Stars n={item.vote_average} />
                <span style={{ fontSize: 10, color: "#aaa", background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: 12 }}>{(item.release_date || item.first_air_date || "").slice(0, 4)}</span>
                <span style={{ fontSize: 10, color: "#e50914", background: "rgba(229,9,20,0.15)", padding: "2px 8px", borderRadius: 12 }}>HD</span>
              </div>
              <p style={{ fontSize: 12, color: "#bbb", lineHeight: 1.65, marginBottom: 12 }}>{item.overview || "No description available."}</p>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {!isTv && (
                  <button onClick={() => { onClose(); onPlay(item, kind, null, null); }}
                    style={{ padding: "9px 18px", background: "linear-gradient(135deg,#e50914,#ff4444)", border: "none", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(229,9,20,0.4)" }}>
                    ▶ Watch Now
                  </button>
                )}
                {trailerKey && (
                  <button onClick={() => setShowTrailer(true)}
                    style={{ padding: "9px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid #333", color: "#fff", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
                    🎬 Trailer
                  </button>
                )}
                <button onClick={() => onToggle(item, kind)}
                  style={{ padding: "9px 14px", background: saved ? "rgba(229,9,20,0.2)" : "rgba(255,255,255,0.05)", border: "1px solid " + (saved ? "#e50914" : "#333"), color: saved ? "#e50914" : "#ccc", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
                  {saved ? "♥ Saved" : "♡ Save"}
                </button>
              </div>
            </div>
          </div>

          {isTv && seasons.length > 0 && (
            <div style={{ padding: "8px 16px 16px" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Seasons</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
                {seasons.map(s => (
                  <button key={s.season_number} onClick={() => setSelSeason(s.season_number)}
                    style={{ padding: "5px 12px", borderRadius: 14, border: selSeason === s.season_number ? "1px solid #e50914" : "1px solid #333", background: selSeason === s.season_number ? "rgba(229,9,20,0.2)" : "transparent", color: selSeason === s.season_number ? "#e50914" : "#777", fontSize: 11, cursor: "pointer", transition: "all 0.2s" }}>
                    S{s.season_number}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Episodes</div>
              {loadingEp ? <div style={{ color: "#555", fontSize: 12, padding: "8px 0" }}>Loading...</div> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {episodes.map(ep => (
                    <div key={ep.id} onClick={() => { onClose(); onPlay(item, kind, selSeason, ep.episode_number); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 10, cursor: "pointer", border: "1px solid #1a1a1a", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(229,9,20,0.08)"; e.currentTarget.style.borderColor = "#e50914"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "#1a1a1a"; }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#e50914,#ff6b6b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{ep.episode_number}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ep.name || "Episode " + ep.episode_number}</div>
                        <div style={{ fontSize: 10, color: "#555" }}>{ep.air_date || ""}</div>
                      </div>
                      <div style={{ color: "#e50914", fontSize: 16 }}>▶</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function HeroSection({ onInfo }) {
  const [heroes, setHeroes] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    fetch(API + "/trending/movie/week?api_key=" + KEY).then(r => r.json()).then(d => setHeroes(d.results?.slice(0, 5) || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % Math.max(1, heroes.length)), 6000);
    return () => clearInterval(t);
  }, [heroes.length]);

  if (!heroes.length) return null;
  const hero = heroes[idx];

  return (
    <div style={{ position: "relative", height: 460, overflow: "hidden" }}>
      {heroes.map((h, i) => (
        <div key={h.id} style={{ position: "absolute", inset: 0, transition: "opacity 1s ease", opacity: i === idx ? 1 : 0 }}>
          <img src={h.backdrop_path ? BG + h.backdrop_path : ""} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ))}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,rgba(8,8,16,0.97) 30%,rgba(8,8,16,0.2) 70%),linear-gradient(to top,#080810 0%,transparent 55%)" }} />
      <div style={{ position: "absolute", bottom: 50, left: 0, padding: "0 20px", maxWidth: 500 }}>
        <div style={{ fontSize: 9, color: "#e50914", letterSpacing: 4, fontWeight: 800, marginBottom: 8 }}>🔥 TRENDING NOW</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 10, animation: "fadeUp 0.5s ease" }}>{hero.title || hero.name}</div>
        <Stars n={hero.vote_average} />
        <p style={{ fontSize: 12, color: "#bbb", lineHeight: 1.65, margin: "8px 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{hero.overview}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onInfo(hero, "movie")}
            style={{ padding: "10px 22px", background: "linear-gradient(135deg,#e50914,#ff4444)", border: "none", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(229,9,20,0.5)", transition: "transform 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
            ▶ Watch Now
          </button>
          <button onClick={() => onInfo(hero, "movie")}
            style={{ padding: "10px 18px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
            ℹ More Info
          </button>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
        {heroes.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 20 : 6, height: 6, borderRadius: 3, background: i === idx ? "#e50914" : "rgba(255,255,255,0.3)", border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0 }} />
        ))}
      </div>
    </div>
  );
}

function SectionPage({ tab, onInfo, onToggle, inWl }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sec, setSec] = useState("popular");
  const [genre, setGenre] = useState("");

  const buildUrl = (p, s, g) => {
    if (tab === "trending") return API + "/trending/all/week?api_key=" + KEY + "&page=" + p;
    if (tab === "bollywood") return API + "/discover/movie?api_key=" + KEY + "&with_original_language=hi&sort_by=popularity.desc&page=" + p + (g ? "&with_genres=" + g : "");
    if (tab === "hollywood") { const e = s === "top" ? "top_rated" : s === "upcoming" ? "upcoming" : s === "now" ? "now_playing" : "popular"; return API + "/movie/" + e + "?api_key=" + KEY + "&page=" + p + (g ? "&with_genres=" + g : ""); }
    if (tab === "anime") return API + "/discover/tv?api_key=" + KEY + "&with_genres=16&with_origin_country=JP&sort_by=popularity.desc&page=" + p;
    if (tab === "korean") return API + "/discover/movie?api_key=" + KEY + "&with_original_language=ko&sort_by=popularity.desc&page=" + p;
    if (tab === "tamil") return API + "/discover/movie?api_key=" + KEY + "&with_original_language=ta&sort_by=popularity.desc&page=" + p;
    if (tab === "telugu") return API + "/discover/movie?api_key=" + KEY + "&with_original_language=te&sort_by=popularity.desc&page=" + p;
    if (tab === "tv") { const e = s === "top" ? "top_rated" : s === "on_air" ? "on_the_air" : "popular"; return API + "/tv/" + e + "?api_key=" + KEY + "&page=" + p + (g ? "&with_genres=" + g : ""); }
    return API + "/movie/popular?api_key=" + KEY + "&page=" + p;
  };

  useEffect(() => {
    setLoading(true);
    fetch(buildUrl(page, sec, genre)).then(r => r.json()).then(d => { setItems(d.results || []); setPages(Math.min(d.total_pages || 1, 20)); setLoading(false); }).catch(() => setLoading(false));
  }, [tab, page, sec, genre]);

  const kind = tab === "tv" ? "tv" : tab === "anime" ? "anime_tv" : "movie";
  const showSec = tab === "hollywood" || tab === "tv";
  const showGenre = ["bollywood", "hollywood", "tv"].includes(tab);

  return (
    <div style={{ padding: "0 0 32px", animation: "fadeUp 0.3s ease" }}>
      {showSec && (
        <div style={{ display: "flex", gap: 5, padding: "10px 16px 0", overflowX: "auto", scrollbarWidth: "none" }}>
          {(tab === "hollywood" ? ["popular","top","upcoming","now"] : ["popular","top","on_air"]).map(s => (
            <button key={s} onClick={() => { setSec(s); setPage(1); }}
              style={{ padding: "4px 12px", borderRadius: 14, border: sec === s ? "1px solid #e50914" : "1px solid #222", background: sec === s ? "rgba(229,9,20,0.15)" : "transparent", color: sec === s ? "#e50914" : "#555", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600, transition: "all 0.2s" }}>
              {s === "popular" ? "Popular" : s === "top" ? "Top Rated" : s === "upcoming" ? "Upcoming" : s === "now" ? "Now Playing" : "On Air"}
            </button>
          ))}
        </div>
      )}
      {showGenre && (
        <div style={{ display: "flex", gap: 5, padding: "8px 16px", overflowX: "auto", scrollbarWidth: "none" }}>
          {GENRES.map(g => (
            <button key={g.id} onClick={() => { setGenre(g.id); setPage(1); }}
              style={{ padding: "3px 10px", borderRadius: 16, border: genre === g.id ? "1px solid #e50914" : "1px solid #222", background: genre === g.id ? "#e50914" : "transparent", color: genre === g.id ? "#fff" : "#555", fontSize: 10, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600, transition: "all 0.2s" }}>
              {g.name}
            </button>
          ))}
        </div>
      )}
      <div style={{ padding: "8px 16px 0" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 12 }}>
            {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 12 }}>
            {items.map(item => <Card key={item.id} item={item} onInfo={onInfo} onToggle={onToggle} saved={inWl(item.id)} kind={kind} />)}
          </div>
        )}
        {!loading && items.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 24, alignItems: "center" }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid #222", background: "transparent", color: page===1?"#333":"#ccc", cursor: page===1?"default":"pointer", fontSize: 12 }}>← Prev</button>
            <span style={{ color: "#444", fontSize: 12 }}>{page} / {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page===pages} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid #222", background: "transparent", color: page===pages?"#333":"#ccc", cursor: page===pages?"default":"pointer", fontSize: 12 }}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [info, setInfo] = useState(null);
  const [infoKind, setInfoKind] = useState("movie");
  const [player, setPlayer] = useState(null);
  const [playerKind, setPlayerKind] = useState("movie");
  const [playerSeason, setPlayerSeason] = useState(null);
  const [playerEp, setPlayerEp] = useState(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [wl, setWl] = useState(() => { try { return JSON.parse(localStorage.getItem("mf_wl2") || "[]"); } catch { return []; } });
  const timer = useRef(null);

  const saveWl = list => { setWl(list); try { localStorage.setItem("mf_wl2", JSON.stringify(list)); } catch {} };
  const toggle = (item, kind) => {
    if (wl.find(x => x.id === item.id)) saveWl(wl.filter(x => x.id !== item.id));
    else saveWl([...wl, { ...item, _k: kind }]);
  };
  const inWl = id => wl.some(x => x.id === id);
  const showInfo = (item, k) => { setInfo(item); setInfoKind(k); };
  const play = (item, k, s, e) => { setPlayer(item); setPlayerKind(k); setPlayerSeason(s); setPlayerEp(e); };

  const doSearch = v => {
    setSearch(v);
    clearTimeout(timer.current);
    if (!v.trim()) { setSearchResults([]); return; }
    timer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const [m, t] = await Promise.all([
          fetch(API + "/search/movie?api_key=" + KEY + "&query=" + encodeURIComponent(v)).then(r => r.json()),
          fetch(API + "/search/tv?api_key=" + KEY + "&query=" + encodeURIComponent(v)).then(r => r.json()),
        ]);
        setSearchResults([...(m.results || []).slice(0, 10), ...(t.results || []).slice(0, 10)]);
      } catch {}
      setSearching(false);
    }, 400);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-thumb{background:#e50914;border-radius:3px;}
        input::placeholder{color:#444;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
      `}</style>

      {player && <Player item={player} kind={playerKind} season={playerSeason} episode={playerEp} onClose={() => setPlayer(null)} />}

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(8,8,16,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "10px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 900, background: "linear-gradient(135deg,#e50914,#ff6b6b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 1, flexShrink: 0 }}>MOVIEFLIX</div>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#444", fontSize: 13 }}>🔍</span>
            <input value={search} onChange={e => doSearch(e.target.value)} placeholder="Search movies, shows, anime..."
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "7px 14px 7px 32px", color: "#fff", fontSize: 12, outline: "none", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#e50914"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
          </div>
          <div style={{ background: "rgba(229,9,20,0.15)", border: "1px solid rgba(229,9,20,0.3)", borderRadius: 20, padding: "4px 10px", fontSize: 11, color: "#e50914", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
            onClick={() => setTab("wl")}>
            ❤️ {wl.length}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
          {[{ id: "home", label: "🏠 Home" }, ...SECTIONS].map(({ id, label }) => (
            <button key={id} onClick={() => { setTab(id); setSearch(""); setSearchResults([]); }}
              style={{ padding: "4px 12px", borderRadius: 18, border: tab === id ? "1px solid #e50914" : "1px solid transparent", background: tab === id ? "rgba(229,9,20,0.15)" : "transparent", color: tab === id ? "#e50914" : "#666", fontSize: 11, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ paddingTop: 90 }}>
        {search && (
          <div style={{ padding: "16px 16px 32px", animation: "fadeUp 0.3s ease" }}>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 14 }}>
              {searching ? "Searching..." : searchResults.length + " results for \"" + search + "\""}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 12 }}>
              {searchResults.map(item => (
                <Card key={item.id} item={item} onInfo={showInfo} onToggle={toggle} saved={inWl(item.id)} kind={item.title ? "movie" : "tv"} />
              ))}
            </div>
          </div>
        )}

        {!search && tab === "home" && (
          <>
            <HeroSection onInfo={showInfo} />
            {ROWS.map(row => <Row key={row.id} section={row} onInfo={showInfo} onToggle={toggle} inWl={inWl} />)}
          </>
        )}

        {!search && tab === "wl" && (
          <div style={{ padding: "16px 16px 32px", animation: "fadeUp 0.3s ease" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 16 }}>❤️ My Watchlist ({wl.length})</div>
            {wl.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "#444" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>❤️</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Watchlist Empty</div>
                <div style={{ fontSize: 12 }}>♡ button se movies save karo!</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 12 }}>
                {wl.map(item => <Card key={item.id} item={item} onInfo={showInfo} onToggle={toggle} saved={true} kind={item._k || "movie"} />)}
              </div>
            )}
          </div>
        )}

        {!search && tab !== "home" && tab !== "wl" && (
          <SectionPage tab={tab} onInfo={showInfo} onToggle={toggle} inWl={inWl} />
        )}
      </div>

      {info && <InfoModal item={info} kind={infoKind} onClose={() => setInfo(null)} onPlay={play} onToggle={toggle} saved={inWl(info.id)} />}
    </div>
  );
}
