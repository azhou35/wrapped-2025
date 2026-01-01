"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  interpolateOrRd,
  interpolateTurbo,
  max,
  scaleBand,
  scaleLinear,
  scalePoint,
  scaleSequential,
  stack,
} from "d3";

type MonthlyDatum = { month: string; miles: number; runs: number };
type BucketDatum = { bucket: string; count: number };
type GenreDatum = { genre: string; count: number };
type StreakDatum = { label: string; value: number };
type RhythmDatum = { day: string; morning: number; midday: number; evening: number };

type StackedDatum = {
  month: string;
  correspondents: Record<string, number>;
};

const spring = { type: "spring", stiffness: 120, damping: 22 } as const;

export function MonthlyBarChart({
  data,
  mode,
  accent = "#ef4444",
  height = 260,
  reducedMotion = false,
}: {
  data: MonthlyDatum[];
  mode: "miles" | "runs";
  accent?: string;
  height?: number;
  reducedMotion?: boolean;
}) {
  const width = data.length * 34 + 60;
  const x = useMemo(
    () => scaleBand<string>().domain(data.map((d) => d.month)).range([40, width - 12]).padding(0.22),
    [data, width],
  );
  const maxVal = useMemo(() => max(data, (d) => (mode === "miles" ? d.miles : d.runs)) ?? 1, [data, mode]);
  const y = useMemo(() => scaleLinear().domain([0, maxVal]).nice().range([height - 30, 16]), [height, maxVal]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
      <g>
        {y.ticks(4).map((tick) => (
          <g key={tick}>
            <line x1={32} x2={width - 12} y1={y(tick)} y2={y(tick)} className="stroke-slate-200" />
            <text x={12} y={y(tick) + 4} className="fill-slate-500 text-[10px] font-semibold">
              {tick}
            </text>
          </g>
        ))}
      </g>
      {data.map((d, idx) => {
        const value = mode === "miles" ? d.miles : d.runs;
        const hueShift = (idx / data.length) * 18;
        return (
          <motion.rect
            key={d.month}
            x={x(d.month)}
            width={x.bandwidth()}
            y={y(value)}
            height={y(0) - y(value)}
            rx={6}
            fill={accent}
            style={{ filter: `hue-rotate(${hueShift}deg)` }}
            initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : y(0) }}
            whileInView={{ opacity: 1, y: y(value) }}
            transition={reducedMotion ? undefined : { ...spring, delay: idx * 0.02 }}
          />
        );
      })}
      <g>
        {data.map((d) => (
          <text
            key={d.month}
            x={(x(d.month) ?? 0) + x.bandwidth() / 2}
            y={height - 6}
            className="fill-slate-700 text-[10px] font-semibold"
            textAnchor="middle"
          >
            {d.month}
          </text>
        ))}
      </g>
    </svg>
  );
}

