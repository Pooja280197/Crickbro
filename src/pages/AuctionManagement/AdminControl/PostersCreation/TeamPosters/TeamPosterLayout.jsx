import React from "react";
import bg1 from "../../../../../assets/PosterBackground/teamBg-1.jpg";
import bg2 from "../../../../../assets/PosterBackground/teamBg-2.jpg";
import bg3 from "../../../../../assets/PosterBackground/teamBg-3.jpg";
import bg4 from "../../../../../assets/PosterBackground/teamBg-4.jpg";
import bg5 from "../../../../../assets/PosterBackground/teamBg-5.jpg";

const backgrounds = { 1: bg1, 2: bg2, 3: bg3, 4: bg4, 5: bg5 };

const money = (value) => `₹${Number(value || 0).toLocaleString()}`;

const getTeam = (team) => ({
  name: team?.teamName || team?.teamDoc?.name || team?.name || "Team",
  logo: team?.teamDoc?.logo || team?.teamLogo || team?.logo || team?.teamDetails?.logo,
});

const getTournament = (tournament) => ({
  name: tournament?.name || tournament?.tournamentName || "Tournament",
  logo: tournament?.logo || tournament?.tournamentLogo,
});

const PlayerImage = ({ player, className = "" }) => (
  player?.profilePicture ? (
    <img src={player.profilePicture} alt={player.name || "Player"} className={`h-full w-full object-cover ${className}`} />
  ) : (
    <div className={`flex h-full w-full items-center justify-center bg-black/25 text-2xl font-black ${className}`}>
      {(player?.name || "P").charAt(0)}
    </div>
  )
);

