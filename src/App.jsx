import { useState, useEffect, useRef } from "react";

const KEY = "2dca580c2a14b55200e784d157207b4d";
const API = "https://api.themoviedb.org/3";
const IMG = "/api/img?p=";
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
  if (serverIdx === 2) return isTv ? "https://vidsrc.me/embed/tv?tmdb=" + id + "&season=" + s + "&episode=" + e : "https://vidsrc.me/embed/movie?tmdb=" + id;
  if (serverIdx === 3) return isTv ? "https://vidsrc.xyz/embed/tv?tmdb=" + id + "&season=" + s + "&episode=" + e : "https://vidsrc.xyz/embed/movie?tmdb=" + id;
  return isTv ? "https://embed.su/embed/tv/" + id + "/" + s + "/" + e : "https://embed.su/embed/movie/" + id;
}

// NETFLIX INTRO ANIMATION
function NetflixIntro({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        @keyframes mfReveal { 0%{opacity:0;transform:scale(0.8)} 30%{opacity:1;transform:scale(1.05)} 60%{transform:scale(1)} 85%{opacity:1} 100%{opacity:0} }
        @keyframes mfLine { 0%{width:0} 60%{width:100%} 100%{width:100%} }
        @keyframes mfGlow { 0%,100%{text-shadow:0 0 20px rgba(229,9,20,0.5)} 50%{text-shadow:0 0 60px rgba(229,9,20,0.9),0 0 100px rgba(229,9,20,0.5)} }
        .mf-wrap { animation: mfReveal 3.2s ease forwards; }
        .mf-text { animation: mfGlow 3.2s ease infinite; }
        .mf-line { animation: mfLine 1.5s ease forwards; }
      `}</style>
      <div className="mf-wrap" style={{ textAlign: "center" }}>
        <div className="mf-text" style={{ fontSize: 52, fontWeight: 900, color: "#e50914", letterSpacing: 6, fontFamily: "system-ui, sans-serif" }}>
          MOVIEFLIX
        </div>
        <div style={{ marginTop: 10, height: 3, background: "rgba(229,9,20,0.3)", borderRadius: 3, overflow: "hidden" }}>
          <div className="mf-line" style={{ height: "100%", background: "linear-gradient(90deg,#e50914,#ff6b6b)", borderRadius: 3 }} />
        </div>
      </div>
    </div>
  );
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
    <div style={{ width: 140, flexShrink: 0, borderRadius: 12, overflow: "hidden", background: "#161616" }}>
      <div style={{ width: "100%", aspectRatio: "2/3", background: "linear-gradient(90deg,#161616 25%,#222 50%,#161616 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      <div style={{ padding: 10 }}>
        <div style={{ height: 10, borderRadius: 4, background: "linear-gradient(90deg,#161616 25%,#222 50%,#161616 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", marginBottom: 6 }} />
        <div style={{ height: 8, borderRadius: 4, width: "60%", background: "linear-gradient(90deg,#161616 25%,#222 50%,#161616 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      </div>
    </div>
  );
}

function Card({ item, onInfo, onToggle, saved, kind }) {
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const title = item.title || item.name || "";
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ width: 140, flexShrink: 0, borderRadius: 12, overflow: "hidden", background: "#161616", cursor: "pointer", transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s", transform: hovered ? "scale(1.08) translateY(-4px)" : "scale(1)", boxShadow: hovered ? "0 24px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(229,9,20,0.3)" : "0 4px 12px rgba(0,0,0,0.5)", position: "relative", zIndex: hovered ? 10 : 1 }}>
      <div onClick={() => onInfo(item, kind)}>
        {!imgLoaded && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,#161616 25%,#222 50%,#161616 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", zIndex: 1 }} />}
        <img src={item.poster_path ? IMG + item.poster_path : "https://placehold.co/140x210/161616/333?text=" + encodeURIComponent(title.slice(0, 6))} alt={title}
          onLoad={() => setImgLoaded(true)}
          style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block", opacity: imgLoaded ? 1 : 0, transition: "opacity 0.4s" }} loading="lazy" decoding="async" />
        <div style={{ position: "absolute", inset: 0, background: hovered ? "linear-gradient(to top,rgba(0,0,0,0.98) 45%,rgba(0,0,0,0.3) 100%)" : "linear-gradient(to top,rgba(0,0,0,0.9) 20%,transparent 60%)", transition: "all 0.3s" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Stars n={item.vote_average} />
            <span style={{ fontSize: 10, color: "#aaa" }}>{year}</span>
          </div>
          {hovered && (
            <div style={{ marginTop: 8, animation: "fadeUp 0.2s ease" }}>
              <div style={{ fontSize: 10, color: "#ccc", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 6 }}>{item.overview}</div>
              <button onClick={e => { e.stopPropagation(); onInfo(item, kind); }}
                style={{ width: "100%", padding: "6px", background: "linear-gradient(135deg,#e50914,#ff4444)", border: "none", color: "#fff", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(229,9,20,0.5)" }}>▶ Play</button>
            </div>
          )}
        </div>
      </div>
      <button onClick={e => { e.stopPropagation(); onToggle(item, kind); }}
        style={{ position: "absolute", top: 8, right: 8, background: saved ? "rgba(229,9,20,0.9)" : "rgba(0,0,0,0.75)", border: saved ? "none" : "1px solid rgba(255,255,255,0.3)", color: "#fff", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 13, transition: "all 0.2s", backdropFilter: "blur(4px)", transform: saved ? "scale(1.1)" : "scale(1)" }}>
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
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { rootMargin: "300px" });
    if (rowRef.current) obs.observe(rowRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    fetch(section.url).then(r => r.json()).then(d => { setItems(d.results || []); setLoading(false); }).catch(() => setLoading(false));
  }, [visible, section.url]);

  const scroll = dir => { if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 450, behavior: "smooth" }); };

  return (
    <div ref={rowRef} style={{ marginBottom: 36, animation: "fadeUp 0.5s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>{section.label}</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => scroll(-1)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(229,9,20,0.3)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}>‹</button>
          <button onClick={() => scroll(1)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(229,9,20,0.3)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}>›</button>
        </div>
      </div>
      <div ref={scrollRef} style={{ display: "flex", gap: 12, overflowX: "auto", padding: "4px 20px 12px", scrollbarWidth: "none" }}>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px", background: "linear-gradient(90deg,#0a0a0a,#111)", flexShrink: 0, gap: 8, flexWrap: "wrap", borderBottom: "1px solid #1a1a1a" }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "30%" }}>
          {item.title || item.name}{season ? " · S" + s + "E" + e : ""}
        </span>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {["S1", "S2", "S3", "S4", "S5"].map((label, i) => (
            <button key={i} onClick={() => setServer(i)}
              style={{ padding: "5px 12px", borderRadius: 8, border: server === i ? "1px solid #e50914" : "1px solid #333", background: server === i ? "rgba(229,9,20,0.25)" : "rgba(255,255,255,0.05)", color: server === i ? "#e50914" : "#aaa", fontSize: 11, cursor: "pointer", fontWeight: 600, transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
          <button onClick={() => { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); }}
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid #333", color: "#fff", padding: "5px 12px", borderRadius: 8, cursor: "pointer", fontSize: 11 }}>⛶ Full</button>
          <button onClick={onClose} style={{ background: "linear-gradient(135deg,#e50914,#ff4444)", border: "none", color: "#fff", padding: "5px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 11 }}>✕ Close</button>
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
        <div onClick={() => setShowTrailer(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 800 }}>
            <button onClick={() => setShowTrailer(false)} style={{ display: "block", marginBottom: 10, marginLeft: "auto", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "6px 16px", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>✕ Close</button>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
              <iframe src={"https://www.youtube.com/embed/" + trailerKey + "?autoplay=1"} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", borderRadius: 12 }} allowFullScreen allow="autoplay" />
            </div>
          </div>
        </div>
      )}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 14, animation: "fadeIn 0.25s ease" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(180deg,#0f0f0f,#080808)", borderRadius: 20, overflow: "hidden", maxWidth: 700, width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 40px 100px rgba(0,0,0,0.9)" }}>
          {item.backdrop_path && (
            <div style={{ position: "relative", height: 210 }}>
              <img src={BG + item.backdrop_path} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.15),#0f0f0f)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(0,0,0,0.6),transparent 60%)" }} />
            </div>
          )}
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 18, zIndex: 10, backdropFilter: "blur(4px)", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#e50914"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.8)"}>×</button>
          <div style={{ padding: "16px 18px 12px", display: "flex", gap: 16, flexWrap: "wrap" }}>
            <img src={item.poster_path ? IMG + item.poster_path : "https://placehold.co/95x142/111/555?text=N/A"} alt={title}
              style={{ width: 95, height: 142, objectFit: "cover", borderRadius: 12, flexShrink: 0, boxShadow: "0 12px 32px rgba(0,0,0,0.7)" }} />
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 19, fontWeight: 900, color: "#fff", marginBottom: 7, lineHeight: 1.2 }}>{title}</div>
              <div style={{ display: "flex", gap: 7, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
                <Stars n={item.vote_average} />
                <span style={{ fontSize: 10, color: "#aaa", background: "rgba(255,255,255,0.07)", padding: "2px 8px", borderRadius: 12 }}>{(item.release_date || item.first_air_date || "").slice(0, 4)}</span>
                <span style={{ fontSize: 10, color: "#e50914", background: "rgba(229,9,20,0.12)", padding: "2px 8px", borderRadius: 12, border: "1px solid rgba(229,9,20,0.25)" }}>HD</span>
              </div>
              <p style={{ fontSize: 12, color: "#bbb", lineHeight: 1.7, marginBottom: 14 }}>{item.overview || "No description available."}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {!isTv && (
                  <button onClick={() => { onClose(); onPlay(item, kind, null, null); }}
                    style={{ padding: "10px 20px", background: "linear-gradient(135deg,#e50914,#ff4444)", border: "none", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(229,9,20,0.5)", transition: "all 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                    ▶ Watch Now
                  </button>
                )}
                {trailerKey && (
                  <button onClick={() => setShowTrailer(true)}
                    style={{ padding: "10px 16px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: 10, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}>
                    🎬 Trailer
                  </button>
                )}
                <a href={"https://multimovies.wtf/?s=" + encodeURIComponent(item.title || item.name || "")} target="_blank" rel="noreferrer"
                  style={{ padding: "10px 16px", background: "rgba(255,165,0,0.12)", border: "1px solid rgba(255,165,0,0.3)", color: "#ffa500", borderRadius: 10, fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,165,0,0.22)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,165,0,0.12)"}>
                  🎬 MultiMovies
                </a>
                <a href={"https://hdhub4u.med/?s=" + encodeURIComponent(item.title || item.name || "")} target="_blank" rel="noreferrer"
                  style={{ padding: "10px 16px", background: "rgba(0,200,100,0.12)", border: "1px solid rgba(0,200,100,0.3)", color: "#00c864", borderRadius: 10, fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(0,200,100,0.22)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(0,200,100,0.12)"}>
                  🎥 HDHub4u
                </a>
                <a href={"https://movies4u.as/?s=" + encodeURIComponent(item.title || item.name || "")} target="_blank" rel="noreferrer"
                  style={{ padding: "10px 16px", background: "rgba(100,100,255,0.12)", border: "1px solid rgba(100,100,255,0.3)", color: "#6464ff", borderRadius: 10, fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(100,100,255,0.22)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(100,100,255,0.12)"}>
                  🍿 Movies4u
                </a>
                <button onClick={() => onToggle(item, kind)}
                  style={{ padding: "10px 16px", background: saved ? "rgba(229,9,20,0.18)" : "rgba(255,255,255,0.05)", border: "1px solid " + (saved ? "#e50914" : "rgba(255,255,255,0.1)"), color: saved ? "#e50914" : "#ccc", borderRadius: 10, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
                  {saved ? "♥ Saved" : "♡ Save"}
                </button>
              </div>
            </div>
          </div>
          {isTv && seasons.length > 0 && (
            <div style={{ padding: "8px 18px 20px" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 10 }}>Seasons</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {seasons.map(s => (
                  <button key={s.season_number} onClick={() => setSelSeason(s.season_number)}
                    style={{ padding: "6px 14px", borderRadius: 10, border: selSeason === s.season_number ? "1px solid #e50914" : "1px solid rgba(255,255,255,0.1)", background: selSeason === s.season_number ? "rgba(229,9,20,0.2)" : "rgba(255,255,255,0.04)", color: selSeason === s.season_number ? "#e50914" : "#888", fontSize: 12, cursor: "pointer", fontWeight: 600, transition: "all 0.2s" }}>
                    S{s.season_number}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 10 }}>Episodes</div>
              {loadingEp ? <div style={{ color: "#555", fontSize: 12, padding: "8px 0" }}>Loading...</div> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {episodes.map(ep => (
                    <div key={ep.id} onClick={() => { onClose(); onPlay(item, kind, selSeason, ep.episode_number); }}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 12, cursor: "pointer", border: "1px solid rgba(255,255,255,0.05)", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(229,9,20,0.08)"; e.currentTarget.style.borderColor = "rgba(229,9,20,0.4)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#e50914,#ff6b6b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0, boxShadow: "0 4px 12px rgba(229,9,20,0.4)" }}>{ep.episode_number}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ep.name || "Episode " + ep.episode_number}</div>
                        <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{ep.air_date || ""}</div>
                      </div>
                      <div style={{ color: "#e50914", fontSize: 18 }}>▶</div>
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(API + "/trending/movie/week?api_key=" + KEY).then(r => r.json()).then(d => { setHeroes(d.results?.slice(0, 5) || []); setLoaded(true); }).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % Math.max(1, heroes.length)), 7000);
    return () => clearInterval(t);
  }, [heroes.length]);

  if (!heroes.length) return <div style={{ height: 460, background: "linear-gradient(to bottom,#111,#080810)" }} />;
  const hero = heroes[idx];

  return (
    <div style={{ position: "relative", height: 480, overflow: "hidden" }}>
      {heroes.map((h, i) => (
        <div key={h.id} style={{ position: "absolute", inset: 0, transition: "opacity 1.2s ease", opacity: i === idx ? 1 : 0 }}>
          <img src={h.backdrop_path ? BG + h.backdrop_path : ""} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.7)" }} />
        </div>
      ))}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,rgba(8,8,10,0.98) 25%,rgba(8,8,10,0.15) 65%),linear-gradient(to top,#080810 0%,transparent 60%)" }} />
      <div style={{ position: "absolute", bottom: 60, left: 0, padding: "0 24px", maxWidth: 520, animation: loaded ? "fadeUp 0.8s ease" : "none" }}>
        <div style={{ fontSize: 9, color: "#e50914", letterSpacing: 4, fontWeight: 800, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#e50914", boxShadow: "0 0 8px #e50914", animation: "pulse 2s infinite" }} />
          TRENDING NOW
        </div>
        <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1.05, marginBottom: 12, textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>{hero.title || hero.name}</div>
        <div style={{ marginBottom: 10 }}><Stars n={hero.vote_average} /></div>
        <p style={{ fontSize: 13, color: "#ccc", lineHeight: 1.7, marginBottom: 18, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{hero.overview}</p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => onInfo(hero, "movie")}
            style={{ padding: "11px 26px", background: "linear-gradient(135deg,#e50914,#ff4444)", border: "none", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 24px rgba(229,9,20,0.6)", transition: "all 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(229,9,20,0.7)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(229,9,20,0.6)"; }}>
            ▶ Watch Now
          </button>
          <button onClick={() => onInfo(hero, "movie")}
            style={{ padding: "11px 20px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 10, fontSize: 14, cursor: "pointer", backdropFilter: "blur(8px)", transition: "all 0.25s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>
            ℹ More Info
          </button>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
        {heroes.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 24 : 7, height: 7, borderRadius: 4, background: i === idx ? "#e50914" : "rgba(255,255,255,0.25)", border: "none", cursor: "pointer", transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)", padding: 0, boxShadow: i === idx ? "0 0 10px rgba(229,9,20,0.7)" : "none" }} />
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
    <div style={{ padding: "0 0 40px", animation: "fadeUp 0.35s ease" }}>
      {showSec && (
        <div style={{ display: "flex", gap: 6, padding: "12px 20px 0", overflowX: "auto", scrollbarWidth: "none" }}>
          {(tab === "hollywood" ? ["popular","top","upcoming","now"] : ["popular","top","on_air"]).map(s => (
            <button key={s} onClick={() => { setSec(s); setPage(1); }}
              style={{ padding: "5px 14px", borderRadius: 20, border: sec === s ? "1px solid #e50914" : "1px solid rgba(255,255,255,0.1)", background: sec === s ? "rgba(229,9,20,0.18)" : "transparent", color: sec === s ? "#e50914" : "#666", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600, transition: "all 0.2s" }}>
              {s === "popular" ? "Popular" : s === "top" ? "Top Rated" : s === "upcoming" ? "Upcoming" : s === "now" ? "Now Playing" : "On Air"}
            </button>
          ))}
        </div>
      )}
      {showGenre && (
        <div style={{ display: "flex", gap: 6, padding: "10px 20px", overflowX: "auto", scrollbarWidth: "none" }}>
          {GENRES.map(g => (
            <button key={g.id} onClick={() => { setGenre(g.id); setPage(1); }}
              style={{ padding: "4px 12px", borderRadius: 18, border: genre === g.id ? "1px solid #e50914" : "1px solid rgba(255,255,255,0.08)", background: genre === g.id ? "#e50914" : "transparent", color: genre === g.id ? "#fff" : "#666", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600, transition: "all 0.2s" }}>
              {g.name}
            </button>
          ))}
        </div>
      )}
      <div style={{ padding: "10px 20px 0" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 14 }}>
            {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 14 }}>
            {items.map(item => <Card key={item.id} item={item} onInfo={onInfo} onToggle={onToggle} saved={inWl(item.id)} kind={kind} />)}
          </div>
        )}
        {!loading && items.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 28, alignItems: "center" }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              style={{ padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: page===1?"#333":"#ccc", cursor: page===1?"default":"pointer", fontSize: 13, transition: "all 0.2s" }}>← Prev</button>
            <span style={{ color: "#444", fontSize: 13 }}>{page} / {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page===pages}
              style={{ padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: page===pages?"#333":"#ccc", cursor: page===pages?"default":"pointer", fontSize: 13, transition: "all 0.2s" }}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
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
  const [wl, setWl] = useState(() => { try { return JSON.parse(localStorage.getItem("mf_wl3") || "[]"); } catch { return []; } });
  const [scrolled, setScrolled] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const saveWl = list => { setWl(list); try { localStorage.setItem("mf_wl3", JSON.stringify(list)); } catch {} };
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
    <div style={{ minHeight: "100vh", background: "#080810", color: "#fff", fontFamily: "'Netflix Sans', system-ui, sans-serif" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-thumb{background:#e50914;border-radius:3px;}
        input::placeholder{color:#555;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
      `}</style>

      {showIntro && <NetflixIntro onDone={() => setShowIntro(false)} />}
      {player && <Player item={player} kind={playerKind} season={playerSeason} episode={playerEp} onClose={() => setPlayer(null)} />}

      {/* NAVBAR */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? "rgba(8,8,10,0.98)" : "linear-gradient(to bottom,rgba(8,8,10,0.9),transparent)", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.04)" : "none", padding: "10px 20px", transition: "all 0.4s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 9 }}>
          <div style={{ fontSize: 22, fontWeight: 900, background: "linear-gradient(135deg,#e50914 30%,#ff6b6b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 1, flexShrink: 0, textShadow: "none", filter: "drop-shadow(0 0 20px rgba(229,9,20,0.5))" }}>MOVIEFLIX</div>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#555", fontSize: 14 }}>🔍</span>
            <input value={search} onChange={e => doSearch(e.target.value)} placeholder="Search movies, shows, anime..."
              style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 28, padding: "8px 16px 8px 36px", color: "#fff", fontSize: 13, outline: "none", transition: "all 0.3s" }}
              onFocus={e => { e.target.style.borderColor = "#e50914"; e.target.style.background = "rgba(255,255,255,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.07)"; }} />
          </div>
          <div onClick={() => { setTab("wl"); setSearch(""); setSearchResults([]); }}
            style={{ background: wl.length > 0 ? "rgba(229,9,20,0.2)" : "rgba(255,255,255,0.06)", border: "1px solid " + (wl.length > 0 ? "rgba(229,9,20,0.4)" : "rgba(255,255,255,0.1)"), borderRadius: 24, padding: "5px 12px", fontSize: 12, color: wl.length > 0 ? "#e50914" : "#888", fontWeight: 700, cursor: "pointer", flexShrink: 0, transition: "all 0.3s" }}>
            ❤️ {wl.length}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
          {[{ id: "home", label: "🏠 Home" }, ...SECTIONS].map(({ id, label }) => (
            <button key={id} onClick={() => { setTab(id); setSearch(""); setSearchResults([]); }}
              style={{ padding: "5px 14px", borderRadius: 20, border: tab === id ? "1px solid #e50914" : "1px solid transparent", background: tab === id ? "rgba(229,9,20,0.15)" : "transparent", color: tab === id ? "#e50914" : "#777", fontSize: 12, cursor: "pointer", fontWeight: tab === id ? 700 : 500, whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.25s" }}
              onMouseEnter={e => { if (tab !== id) { e.currentTarget.style.color = "#ccc"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; } }}
              onMouseLeave={e => { if (tab !== id) { e.currentTarget.style.color = "#777"; e.currentTarget.style.background = "transparent"; } }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ paddingTop: 95 }}>
        {search && (
          <div style={{ padding: "20px 20px 40px", animation: "fadeUp 0.3s ease" }}>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
              {searching ? "Searching..." : searchResults.length + " results for \"" + search + "\""}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 14 }}>
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
          <div style={{ padding: "20px 20px 40px", animation: "fadeUp 0.35s ease" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              ❤️ My Watchlist
              <span style={{ fontSize: 13, color: "#e50914", background: "rgba(229,9,20,0.15)", padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(229,9,20,0.3)" }}>{wl.length}</span>
            </div>
            {wl.length === 0 ? (
              <div style={{ textAlign: "center", padding: 80, color: "#333" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>❤️</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: "#666" }}>Watchlist Empty</div>
                <div style={{ fontSize: 13, color: "#444" }}>♡ button se movies save karo!</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 14 }}>
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
