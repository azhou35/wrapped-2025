"use client";

import data from "./data/2025.json";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { RhythmGrid } from "@/components/Charts";
import { STRAVA_DATA } from "./data/strava";
import { SOCIAL_EVENTS } from "./data/socialEvents";


type SectionProps = {
  id?: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  background?: string;
  bleed?: boolean;
};

const accentScarlet = "#dd1c1a";
const sandDune = "#fff8ef";

type StravaRun = {
  date_str: string;
  mi: number;
  cum_mi: number;
  pace_min_per_mi: number;
  pace_smooth: number | null;
  hover: string;
};

type StravaWeek = {
  week_end_str: string;
  mi: number;
};

type StepConfig = {
  id: string;
  title: string;
  body: string;
  state: { start: string; end: string };
};

type BagItem = {
  id: string;
  image: string;
  alt: string;
  description: string;
  // Use percentages for responsive positioning
  style: { top: string; left?: string; right?: string; width: string };
};

type HostedEvent = {
  id: string;
  title: string;
  type: "writing" | "photo" | "fun";
  description: string;
  image: string;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const withBase = (path: string) => {
  if (!path) return path;
  return path.startsWith("/") ? `${basePath}${path}` : path;
};

// Collage items — update paths/positions/descriptions as you swap assets in /public/img
const bagItems: BagItem[] = [
  {
    id: "camera",
    image: "/img/camera.png",
    alt: "Film Camera",
    description: "With trigger-finger tendencies, I got film to compel myself to slow down, and save my shots for the special moments.",
    style: { top: "50%", left: "12%", width: "15%" }, // -60°
  },
  {
    id: "book-wang",
    image: "/img/blockchain.jpg",
    alt: "Blockchain Chicken Farm book",
    description: "50% off at Yu & Me Books, great read on technology's influence in China.",
    style: { top: "18%", left: "23%", width: "13%" }, // -30°
  },
  {
    id: "book-jobs",
    image: "/img/stevejobs.jpg",
    alt: "Steve Jobs biography",
    description: "Tech bro bible but unironically an electric read.",
    style: { top: "10%", left: "43%", width: "12%" }, // 0°
  },
  {
    id: "bag",
    image: "/img/bag.webp",
    alt: "Longchamp tote",
    description: "The bag big enough to contain all my side quests, carried from cafe to cafe.",
    style: { top: "58%", left: "35%", width: "26%" },
  },
  {
    id: "notebook",
    image: "/img/midori.png",
    alt: "Notebook",
    description: "As a kid i was a chronic doodler - i recently revived my midori notebook to capture late-night spirals and morning intrusive thoughts.",
    style: { top: "18%", left: "60%", width: "16%" }, // 30°
  },
  {
    id: "ricoh",
    image: "/img/gr-iii-500-1.png",
    alt: "Ricoh",
    description: "Baby street camera.",
    style: { top: "44%", left: "70%", width: "16%" }, // 60°
  }
];

// Hosted events — update images/types/descriptions as needed
const hostedEvents: HostedEvent[] = [
  {
    id: "writing-circle",
    title: "Writing clubs",
    type: "writing",
    description:
      "In 2024 I met my best friend at a writing club. Fresh off of flight from China, I shared a piece about feeling disconnected with my heritage, and we bonded over our experiences trying to connect with family. In 2025 I wanted to create more chances for connection—so we hosted 10+ writing clubs at third spaces around the city (shout out Pier 57 by Chelsea, Felix’s Cafe in Tribeca, and Justin’s lounge).\n\nIt's a deceptively simple format: write for 40 min, chat, write again, discuss. We joked it's like group pomodoro. But you learn a lot in a session - what someone is going through at work, the random rabbitholes they're diving into, their reflections on travel. You practice biweekly vulnerability by sharing your inner compulsions out loud. To read another's writing is to step into their inner world.",
    image: "/img/writingclubs.png",
  },
  {
    id: "photo-walk",
    title: "Photo walk",
    type: "photo",
    description:
      "In 2024 winter I met Simon at a house party & we bonded over our Fujifilm cameras. Though his Fuji camera collection came and went, our friendship remained, as we explored the city neighborhood by neighborhood.\n\nAn IG-feed felt insufficient to showcase our photos, and so we returned to the physical spaces. In June we hosted a photo gallery in Midtown, featuring photos taken during some of our photowalks in Chinatown and travels around the world. We rented out a photo studio in the fall and wrapped up the year with a scrapbooking event with all our fav printed photos!",
    image: "/img/photowalks.png",
  },
  {
    id: "Cooking",
    title: "Slow meals together",
    type: "fun",
    description: "Comfort is a warm bowl of hot soup, brushing elbows with friends around a folding dining table. Permission to linger at the table long after the wine is drunk, a place to unwind in the presence of others. Food as a love language is over-wrought, but the meals I cooked with friends meant the world to me: preparing my mom's dumpling recipe for CNY, steaming our faces over hot pot, crafting matchas with powder Vinny brought from Japan.",
    image: "/img/food1.png",
  },
];

const steps: StepConfig[] = [
  {
    id: "all",
    title: "“I’m not a fast runner. In fact, I’m not a good runner at all. But I run long distances, and I keep on running.",
    body: "Running was a habit I picked up in 2022, as a way to clear my mind and move my body. This year, as remote work enabled my homebody tendencies it was the main practice that forced me outside.",
    state: { start: "2025-01-01", end: "2025-12-31" },
  },
  {
    id: "winter",
    title: "Cold starts",
    body: "January–February: Winter runs began in anxiety. Disillusioned with work I'd run regularly, trying to wrap my head around an uncomfortable ennui. The cold inadvertently made me faster!",
      state: { start: "2025-01-01", end: "2025-02-29" },
  },
  {
    id: "spring",
    title: "Spring ramps",
    body: "March–April: The city thawing into spring coincided with longer runs leading up to my half in April. Down Brookfield Place a field of tulips were in full bloom.",
    state: { start: "2025-03-01", end: "2025-04-30" },
  },
  {
    id: "summer",
    title: "Summer churn",
    body: "May–August: travel and heat cause dips; consistency comes from repeating 3–4 mile routes.",
    state: { start: "2025-05-01", end: "2025-08-31" },
  },
  {
    id: "heat",
    title: "Overheating on runs",
    body: "Mid-summer heat slowed everything down. Shorter, shaded routes and earlier starts were the only way to keep moving.",
    state: { start: "2025-06-01", end: "2025-08-31" },
  },
  {
    id: "fall",
    title: "Fall finishes",
    body: "September–December: city move + job shift; shorter but sharper runs keep the line from flatlining.",
    state: { start: "2025-09-01", end: "2025-12-31" },
  },
  {
    id: "steady",
    title: "Keeping it steady",
    body: "A reflection: consistency over intensity; keeping the weekly line from hitting the floor.",
    state: { start: "2025-01-01", end: "2025-12-31" },
  },
  {
    id: "next",
    title: "What’s next",
    body: "A placeholder for next goals, follow-ups, or links — swap this for your next chapter.",
    state: { start: "2025-01-01", end: "2025-12-31" },
  },
];

function usePlotly() {
  const [plotly, setPlotly] = useState<any>(typeof window !== "undefined" ? (window as any).Plotly : null);
  useEffect(() => {
    if (plotly || typeof window === "undefined") return;
    const existing = document.querySelector<HTMLScriptElement>('script[data-plotly]');
    if (existing) {
      existing.addEventListener("load", () => setPlotly((window as any).Plotly));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.plot.ly/plotly-2.35.2.min.js";
    script.async = true;
    script.dataset.plotly = "true";
    script.onload = () => setPlotly((window as any).Plotly);
    document.body.appendChild(script);
    return () => {
      script.onload = null;
    };
  }, [plotly]);
  return plotly;
}

function SectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  background,
  bleed,
  noShadow,
  noBorder,
}: SectionProps) {
  const hasHeader = Boolean(eyebrow || title || subtitle);
  return (
    <section
      id={id}
      className={clsx(
        "relative flex min-h-screen snap-start flex-col overflow-hidden",
        noBorder ? "rounded-none border-0" : "rounded-[32px] border border-slate-200/70",
        "shadow-none",
        bleed ? "px-0" : "px-6",
        "py-10",
        background ?? "bg-[var(--sand-dune)]",
      )}
    >
      <div className="relative z-10 flex flex-col gap-5 px-2 sm:px-1">
        {hasHeader ? (
          <>
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
          <span className="h-[1px] w-10 bg-slate-300" />
          {eyebrow}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              {title ? <h2 className="font-serif text-3xl sm:text-4xl text-slate-900">{title}</h2> : null}
          {subtitle ? <p className="max-w-2xl text-sm text-slate-600 sm:text-base">{subtitle}</p> : null}
        </div>
          </>
        ) : null}
        <div className="mt-1">{children}</div>
      </div>
    </section>
  );
}