const PosterOne = ({ team, players, tournamentName, tournamentLogo }) => (
  <div className="relative min-h-[675px] w-[1200px] max-w-none overflow-hidden rounded-[2rem] border border-white/10 bg-[#050505] text-white shadow-2xl" data-poster-root="true">
    <img src={backgrounds[1]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/95" />
    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, rgba(255,215,0,0.15) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

    <div className="relative z-10 flex min-h-[675px] flex-col px-12 py-6">
      <header className="flex flex-col gap-6">
        <div className="flex items-center justify-center gap-4 border-b border-white/10 pb-3">
          {tournamentLogo && <img src={tournamentLogo} alt="" className="h-16 w-16 rounded-full border border-yellow-500/50 bg-black/50 p-1.5 object-contain" />}
          <h1 className="text-2xl font-black uppercase leading-none tracking-wider text-white">{tournamentName}</h1>
        </div>

        <div className="flex items-center justify-between rounded-2xl border-l-4 border-yellow-500 bg-gradient-to-r from-white/10 to-transparent px-6 py-4">
          <div className="flex min-w-0 items-center gap-5">
            <div className="relative h-16 w-16 shrink-0">
              <div className="absolute inset-0 rounded-full bg-yellow-500 opacity-20 blur-lg" />
              {team.logo ? <img src={team.logo} alt="" className="relative z-10 h-full w-full rounded-full border-4 border-yellow-500/80 object-cover shadow-2xl" /> : <span className="relative z-10 grid h-full w-full place-items-center rounded-full border-4 border-yellow-500/80 bg-black text-2xl font-black text-yellow-400">{team.name.charAt(0)}</span>}
            </div>
            <h2 className="break-words text-3xl font-extrabold uppercase leading-tight tracking-tight text-yellow-400">{team.name}</h2>
          </div>
          <div className="ml-6 text-right opacity-80"><div className="font-mono text-3xl font-black">{players.length}</div><div className="text-[10px] uppercase tracking-widest text-gray-400">Squad Size</div></div>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-5 items-start gap-4">
        {players.map((player, index) => (
          <article key={player.playerId || index} className="group relative flex flex-col overflow-hidden rounded-xl border border-white/5 bg-black/40">
            <div className="relative h-[132px] overflow-hidden">
              <PlayerImage player={player} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <span className="absolute right-2 top-2 max-w-[42%] break-all rounded-sm border border-white/10 bg-black/55 px-1.5 py-0.5 text-right font-mono text-[7px] leading-3">#{player.batchId || "-"}</span>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent px-3 pb-3 pt-8"><h3 className="break-words text-xs font-bold uppercase leading-4">{player.name}</h3></div>
            </div>
            <div className="flex min-h-8 items-center px-3 py-1.5"><span className="max-w-full break-words rounded-lg bg-yellow-500 px-2 py-1 text-[8px] font-black uppercase leading-3 text-black">{player.playerRole || "Player"}</span></div>
            <div className="mt-auto grid grid-cols-2 gap-2 border-t border-white/5 bg-black/20 p-2 text-center">
              <div className="rounded-md border border-white/5 bg-white/5 py-2"><span className="text-[8px] font-bold uppercase tracking-wider text-gray-400">Base</span><b className="block font-mono text-xs text-gray-300">{money(player.basePrice)}</b></div>
              <div className="rounded-md border border-yellow-500/20 bg-yellow-500/10 py-2"><span className="text-[8px] font-bold uppercase tracking-wider text-yellow-400">Sold</span><b className="block font-mono text-xs text-yellow-400">{money(player.soldPrice)}</b></div>
            </div>
          </article>
        ))}
      </div>

      <footer className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60"><span className="text-gray-400">Official Auction Sheet</span><span className="text-yellow-500">Powered by CrickBro</span></footer>
    </div>
  </div>
);

const PosterTwo = ({ team, players, tournamentName,tournamentLogo }) => (
  <div className="relative min-h-[675px] w-[1200px] max-w-none overflow-hidden bg-[#17310a] text-white" data-poster-root="true">
    <img src={backgrounds[2]} alt="" className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-r from-[#071500]/95 via-[#153706]/75 to-[#071500]/90" />
    <div className="relative grid min-h-[675px] grid-cols-[310px_1fr] items-stretch gap-8 p-10">
      <aside className="flex flex-col justify-between rounded-[28px] border border-lime-200/30 bg-black/35 p-7 backdrop-blur-sm">
        <div>
          <div className="mb-8 flex items-center gap-3 border-b border-white/15 pb-5">
            {tournamentLogo && <img src={tournamentLogo} alt="" className="h-12 w-12 object-contain" />}
            <p className="text-sm font-black uppercase tracking-[0.12em] text-lime-100">{tournamentName}</p>
          </div>
          <div className="mx-auto h-40 w-40 overflow-hidden rounded-full border-[6px] border-lime-300 bg-white/10 shadow-[0_0_42px_rgba(190,242,100,0.35)]">
            {team.logo ? <img src={team.logo} alt="" className="h-full w-full object-contain" /> : null}
          </div>
          <h1 className="mt-7 text-center text-4xl font-black uppercase leading-tight text-lime-200">{team.name}</h1>
          <p className="mt-3 text-center text-xs font-bold uppercase tracking-[0.35em] text-white/60">Official Squad</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-lime-300 p-3 text-center text-[#102000]"><b className="text-2xl">{players.length}</b><p className="text-[10px] font-black uppercase">Players</p></div>
          <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-center"><b className="text-2xl">2026</b><p className="text-[10px] font-black uppercase">Season</p></div>
        </div>
      </aside>
      <main className="min-w-0">
        <div className="mb-5 flex items-end justify-between border-b border-lime-300/40 pb-4">
          <div><p className="text-xs font-black uppercase tracking-[0.4em] text-lime-300">Auction Roster</p><h2 className="mt-1 text-3xl font-black uppercase">Meet the squad</h2></div>
          <span className="rounded-full border border-lime-200/30 px-4 py-2 text-xs font-bold text-lime-100">CRICKBRO</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {players?.map((player, index) => (
            <article key={player.playerId || index} className="flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-black/35">
              <div className="relative h-[118px]"><PlayerImage player={player} /></div>
              <div className="flex flex-1 flex-col p-3"><span className="self-start break-words rounded bg-lime-300 px-2 py-1 text-[9px] font-black uppercase leading-3 text-[#102000]">{player.playerRole || "Player"}</span><h3 className="mt-2 min-h-8 break-words text-xs font-black uppercase leading-4">{player.name}</h3><p className="mt-1 break-words text-[9px] font-bold uppercase text-lime-100/65">Batch #{player.batchId || "-"}</p><div className="mt-auto grid grid-cols-2 gap-1 pt-2 text-[9px]"><span className="rounded bg-white/5 px-1.5 py-1 text-white/60">BASE<br/><b className="text-white">{money(player.basePrice)}</b></span><span className="rounded bg-lime-300/10 px-1.5 py-1 text-lime-100">SOLD<br/><b className="text-lime-300">{money(player.soldPrice)}</b></span></div></div>
            </article>
          ))}
        </div>
      </main>
    </div>
  </div>
);

const PosterThree = ({ team, players, tournamentName, tournamentLogo }) => (
  <div className="relative min-h-[675px] w-[1200px] max-w-none overflow-hidden bg-[#080a12] text-white" data-poster-root="true">
    <img src={backgrounds[3]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
    <div className="absolute inset-0 bg-gradient-to-b from-[#060714]/80 via-[#151125]/75 to-black/95" />
    <div className="relative flex min-h-[675px] flex-col px-12 py-8">
      <header className="flex items-center justify-between border-b border-fuchsia-400/35 pb-5">
        <div className="flex items-center gap-5">{team.logo && <img src={team.logo} alt="" className="h-20 w-20 rounded-2xl border-2 border-fuchsia-400 bg-white/10 object-contain p-1" />}<div><h1 className="text-4xl font-black uppercase">{team.name}</h1></div></div>
        <div className="flex items-center gap-4 text-right"><div><p className="text-sm font-bold uppercase text-white/60">{tournamentName}</p><p className="mt-2 text-3xl font-black text-fuchsia-300">{players.length} <span className="text-sm text-white/50">PLAYERS</span></p></div>{tournamentLogo && <img src={tournamentLogo} alt="" className="h-14 w-14 shrink-0 rounded-xl border border-fuchsia-400/30 bg-white/10 p-1.5 object-contain" />}</div>
      </header>
      <div className="grid grid-cols-5 items-start gap-x-6 gap-y-8 py-8">
        {players?.map((player, index) => (
          <div key={player.playerId || index} className="text-center">
            <div className="relative mx-auto h-24 w-24 rounded-full border-[3px] border-fuchsia-400 bg-black/30 p-1 shadow-[0_0_24px_rgba(232,121,249,0.25)]"><div className="h-full w-full overflow-hidden rounded-full"><PlayerImage player={player} /></div><span className="absolute -bottom-2 left-1/2 w-max max-w-[170px] -translate-x-1/2 break-words rounded-full bg-fuchsia-500 px-2 py-1 text-[8px] font-black uppercase leading-3">{player.playerRole || "Player"}</span></div>
            <h3 className="mx-auto mt-4 min-h-4 max-w-[170px] break-words text-[10px] font-black uppercase leading-4">{player.name}</h3><p className="mt-1 break-words text-[8px] font-bold uppercase leading-3 text-white/50">Batch ID #{player.batchId || "-"}</p><div className="mx-auto mt-2 grid max-w-[170px] grid-cols-2 gap-1 text-[8px]"><span className="rounded bg-white/5 px-1 py-1 text-white/55">BASE<br/><b className="text-white">{money(player.basePrice)}</b></span><span className="rounded bg-fuchsia-400/10 px-1 py-1 text-fuchsia-200">SOLD<br/><b className="text-fuchsia-300">{money(player.soldPrice)}</b></span></div>
          </div>
        ))}
      </div>
      <footer className="mt-2 flex justify-between border-t border-white/10 pt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white/45"><span>Official Auction Squad</span><span className="text-fuchsia-300">Powered by CrickBro</span></footer>
    </div>
  </div>
);

const PosterFour = ({ team, players, tournamentName, tournamentLogo }) => (
  <div className="relative min-h-[675px] w-[1200px] max-w-none overflow-hidden bg-[#050b16] text-white" data-poster-root="true">
    <img src={backgrounds[4]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.08] grayscale" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(212,175,55,0.16),transparent_32%),linear-gradient(135deg,rgba(5,11,22,0.97),rgba(8,23,42,0.96)_55%,rgba(3,9,18,0.99))]" />
    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

    <div className="relative flex min-h-[675px] flex-col px-12 py-9">
      <header className="flex items-center justify-between border-b border-[#d4af37]/35 pb-7">
        <div className="flex min-w-0 items-center gap-6">
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl border border-[#d4af37]/50 bg-white/[0.06] p-2 shadow-[0_12px_35px_rgba(0,0,0,0.35)]">
            {team.logo ? <img src={team.logo} alt="" className="h-full w-full object-contain" /> : <span className="text-3xl font-black text-[#d4af37]">{team.name.charAt(0)}</span>}
          </div>
          <div className="min-w-0">
            <h1 className="break-words font-heading text-[42px] font-black uppercase leading-none tracking-tight text-white">{team.name}</h1>
          </div>
        </div>

        <div className="ml-8 flex max-w-[320px] items-center gap-4 text-right">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">{tournamentName}</p>
            <p className="mt-2 text-3xl font-black text-[#d4af37]">{players.length}<span className="ml-2 text-xs font-bold uppercase tracking-widest text-white/45">Players</span></p>
          </div>
          {tournamentLogo && <img src={tournamentLogo} alt="" className="h-14 w-14 shrink-0 rounded-xl border border-white/10 bg-white/[0.06] p-1.5 object-contain" />}
        </div>
      </header>

      <div className="mt-7 grid grid-cols-5 gap-4">
        {players?.map((player, index) => (
          <article key={player.playerId || index} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.055] shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
            <div className="relative h-[132px] overflow-hidden bg-[#0a1627]">
              <PlayerImage player={player} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07101e] via-transparent to-transparent" />
              <span className="absolute bottom-2 left-2 rounded-md border border-[#d4af37]/35 bg-[#07101e]/90 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-[#ead078]">{player.playerRole || "Player"}</span>
              <span className="absolute right-2 top-2 grid h-6 min-w-6 place-items-center rounded-full border border-white/15 bg-black/50 px-1.5 text-[8px] font-bold text-white/65">{String(index + 1).padStart(2, "0")}</span>
            </div>

            <div className="py-1.5 px-3.5">
              <h3 className="min-h-8 break-words text-[11px] font-black uppercase leading-4 text-white">{player.name}</h3>
              <p className="mt-1 break-words text-[8px] font-semibold uppercase tracking-wide text-white/40">Batch #{player.batchId || "-"}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 text-[8px]">
                <div><p className="uppercase tracking-wider text-white/35">Base Price</p><b className="mt-1 block text-[10px] text-white/80">{money(player.basePrice)}</b></div>
                <div className="text-right"><p className="uppercase tracking-wider text-[#d4af37]/70">Sold Price</p><b className="mt-1 block text-[11px] text-[#ead078]">{money(player.soldPrice)}</b></div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <footer className="mt-8 flex items-center justify-between border-t border-white/10 pt-5 text-[9px] font-bold uppercase tracking-[0.25em] text-white/35">
        <span>Season squad • Verified auction results</span>
        <span className="text-[#d4af37]/75">Powered by CrickBro</span>
      </footer>
    </div>
  </div>
);

const PosterFive = ({ team, players, tournamentName, tournamentLogo }) => (
  <div className="relative min-h-[675px] w-[1200px] max-w-none overflow-hidden bg-[#0879c9] text-white" data-poster-root="true">
    <img src={backgrounds[5]} alt="" className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 bg-[#006fc4]/30" />
    <div className="relative grid h-full grid-cols-[360px_1fr] gap-7 p-10">
      <aside className="flex flex-col items-center justify-center rounded-[32px] border border-white/45 bg-white/15 p-8 text-center backdrop-blur-md">
        {team.logo && <img src={team.logo} alt="" className="h-44 w-44 rounded-[32px] bg-[#111d2f] p-4 object-contain shadow-2xl" />}
        <p className="mt-7 text-xs font-black uppercase tracking-[0.4em] text-blue-100">Team Roster</p><h1 className="mt-2 text-4xl font-black uppercase leading-tight">{team.name}</h1><div className="mt-6 h-px w-24 bg-white/50" />{tournamentLogo && <img src={tournamentLogo} alt="" className="mt-5 h-14 w-14 rounded-xl border border-white/30 bg-white/15 p-1.5 object-contain" />}<p className={tournamentLogo ? "mt-3 text-sm font-bold uppercase text-blue-100" : "mt-5 text-sm font-bold uppercase text-blue-100"}>{tournamentName}</p>
      </aside>
      <main className="rounded-[32px] border border-white/35 bg-[#003f7d]/70 p-7 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-black uppercase tracking-wider">Playing Unit</h2><span className="rounded-full bg-[#111d2f] px-4 py-2 text-xs font-black text-blue-700">{players.length} PLAYERS</span></div>
        <div className="grid grid-cols-3 gap-3">
          {players?.map((player, index) => (
            <article key={player.playerId || index} className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-2.5">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/40"><PlayerImage player={player} /></div><div className="min-w-0 flex-1"><h3 className="break-all text-[10px] font-black uppercase leading-3">{player.name}</h3><p className="mt-1 break-all text-[9px] font-bold uppercase leading-3 text-blue-200">{player.playerRole || "Player"}</p><p className="mt-1 break-all text-[8px] text-white/50">Batch #{player.batchId || "-"}</p><div className="mt-1 grid grid-cols-2 gap-1 text-[8px]"><span className="rounded bg-white/5 px-1 py-0.5 text-white/55">BASE <b className="text-white">{money(player.basePrice)}</b></span><span className="rounded bg-blue-300/10 px-1 py-0.5 text-blue-100">SOLD <b className="text-white">{money(player.soldPrice)}</b></span></div></div>
            </article>
          ))}
        </div>
        <p className="mt-5 text-right text-[10px] font-black uppercase tracking-[0.3em] text-blue-200">Powered by CrickBro</p>
      </main>
    </div>
  </div>
);

const TeamPosterLayout = ({ variant, team: rawTeam, players = [], tournamentName,tournamentLogo}) => {
  const props = { team: getTeam(rawTeam), players, tournamentName,tournamentLogo };
  if (variant === 1) return <PosterOne {...props} />;
  if (variant === 2) return <PosterTwo {...props} />;
  if (variant === 3) return <PosterThree {...props} />;
  if (variant === 4) return <PosterFour {...props} />;
  if (variant === 5) return <PosterFive {...props} />;
  return <PosterOne {...props} />;
};

export default TeamPosterLayout;