export function StreakHeatmap({
  data,
  height = 160,
  reducedMotion = false,
}: {
  data: StreakDatum[];
  height?: number;
  reducedMotion?: boolean;
}) {
  const columns = Math.ceil(data.length / 4);
  const cell = 28;
  const width = columns * cell + 30;
  const maxVal = max(data, (d) => d.value) ?? 1;
  const color = scaleSequential([0, maxVal], interpolateOrRd);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
      {data.map((d, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const x = 16 + col * cell;
        const y = 12 + row * cell;
        return (
          <motion.g key={d.label} initial={{ opacity: reducedMotion ? 1 : 0 }} whileInView={{ opacity: 1 }} transition={{ delay: index * 0.03 }}>
            <rect x={x} y={y} width={cell - 8} height={cell - 8} rx={6} fill={color(d.value)} className="stroke-white/80" />
            <text x={x + (cell - 8) / 2} y={y + cell - 14} textAnchor="middle" className="fill-slate-800 text-[9px] font-semibold">
              {d.value}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}

export function GenreBarChart({
  data,
  height = 220,
  reducedMotion = false,
}: {
  data: GenreDatum[];
  height?: number;
  reducedMotion?: boolean;
}) {
  const width = 360;
  const maxVal = max(data, (d) => d.count) ?? 1;
  const x = scaleLinear([0, maxVal], [0, width - 120]);
  const y = scaleBand()
    .domain(data.map((d) => d.genre))
    .range([10, height - 30])
    .padding(0.3);
  const color = scaleSequential([0, maxVal], interpolateTurbo);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
      {data.map((d, idx) => (
        <motion.g key={d.genre} initial={{ opacity: reducedMotion ? 1 : 0 }} whileInView={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}>
          <rect
            x={120}
            y={y(d.genre)}
            width={x(d.count)}
            height={y.bandwidth()}
            rx={8}
            fill={color(d.count)}
            className="shadow-sm shadow-slate-900/10"
          />
          <text x={0} y={(y(d.genre) ?? 0) + y.bandwidth() / 2 + 4} className="fill-slate-800 text-[12px] font-semibold">
            {d.genre}
          </text>
          <text x={120 + x(d.count) + 8} y={(y(d.genre) ?? 0) + y.bandwidth() / 2 + 4} className="fill-slate-600 text-[11px]">
            {d.count}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}

export function HistogramChart({
  data,
  height = 240,
  accent = "#0ea5e9",
  reducedMotion = false,
}: {
  data: BucketDatum[];
  height?: number;
  accent?: string;
  reducedMotion?: boolean;
}) {
  const width = data.length * 64 + 40;
  const x = scaleBand()
    .domain(data.map((d) => d.bucket))
    .range([20, width - 12])
    .padding(0.3);
  const maxVal = max(data, (d) => d.count) ?? 1;
  const y = scaleLinear([0, maxVal], [height - 30, 12]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
      {data.map((d, idx) => (
        <motion.g key={d.bucket} initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : y(0) }} whileInView={{ opacity: 1, y: 0 }} transition={reducedMotion ? undefined : { ...spring, delay: idx * 0.04 }}>
          <rect
            x={x(d.bucket)}
            y={y(d.count)}
            width={x.bandwidth()}
            height={y(0) - y(d.count)}
            rx={10}
            fill={accent}
            className="shadow-md shadow-slate-900/10"
          />
          <text x={(x(d.bucket) ?? 0) + x.bandwidth() / 2} y={y(d.count) - 6} textAnchor="middle" className="fill-slate-700 text-[11px] font-semibold">
            {d.count}
          </text>
          <text x={(x(d.bucket) ?? 0) + x.bandwidth() / 2} y={height - 8} textAnchor="middle" className="fill-slate-800 text-[11px] font-semibold">
            {d.bucket}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}

export function StackedBarChart({
  data,
  keys,
  height = 260,
  palette,
  reducedMotion = false,
}: {
  data: StackedDatum[];
  keys: string[];
  height?: number;
  palette: string[];
  reducedMotion?: boolean;
}) {
  const width = data.length * 42 + 60;
  const stackedInput = data.map((d) => ({ ...d.correspondents, month: d.month }));
  const stackGen = stack().keys(keys);
  const series = useMemo(() => stackGen(stackedInput), [stackGen, stackedInput]);
  const maxVal = max(stackedInput, (d) => Object.values(d).reduce((sum, val) => (typeof val === "number" ? sum + val : sum), 0)) ?? 1;
  const y = scaleLinear([0, maxVal], [height - 28, 12]);
  const x = scaleBand()
    .domain(data.map((d) => d.month))
    .range([40, width - 12])
    .padding(0.22);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
      {series.map((layer, layerIdx) => (
        <g key={layer.key} fill={palette[layerIdx % palette.length]}>
          {layer.map((segment, idx) => {
            const [y0, y1] = segment;
            return (
              <motion.rect
                key={`${layer.key}-${data[idx].month}`}
                x={x(data[idx].month)}
                width={x.bandwidth()}
                y={y(y1)}
                height={Math.max(1, y(y0) - y(y1))}
                rx={6}
                initial={{ opacity: reducedMotion ? 1 : 0 }}
                whileInView={{ opacity: 1 }}
                transition={reducedMotion ? undefined : { delay: idx * 0.02 }}
              />
            );
          })}
        </g>
      ))}
      <g>
        {data.map((d) => (
          <text
            key={d.month}
            x={(x(d.month) ?? 0) + x.bandwidth() / 2}
            y={height - 6}
            textAnchor="middle"
            className="fill-slate-800 text-[10px] font-semibold"
          >
            {d.month}
          </text>
        ))}
      </g>
    </svg>
  );
}

export function RhythmGrid({
  data,
  height = 220,
}: {
  data: RhythmDatum[];
  height?: number;
}) {
  const width = 520;
  const y = scaleBand()
    .domain(data.map((d) => d.day))
    .range([16, height - 16])
    .padding(0.2);
  const x = scalePoint()
    .domain(["morning", "midday", "evening"])
    .range([80, width - 40]);
  const maxVal =
    max(data, (d) => Math.max(d.morning, d.midday, d.evening)) ?? 1;
  const color = scaleSequential([0, maxVal], interpolateTurbo);

  const slots: Array<{ day: string; slot: string; value: number }> = [];
  data.forEach((d) => {
    slots.push({ day: d.day, slot: "morning", value: d.morning });
    slots.push({ day: d.day, slot: "midday", value: d.midday });
    slots.push({ day: d.day, slot: "evening", value: d.evening });
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
      {slots.map((slot, idx) => (
        <motion.circle
          key={`${slot.day}-${slot.slot}`}
          cx={x(slot.slot) ?? 0}
          cy={(y(slot.day) ?? 0) + y.bandwidth() / 2}
          r={Math.max(6, slot.value * 2.2)}
          fill={color(slot.value)}
          className="opacity-90"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.01, type: "spring", stiffness: 160, damping: 20 }}
        />
      ))}
      {data.map((d) => (
        <text key={d.day} x={12} y={(y(d.day) ?? 0) + y.bandwidth() / 2 + 4} className="fill-slate-800 text-[12px] font-semibold">
          {d.day}
        </text>
      ))}
      {["morning", "midday", "evening"].map((slot) => (
        <text key={slot} x={x(slot) ?? 0} y={12} textAnchor="middle" className="fill-slate-600 text-[11px] font-semibold uppercase tracking-[0.1em]">
          {slot}
        </text>
      ))}
    </svg>
  );
}