function WhatsInMyBag({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleContainerClick = () => setActiveId(null);
  const handleItemClick = (id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      className="relative isolate mx-auto w-full max-w-6xl snap-start overflow-hidden rounded-[32px] border border-slate-200/70 bg-[var(--sand-dune)] px-0 py-10 shadow-none"
      onClick={handleContainerClick}
    >
      <div className="flex flex-col gap-4 px-6 pb-4 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Favorite Things</p>
        <h2 className="text-3xl font-serif text-slate-900 sm:text-4xl">What's in my bag?</h2>
        <p className="max-w-3xl text-base text-slate-700">
          2025 saw a return to the analog - reading paperback books, rolling your film, using pen and paper.
        </p>
      </div>

      <div
        className="relative mx-auto w-full max-w-6xl"
        style={{ minHeight: "70vh" }}
      >
        {bagItems.map((item) => {
          const isActive = activeId === item.id;
          const popoverPlacement =
            item.id === "notebook"
              ? { top: "112%", left: "52%", transform: "translate(-50%, 0)" }
              : item.id === "bag"
                ? { top: "12%", left: "112%", transform: "translate(0, 0)" }
                : { top: "105%", left: "50%", transform: "translate(-50%, 0)" };
          return (
            <div
              key={item.id}
              className={clsx("absolute", isActive ? "z-30" : "z-10")}
              style={item.style}
              onClick={(e) => {
                e.stopPropagation();
                handleItemClick(item.id);
              }}
            >
              <img
                src={withBase(item.image)}
                alt={item.alt}
                className={clsx(
                  "h-auto w-full select-none",
                  !prefersReducedMotion && "wiggle-hover"
                )}
                draggable={false}
              />
              {isActive ? (
                <div
                  className="absolute w-max max-w-[260px] rounded-xl border border-slate-200 bg-white/95 px-4 py-3 text-sm text-slate-800 shadow-[0_12px_30px_rgba(15,23,42,0.18)]"
                  style={{ ...popoverPlacement }}
                >
                  <p className="font-semibold text-slate-900">{item.alt}</p>
                  <p className="mt-1 text-slate-700">{item.description}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function Home() {
  const prefersReducedMotion = !!useReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);
  const [d3Ready, setD3Ready] = useState(false);
  const plotly = usePlotly();
  const distanceFullRef = useRef<HTMLDivElement | null>(null);
  const socialCalendarRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [seenSteps, setSeenSteps] = useState<Record<number, boolean>>({ 0: true });
  const [activeHostedType, setActiveHostedType] = useState<HostedEvent["type"]>("writing");

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsLoaded(true);
      return;
    }
    const t = setTimeout(() => setIsLoaded(true), 900);
    return () => clearTimeout(t);
  }, [prefersReducedMotion]);

  // Preload hosted event images for faster swaps
  useEffect(() => {
    hostedEvents.forEach((evt) => {
      if (!evt?.image) return;
      const img = new Image();
      img.src = evt.image;
    });
  }, []);

  // Lightweight D3 loader for the social calendar (uses CDN, avoids bundling)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).d3) {
      setD3Ready(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>('script[data-d3]');
    if (existing) {
      existing.addEventListener("load", () => setD3Ready(true), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/d3@7";
    script.async = true;
    script.dataset.d3 = "true";
    script.onload = () => setD3Ready(true);
    document.body.appendChild(script);
    return () => {
      script.onload = null;
    };
  }, []);

  // Inline social calendar render (similar to standalone HTML)
  useEffect(() => {
    const d3 = (typeof window !== "undefined" ? (window as any).d3 : null) as any;
    const container = socialCalendarRef.current;
    if (!d3 || !container) return;
    const host = container.querySelector<HTMLDivElement>("[data-social-chart]");
    if (!host) return;
    if (!d3Ready) return;

    host.innerHTML = "";

    const tooltip = document.createElement("div");
    tooltip.style.position = "fixed";
    tooltip.style.pointerEvents = "none";
    tooltip.style.background = "rgba(255,255,255,0.96)";
    tooltip.style.border = "1px solid rgba(166,176,200,0.55)";
    tooltip.style.boxShadow = "0 16px 30px rgba(36,48,94,0.18)";
    tooltip.style.padding = "10px 11px";
    tooltip.style.borderRadius = "14px";
    tooltip.style.fontSize = "13px";
    tooltip.style.maxWidth = "320px";
    tooltip.style.opacity = "0";
    tooltip.style.transform = "translateY(6px)";
    host.appendChild(tooltip);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const subtypes = ["1:1", "Event", "Creative Hang"];
    const colors: Record<string, string> = {
      "1:1": "#A8D0E6",
      Event: "#F76C6C",
      "Creative Hang": "#24305E",
    };

    const stats = Array.from({ length: 12 }, (_, m) => ({
      month: m,
      counts: Object.fromEntries(subtypes.map((s) => [s, 0])) as Record<string, number>,
      total: 0,
    }));

    for (const e of SOCIAL_EVENTS) {
      const m = e.month;
      const s = e.social_subtype || "Event";
      const cell = stats[m];
      if (!(s in cell.counts)) continue;
      cell.counts[s] += 1;
      cell.total += 1;
    }

    const maxTotal = Math.max(1, ...stats.map((d) => d.total));

    const computedWidth = host.clientWidth || 0;
    const width = computedWidth > 40 ? Math.min(900, computedWidth) : 900;
    const height = 720;
    const svg = d3
      .select(host as HTMLDivElement)
      .append("svg")
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    // Match site sand background
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#fff8ef");

    const cx = width / 2;
    const cy = height / 2;
    const g = svg.append("g").attr("transform", `translate(${cx},${cy})`);
    const rBase = Math.min(width, height) * 0.24;
    const rMaxExtra = Math.min(width, height) * 0.20;
    const gap = 0.012;
    const monthSpan = (2 * Math.PI) / 12;
    const arc = d3.arc();

    g.append("circle")
      .attr("r", rBase + rMaxExtra + 36)
      .attr("fill", "none")
      .attr("stroke", "rgba(166,176,200,0.7)")
      .attr("stroke-width", 1)
      .attr("opacity", 0.65);

    const segs: any[] = [];
    for (let s = 0; s < 12; s++) {
      const m = (s - 3 + 12) % 12;
      const cell = stats[m];
      const startAngle = -Math.PI / 2 + s * monthSpan + gap / 2;
      const endAngle = startAngle + monthSpan - gap;
      segs.push({ ...cell, slot: s, startAngle, endAngle });
    }

    const thickness = (d: any) => (d.total <= 0 ? 10 : 10 + (d.total / maxTotal) * rMaxExtra);

    g.selectAll("path.back")
      .data(segs)
      .enter()
      .append("path")
      .attr("d", (d: any) =>
        arc({
          innerRadius: rBase,
          outerRadius: rBase + rMaxExtra + 18,
          startAngle: d.startAngle,
          endAngle: d.endAngle,
        }),
      )
      .attr("fill", "#fff")
      .attr("opacity", 0.92)
      .attr("stroke", "rgba(166,176,200,0.55)")
      .attr("stroke-width", 1);

    const labelR = rBase + rMaxExtra + 60;
    for (let m = 0; m < 12; m++) {
      const start = -Math.PI / 2 + m * monthSpan;
      const mid = start + monthSpan / 2;
      const x = Math.cos(mid) * labelR;
      const y = Math.sin(mid) * labelR;
      let deg = (mid * 180) / Math.PI + 90;
      if (deg > 90 && deg < 270) deg = (deg + 180) % 360;
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("transform", `translate(${x},${y}) rotate(${deg})`)
        .attr("fill", "rgba(36,48,94,0.55)")
        .attr("font-size", 11)
        .attr("letter-spacing", "0.16em")
        .text(monthNames[m]);
    }

    const order = ["1:1", "Event", "Creative Hang"];
    const stackData: any[] = [];
    for (const seg of segs) {
      const t = thickness(seg);
      let r0 = rBase;
      const total = Math.max(1, seg.total);
      for (const sType of order) {
        const frac = seg.counts[sType] / total;
        const r1 = r0 + frac * t;
        stackData.push({
          month: seg.month,
          subtype: sType,
          count: seg.counts[sType],
          total: seg.total,
          startAngle: seg.startAngle,
          endAngle: seg.endAngle,
          innerRadius: r0,
          outerRadius: r1,
        });
        r0 = r1;
      }
    }

    g.selectAll("path.seg")
      .data(stackData)
      .enter()
      .append("path")
      .attr("class", "seg")
      .attr("d", (d: any) => arc(d))
      .attr("fill", (d: any) => colors[d.subtype] || "#64748b")
      .attr("opacity", (d: any) => (d.count === 0 ? 0.08 : 0.9))
      .style("cursor", "pointer")
      .on("mousemove", (event: MouseEvent, d: any) => {
        tooltip.style.opacity = "1";
        tooltip.style.transform = "translateY(0px)";
        const label = `${monthNames[d.month]} 2025`;
        const share = d.total ? Math.round((d.count / d.total) * 100) : 0;
        tooltip.innerHTML = `<strong style="color:#24305E">${label}</strong><div style="color:#475569">${d.subtype}: ${d.count} (${share}%)</div><div style="color:#94a3b8">Total: ${d.total}</div>`;
        tooltip.style.left = `${event.clientX + 12}px`;
        tooltip.style.top = `${event.clientY + 12}px`;
      })
      .on("mouseleave", () => {
        tooltip.style.opacity = "0";
        tooltip.style.transform = "translateY(6px)";
      });

    g.append("circle").attr("r", rBase - 22).attr("fill", "#fff").attr("stroke", "rgba(166,176,200,0.55)").attr("stroke-width", 1);
    g.append("text").attr("text-anchor", "middle").attr("y", -6).style("font-size", "18px").style("font-weight", "750").style("fill", "#24305E").text("2025");
    g.append("text").attr("text-anchor", "middle").attr("y", 14).attr("fill", "rgba(36,48,94,0.55)").text("social calendar");

    return () => {
      container.innerHTML = "";
    };
  }, [d3Ready]);


  useEffect(() => {
    if (!plotly || !distanceFullRef.current) return;

    const colors = {
      indigo: "#374785",
      sky: "#A8D0E6",
      bg: "#fff8ef",
      grid: "rgba(36,48,94,0.18)",
      axis: "rgba(36,48,94,0.35)",
    };

    const baseLayout = {
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      margin: { l: 52, r: 18, t: 12, b: 60 },
      font: { color: "#0f172a", size: 14 },
      xaxis: {
        gridcolor: "rgba(0,0,0,0)",
        linecolor: colors.axis,
        tickcolor: colors.axis,
        ticklen: 8,
        tickwidth: 2,
        tickangle: -90,
        tickformat: "%b",
        dtick: "M1",
        tickfont: { size: 12 },
      },
      yaxis: {
        gridcolor: colors.grid,
        zerolinecolor: colors.grid,
        linecolor: "rgba(0,0,0,0)",
        ticks: "outside",
        tickcolor: colors.axis,
        tickfont: { size: 12 },
      },
      hoverlabel: { bgcolor: colors.bg, bordercolor: colors.axis, font: { color: "#0f172a", size: 12 } },
    };

    const runs: StravaRun[] = (STRAVA_DATA.runs ?? []) as StravaRun[];
    const weekly: StravaWeek[] = (STRAVA_DATA.weekly ?? []) as StravaWeek[];

    const updateChart = (index: number) => {
      const step = steps[index] ?? steps[0];
      const startTs = new Date(step.state.start).getTime();
      const endTs = new Date(step.state.end).getTime();
      const inRange = (dateStr: string) => {
        const t = new Date(dateStr).getTime();
        return t >= startTs && t <= endTs;
      };

      const rFiltered = runs.filter((d) => inRange(d.date_str));
      const wFiltered = weekly.filter((d) => inRange(d.week_end_str));

      const rX = rFiltered.map((d) => d.date_str);
      const rMi = rFiltered.map((d) => d.mi);
      const rHover = rFiltered.map((d) => d.hover);
      const wX = wFiltered.map((d) => d.week_end_str);
      const wMi = wFiltered.map((d) => d.mi);

      plotly.react(
        distanceFullRef.current,
        [
          {
            type: "bar",
            x: rX,
            y: rMi,
            marker: { color: colors.indigo },
            hovertemplate: "%{text}<extra></extra>",
            text: rHover,
          },
          {
            type: "scatter",
            mode: "lines",
            x: wX,
            y: wMi,
            line: { color: colors.sky, width: 3, dash: "dot" },
            hovertemplate: "Week of %{x}<br>%{y:.1f} mi<extra></extra>",
          },
        ],
        { ...baseLayout, hovermode: "closest" },
        { displayModeBar: false, responsive: true },
      );
    };

    // Initial render + updates on step change
    updateChart(activeIndex);
  }, [activeIndex, plotly]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length === 0) return;
        const best = intersecting.reduce((prev, curr) =>
          curr.intersectionRatio > prev.intersectionRatio ? curr : prev,
        );
        const idx = Number(best.target.getAttribute("data-step-index"));
        if (Number.isNaN(idx)) return;
        setSeenSteps((prev) => (prev[idx] ? prev : { ...prev, [idx]: true }));
        setActiveIndex(idx);
      },
      {
        root: null,
        // Slightly tighter band so handoff happens later, enabling a smoother rise
        rootMargin: "-20% 0px -20% 0px",
        threshold: [0, 0.2, 0.4, 0.6, 0.8],
      },
    );

    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!prefersReducedMotion) return;
    const allSeen: Record<number, boolean> = {};
    steps.forEach((_, idx) => {
      allSeen[idx] = true;
    });
    setSeenSteps(allSeen);
  }, [prefersReducedMotion]);

  return (
    <div className="relative min-h-screen bg-[var(--sand-dune)] text-slate-900">
      {!isLoaded && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--sand-dune)]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: prefersReducedMotion ? 0 : 0.4 }}
          onAnimationComplete={() => setIsLoaded(true)}
        >
          <motion.div
            className="relative h-40 w-32 rounded-xl border-2 border-slate-900 bg-white shadow-[12px_12px_0px_#dd1c1a]"
            initial={{ rotate: -6, y: 12 }}
            animate={{ rotate: 0, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-3 rounded-lg bg-[repeating-linear-gradient(-45deg,rgba(0,0,0,0.06),rgba(0,0,0,0.06)_6px,transparent_6px,transparent_12px)]" />
            <p className="absolute bottom-4 left-4 text-sm font-semibold text-slate-800">Opening scrapbook…</p>
          </motion.div>
        </motion.div>
      )}

      <main className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-6 lg:px-10 snap-y snap-mandatory">
        <section
          className="relative min-h-screen snap-start overflow-hidden rounded-[36px] border border-slate-200/70 bg-[var(--sand-dune)] px-6 py-10 shadow-none"
        >
          <div className="mx-auto flex h-full min-h-[70vh] max-w-3xl flex-col justify-center gap-6 text-left">
            <h1 className="font-gambarino text-5xl leading-tight text-slate-900 sm:text-6xl">
              How I lived my life in 2025.
              </h1>
            <div className="max-w-xl space-y-4 text-lg leading-relaxed text-slate-800 sm:text-xl">
              <p className="font-gambarino text-slate-900">"the way you live your days is the way you live your life.”</p>
              <p className="font-satoshi">
                When I look back on a year, it’s easy to recall the big shifts—moving everything out of my childhood home,
                recruiting and switching jobs, moving cities. But it’s the repeated habits, day in and day out, that have
                driven me forward.
              </p>
            </div>
          </div>
        </section>

        {/* Sticky scrollytelling section */}
        <section className="scrolly relative isolate mx-auto w-full max-w-6xl rounded-[32px] border border-slate-200/70 bg-[var(--sand-dune)] px-4 py-8 shadow-none sm:px-6 lg:px-10">
          <div className="mb-6 flex flex-col gap-3 px-2 sm:px-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">How I ran</p>
            <h2 className="font-serif text-4xl sm:text-5xl text-slate-900">Miles, weeks, and seasons</h2>
        </div>
          <figure className="sticky top-0 z-0 flex h-screen items-center justify-center">
            <div className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-md shadow-slate-900/10">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Distance</p>
              <p className="text-xs text-slate-500">Per run bars + per week dotted line, miles. Scroll to see more!</p>
              <div className="mt-3">
                <div ref={distanceFullRef} className="h-[400px]" />
              </div>
            </div>
          </figure>

          <article className="relative z-10 -mt-[40vh] space-y-0 pb-0 pointer-events-none">
            {[steps[0], steps[1], steps[2]].map((step, idx) => {
              const isActive = activeIndex === idx;
              return (
                <div
                  key={step?.id ?? idx}
                  ref={(el) => {
                    stepRefs.current[idx] = el;
                  }}
                  data-step-index={idx}
                  className="step relative flex h-[150vh] items-start justify-end px-4 sm:px-8"
                >
                  <div
                    className={clsx(
                      "card pointer-events-auto sticky top-[35vh] w-full max-w-2xl rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-900/10 backdrop-blur transition-all duration-500 ease-out will-change-transform",
                      idx === 1
                        ? isActive
                          ? "opacity-100 translate-y-0 z-20"
                          : "opacity-0 translate-y-12 scale-[0.97] pointer-events-none z-0"
                        : isActive
                          ? "opacity-100 translate-x-0 z-20"
                          : "opacity-0 translate-x-12 scale-[0.97] pointer-events-none z-0",
                      prefersReducedMotion ? "transition-none opacity-100 translate-y-0 translate-x-0" : "",
                    )}
                    style={{ marginLeft: "auto", marginRight: "auto" }}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <p className="mt-1 text-lg font-semibold text-slate-900">{step?.title ?? ""}</p>
                    <p className="mt-3 text-sm text-slate-700 leading-relaxed">{step?.body ?? ""}</p>
                  </div>
                </div>
              );
            })}
          </article>

        </section>

        <WhatsInMyBag prefersReducedMotion={prefersReducedMotion} />

        <section className="relative isolate mx-auto w-full max-w-6xl rounded-[32px] border border-slate-200/70 bg-[var(--sand-dune)] px-0 pb-8 shadow-none">
          <div className="px-6 pt-8 pb-6 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Bookmarks</p>
            <h2 className="mt-1 font-serif text-3xl sm:text-4xl text-slate-900">What I read on the internet</h2>
            <p className="mt-3 max-w-3xl text-base text-slate-700 leading-relaxed">
              I scrolled the internet, religiously. I like to read about the very big — large-scale infra projects,
              the history of Tokyo&apos;s neighborhoods — as well as abstract interiority — how writing feeds into our sense of belonging
              and the like.
            </p>
          </div>
          <iframe
            title="Bookmark Quadrant Map"
            src={withBase("/bookmark-map.html")}
            loading="lazy"
            className="h-[82vh] min-h-[640px] w-full"
            style={{ background: "var(--sand-dune)" }}
            onLoad={(e) => {
              const doc = e.currentTarget.contentDocument;
              if (!doc) return;
              const style = doc.createElement("style");
              style.textContent = `
                :root {
                  --bg: #fff8ef;
                  --panel: #fff8ef;
                  --text: #0f172a;
                  --muted: #334155;
                  --grid: rgba(15,23,42,0.08);
                  --axis: rgba(15,23,42,0.14);
                  --accent: #0f4c81;
                }
                html, body, #__next, #root {
                  background: var(--bg) !important;
                }
                main, .container, .panel, .card, .wrapper, .page, .content, .layout {
                  background: var(--bg) !important;
                }
                .controls, .toolbar, header, nav, .topbar {
                  background: rgba(255,248,239,0.95) !important;
                  box-shadow: none !important;
                  backdrop-filter: none !important;
                  -webkit-backdrop-filter: none !important;
                }
                .search, .search input, input, textarea {
                  background: #ffffff !important;
                  border-color: rgba(15,23,42,0.18) !important;
                }
                /* Tooltips / labels */
                .tooltip, .popover, .annotation, .legend, .card {
                  background: rgba(255,248,239,0.96) !important;
                  color: var(--text) !important;
                  border-color: rgba(15,23,42,0.14) !important;
                  box-shadow: 0 16px 32px rgba(15,23,42,0.18) !important;
                }
                .tooltip *, .popover *, .annotation *, .card * {
                  color: var(--text) !important;
                }
                a, a * {
                  color: var(--accent) !important;
                }
              `;
              doc.head.appendChild(style);
            }}
          />
        </section>

        <SectionShell
          eyebrow=""
          title=""
          background="bg-[var(--sand-dune)] text-slate-900"
          bleed
          noShadow
          noBorder
        >
          <div
            ref={socialCalendarRef}
            className="w-full bg-[var(--sand-dune)] p-4 shadow-none"
            style={{ minHeight: "720px" }}
          >
            <div className="mb-4 flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Social calendar</p>
              <h2 className="font-serif text-3xl sm:text-4xl text-slate-900">How I spent my time</h2>
              <p className="max-w-3xl text-base text-slate-700 leading-relaxed">
              GCal girlie for life. 1:1 hangs fuel me, creative hangs inspire me, and large events push me out of my comfort zone. 
              </p>
            </div>
            <div data-social-chart className="relative min-h-[640px]"></div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: "#A8D0E6" }} />
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-600">1:1</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: "#F76C6C" }} />
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-600">Event</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: "#24305E" }} />
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-600">Creative Hang</span>
              </div>
            </div>
          </div>
        </SectionShell>

        <section className="relative isolate mx-auto w-full max-w-6xl rounded-[32px] border border-slate-200/70 bg-[var(--sand-dune)] px-4 py-12 shadow-none sm:px-6 lg:px-10">
          {(() => {
            const evt = hostedEvents.find((e) => e.type === activeHostedType) ?? hostedEvents[0];
            return (
            <div key={evt.id} className="grid gap-6 lg:grid-cols-2 items-start">
              <div className="overflow-hidden rounded-3xl bg-white/0">
                <img
                  src={withBase(evt.image)}
                  alt={evt.title}
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: "70vh" }}
                />
              </div>
              <div className="flex h-full flex-col gap-3 self-start lg:pl-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">{evt.type}</p>
                <h3 className="font-serif text-3xl text-slate-900">{evt.title}</h3>
                <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-line">{evt.description}</p>
                <div className="mt-auto flex justify-end gap-2">
                  {(["writing", "photo", "fun"] as HostedEvent["type"][]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setActiveHostedType(t)}
                      className={clsx(
                        "rounded-full border px-3 py-1 text-sm font-semibold capitalize transition",
                        activeHostedType === t
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white/80 text-slate-700 hover:border-slate-400",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            );
          })()}
        </section>

      </main>
    </div>
  );
}
