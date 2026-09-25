"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calculator,
  Layers,
  Sun,
  Waves,
  Flame,
  Fish,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  ChevronDown,
  Sliders,
} from "lucide-react";

/**
 * Interactive Aquascape Equipment & Substrate Planner.
 *
 * Computes essential planted aquarium metrics: gross and net water volume (accounting for
 * displacement from stones, wood, and soil), substrate requirement in standard bags (3L and 9L),
 * canister filter flow turnover (6x-8x net volume), LED lighting output (lumens/watts based on
 * low-tech vs high-tech plant needs), CO2 injection rates (BPS), and safe livestock bioload limits.
 */
interface TankPreset {
  id: string;
  name: string;
  category: string;
  length: number;
  width: number;
  height: number;
  description: string;
}

const TANK_PRESETS: TankPreset[] = [
  {
    id: "30c",
    name: "Nano Cube 30C",
    category: "Nano & Desktop",
    length: 30,
    width: 30,
    height: 30,
    description: "Compact cube for shrimp, nano fish, and desktop moss scapes.",
  },
  {
    id: "45p",
    name: "Standard 45P",
    category: "Small Nature",
    length: 45,
    width: 27,
    height: 30,
    description: "Ideal beginner size for Iwagumi stone formations.",
  },
  {
    id: "60p",
    name: "Golden Standard 60P",
    category: "The Classic Scape",
    length: 60,
    width: 30,
    height: 36,
    description: "The world's most popular contest size with perfect golden ratio proportions.",
  },
  {
    id: "90p",
    name: "Nature Aquarium 90P",
    category: "Medium Exhibition",
    length: 90,
    width: 45,
    height: 45,
    description: "Generous depth for dramatic driftwood root arrangements and stem plants.",
  },
  {
    id: "120p",
    name: "Showpiece 120P",
    category: "Large Showpiece",
    length: 120,
    width: 50,
    height: 50,
    description: "Exhibition gallery centerpiece designed for schooling fish and deep forests.",
  },
];

export default function TankCalculatorView() {
  const [selectedPreset, setSelectedPreset] = useState<string>("60p");
  const [length, setLength] = useState<number>(60);
  const [width, setWidth] = useState<number>(30);
  const [height, setHeight] = useState<number>(36);

  // Substrate slope configuration (front to back depth)
  const [frontSubstrateDepth, setFrontSubstrateDepth] = useState<number>(3); // cm
  const [backSubstrateDepth, setBackSubstrateDepth] = useState<number>(7); // cm

  // Plant High-Tech vs Low-Tech Target
  const [plantType, setPlantType] = useState<"high-tech" | "low-tech">("high-tech");

  // Tab switcher for mobile & desktop settings ("presets" vs "substrate")
  const [activeSettingsTab, setActiveSettingsTab] = useState<"presets" | "substrate">("presets");

  const handleSelectPreset = (preset: TankPreset) => {
    setSelectedPreset(preset.id);
    setLength(preset.length);
    setWidth(preset.width);
    setHeight(preset.height);
  };

  const handleCustomDimension = (l: number, w: number, h: number) => {
    setSelectedPreset("custom");
    setLength(l);
    setWidth(w);
    setHeight(h);
  };

  /**
   * Derives aquarium equipment specifications and physical capacities:
   * - Substrate volume: accounts for front-to-back perspective slope.
   * - Net water volume: subtracts ~18-40% displacement caused by glass thickness,
   *   hardscape rocks/driftwood, and aqua soil.
   * - Canister filter turnover: planted tanks require 6x-8x hourly turnover for clean CO2/nutrient delivery.
   * - Lighting intensity: low-tech (~25 lm/L) vs high-tech (~45 lm/L) plant photon demand.
   * - CO2 bubble rate: scales by water volume to maintain 20-30 ppm dissolved CO2 safely.
   */
  const metrics = useMemo(() => {
    // Gross water volume from internal tank dimensions (1000 cm³ = 1 Liter)
    const grossLiters = (length * width * height) / 1000;
    const grossGallons = grossLiters * 0.264172;

    // Substrate volume averaging front & back slope, calculating kg (~1.15 kg/L) and 9L/3L bag packaging
    const avgSubstrateDepth = (frontSubstrateDepth + backSubstrateDepth) / 2;
    const substrateLiters = Math.round(((length * width * avgSubstrateDepth) / 1000) * 10) / 10;
    const substrateWeightKg = Math.round(substrateLiters * 1.15 * 10) / 10;
    const soil9LBags = Math.ceil(substrateLiters / 9);
    const soil3LBags = Math.ceil(substrateLiters / 3);

    // Net water volume deducting displacement from glass, hardscape rocks/driftwood (~18%), and aqua soil
    const netWaterLiters = Math.max(
      Math.round(grossLiters * 0.82 - substrateLiters * 0.4),
      Math.round(grossLiters * 0.6)
    );

    // Canister filtration turnover: 6x minimum to 8x ideal hourly flow (L/h) to distribute CO2 and nutrients
    const minFilterFlow = Math.round(netWaterLiters * 6);
    const idealFilterFlow = Math.round(netWaterLiters * 8);

    // Lighting intensity: low-tech (~25 lm/L) vs high-tech (~45 lm/L) plant photon demand
    const lumensMultiplier = plantType === "high-tech" ? 45 : 25;
    const recommendedLumens = Math.round(netWaterLiters * lumensMultiplier);
    const recommendedWatts = Math.round(netWaterLiters * (plantType === "high-tech" ? 0.65 : 0.35));

    // CO2 injection rate recommendations in Bubbles Per Second (BPS) scaled to tank capacity
    let co2Recommendation = "0.5 BPS (1 bubble / 2 sec)";
    if (netWaterLiters >= 150) {
      co2Recommendation = "3 - 5 BPS (Inline Diffuser)";
    } else if (netWaterLiters >= 80) {
      co2Recommendation = "2 - 3 BPS";
    } else if (netWaterLiters >= 40) {
      co2Recommendation = "1 - 2 BPS";
    }

    // Aquarium heater wattage sized at approximately 1 Watt per liter of water
    let heaterWatts = 50;
    if (grossLiters > 250) heaterWatts = 300;
    else if (grossLiters > 150) heaterWatts = 200;
    else if (grossLiters > 80) heaterWatts = 150;
    else if (grossLiters > 40) heaterWatts = 100;

    // Safe biological stocking capacity: 2.5L per small fish and 1.5 dwarf shrimp per liter
    const maxFishCount = Math.floor(netWaterLiters / 2.5);
    const maxShrimpCount = Math.floor(netWaterLiters * 1.5);

    return {
      grossLiters: Math.round(grossLiters * 10) / 10,
      grossGallons: Math.round(grossGallons * 10) / 10,
      netWaterLiters,
      substrateLiters,
      substrateWeightKg,
      soil9LBags,
      soil3LBags,
      minFilterFlow,
      idealFilterFlow,
      recommendedLumens,
      recommendedWatts,
      co2Recommendation,
      heaterWatts,
      maxFishCount,
      maxShrimpCount,
    };
  }, [length, width, height, frontSubstrateDepth, backSubstrateDepth, plantType]);

  return (
    <div className="mx-auto max-w-container px-edge-margin-mobile pb-24 pt-24 md:px-edge-margin-desktop">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
          <Calculator size={15} />
          <span>Interactive Aquascaping Tool</span>
        </div>
        <h1 className="mt-3 font-display text-display-md font-bold text-on-surface">
          Aquascape Tank &amp; Substrate Calculator
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">
          Accurately calculate tank water volume, substrate bags requirement, canister filter turnover flow, LED lighting PAR/lumens, and CO2 injection rates for your dream scape.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Controls & Input Parameters */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl bg-background-white p-5 sm:p-6 shadow-soft border border-outline-variant/60">
            {/* Tab Switcher Header */}
            <div className="flex rounded-xl bg-surface-container-high/60 p-1 mb-5 border border-outline-variant/40">
              <button
                type="button"
                onClick={() => setActiveSettingsTab("presets")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  activeSettingsTab === "presets"
                    ? "bg-background-white text-primary shadow-xs ring-1 ring-black/5"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Sliders size={14} />
                <span>Standard Presets</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSettingsTab("substrate")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  activeSettingsTab === "substrate"
                    ? "bg-background-white text-primary shadow-xs ring-1 ring-black/5"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Layers size={14} />
                <span>Substrate &amp; Plant</span>
              </button>
            </div>

            {/* TAB 1: Standard Preset Tanks */}
            {activeSettingsTab === "presets" && (
              <div className="flex flex-col justify-between min-h-[360px] animate-in fade-in duration-200">
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1.5 flex items-center justify-between">
                      <span>1. Standard Tank Preset</span>
                      <span className="text-[10px] font-mono text-primary font-bold">
                        {selectedPreset !== "custom" ? `${length} × ${width} × ${height} cm` : "Custom"}
                      </span>
                    </label>
                    
                    {/* Compacted Dropdown */}
                    <div className="relative">
                      <select
                        value={selectedPreset}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "custom") {
                            setSelectedPreset("custom");
                          } else {
                            const preset = TANK_PRESETS.find((p) => p.id === val);
                            if (preset) handleSelectPreset(preset);
                          }
                        }}
                        className="w-full appearance-none rounded-lg border border-outline-variant/80 bg-surface-container-low px-3.5 py-2.5 pr-10 text-xs font-bold text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                      >
                        {TANK_PRESETS.map((preset) => (
                          <option key={preset.id} value={preset.id}>
                            {preset.name} — {preset.length} × {preset.width} × {preset.height} cm ({preset.category})
                          </option>
                        ))}
                        <option value="custom">✏️ Custom Dimensions...</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-3 text-on-surface-variant"
                      />
                    </div>
                  </div>

                  {/* Selected Preset Info Card / Custom Dimension Helper */}
                  {selectedPreset !== "custom" ? (
                    <div className="rounded-lg bg-primary/5 border border-primary/15 p-2.5 text-xs">
                      <div className="flex items-center justify-between font-bold text-primary text-[11px] mb-0.5">
                        <span>{TANK_PRESETS.find((p) => p.id === selectedPreset)?.category}</span>
                        <span className="font-mono bg-primary/10 px-2 py-0.5 rounded-full">
                          {length} × {width} × {height} cm
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">
                        {TANK_PRESETS.find((p) => p.id === selectedPreset)?.description}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs">
                      <div className="flex items-center justify-between font-bold text-amber-900 text-[11px] mb-0.5">
                        <span>Custom Tank Sizing</span>
                        <span className="font-mono bg-amber-500/20 px-2 py-0.5 rounded-full">
                          {length} × {width} × {height} cm
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-900/80 leading-relaxed">
                        Specify custom tank dimensions below. Calculations update in real-time.
                      </p>
                    </div>
                  )}

                  {/* Custom Dimension Inputs */}
                  <div className="border-t border-outline-variant/60 pt-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                        Dimensions (Panjang × Lebar × Tinggi)
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-on-surface-variant mb-1">
                          Length (P)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min={10}
                            max={300}
                            value={length}
                            onChange={(e) => handleCustomDimension(Number(e.target.value) || 10, width, height)}
                            className="w-full rounded-md border border-outline-variant bg-surface-container-low px-2 py-1.5 text-xs font-mono font-bold text-on-surface focus:border-primary focus:outline-none"
                          />
                          <span className="absolute right-2 top-1.5 text-[10px] text-gray-400">cm</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-on-surface-variant mb-1">
                          Width (L)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min={10}
                            max={200}
                            value={width}
                            onChange={(e) => handleCustomDimension(length, Number(e.target.value) || 10, height)}
                            className="w-full rounded-md border border-outline-variant bg-surface-container-low px-2 py-1.5 text-xs font-mono font-bold text-on-surface focus:border-primary focus:outline-none"
                          />
                          <span className="absolute right-2 top-1.5 text-[10px] text-gray-400">cm</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-on-surface-variant mb-1">
                          Height (T)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min={10}
                            max={200}
                            value={height}
                            onChange={(e) => handleCustomDimension(length, width, Number(e.target.value) || 10)}
                            className="w-full rounded-md border border-outline-variant bg-surface-container-low px-2 py-1.5 text-xs font-mono font-bold text-on-surface focus:border-primary focus:outline-none"
                          />
                          <span className="absolute right-2 top-1.5 text-[10px] text-gray-400">cm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Next Tab Switcher Button */}
                <button
                  type="button"
                  onClick={() => setActiveSettingsTab("substrate")}
                  className="w-full mt-4 flex items-center justify-between rounded-lg bg-surface-container-low border border-outline-variant/60 px-3.5 py-2.5 text-xs font-bold text-on-surface hover:bg-surface-container hover:text-primary transition-all"
                >
                  <span>Configure Substrate Slope &amp; Plants</span>
                  <ArrowRight size={14} className="text-primary" />
                </button>
              </div>
            )}

            {/* TAB 2: Substrate Slope & Plant Target */}
            {activeSettingsTab === "substrate" && (
              <div className="flex flex-col justify-between min-h-[360px] animate-in fade-in duration-200">
                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-on-surface font-bold">2. Front Substrate Depth:</span>
                      <span className="font-mono font-bold text-primary">{frontSubstrateDepth} cm</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={6}
                      step={0.5}
                      value={frontSubstrateDepth}
                      onChange={(e) => setFrontSubstrateDepth(parseFloat(e.target.value))}
                      className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] text-on-surface-variant">Recommended: 3 - 4 cm for carpet plants.</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-on-surface font-bold">Back Substrate Depth (Slope):</span>
                      <span className="font-mono font-bold text-primary">{backSubstrateDepth} cm</span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={15}
                      step={0.5}
                      value={backSubstrateDepth}
                      onChange={(e) => setBackSubstrateDepth(parseFloat(e.target.value))}
                      className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] text-on-surface-variant">Creates depth perception and room for deep stem roots.</span>
                  </div>

                  {/* Plant Level Segmented Control */}
                  <div className="border-t border-outline-variant/60 pt-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
                      Planted Ecosystem Target
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPlantType("high-tech")}
                        className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-left ${
                          plantType === "high-tech"
                            ? "border-primary bg-primary/10 text-primary shadow-xs"
                            : "border-outline-variant/60 bg-surface-container-low text-on-surface hover:bg-surface-container"
                        }`}
                      >
                        <p className="font-bold text-[11px]">High-Tech Planted</p>
                        <p className="text-[9px] font-normal text-on-surface-variant mt-0.5 line-clamp-2">
                          CO2, High Light, Rotala / Monte Carlo
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPlantType("low-tech")}
                        className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-left ${
                          plantType === "low-tech"
                            ? "border-primary bg-primary/10 text-primary shadow-xs"
                            : "border-outline-variant/60 bg-surface-container-low text-on-surface hover:bg-surface-container"
                        }`}
                      >
                        <p className="font-bold text-[11px]">Low-Tech Natural</p>
                        <p className="text-[9px] font-normal text-on-surface-variant mt-0.5 line-clamp-2">
                          No CO2, Moderate Light, Anubias / Moss
                        </p>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Prev Tab Switcher Button */}
                <button
                  type="button"
                  onClick={() => setActiveSettingsTab("presets")}
                  className="w-full mt-4 flex items-center justify-between rounded-lg bg-surface-container-low border border-outline-variant/60 px-3.5 py-2.5 text-xs font-bold text-on-surface hover:bg-surface-container hover:text-primary transition-all"
                >
                  <span>← Back to Tank Dimensions</span>
                  <span className="font-mono text-[10px] text-primary">{length}×{width}×{height}cm</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Calculations & Engineering Results */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Specs Highlight Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-primary p-4 text-on-primary shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">
                Gross Volume
              </span>
              <p className="mt-1 font-mono text-2xl font-black">{metrics.grossLiters} L</p>
              <p className="text-[11px] opacity-80">{metrics.grossGallons} US Gal</p>
            </div>

            <div className="rounded-xl bg-background-white p-4 shadow-soft border border-outline-variant/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Net Water Volume
              </span>
              <p className="mt-1 font-mono text-2xl font-black text-primary">~{metrics.netWaterLiters} L</p>
              <p className="text-[11px] text-gray-500">Excl. hardscape & soil</p>
            </div>

            <div className="rounded-xl bg-background-white p-4 shadow-soft border border-outline-variant/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Aqua Soil Volume
              </span>
              <p className="mt-1 font-mono text-2xl font-black text-amber-800">{metrics.substrateLiters} L</p>
              <p className="text-[11px] text-gray-500">~{metrics.substrateWeightKg} kg Soil</p>
            </div>

            <div className="rounded-xl bg-background-white p-4 shadow-soft border border-outline-variant/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Filter Turnover
              </span>
              <p className="mt-1 font-mono text-2xl font-black text-emerald-700">{metrics.idealFilterFlow}</p>
              <p className="text-[11px] text-gray-500">Liters / hour (8x)</p>
            </div>
          </div>

          {/* Detailed Engineering Breakdown */}
          <div className="rounded-xl bg-background-white p-6 sm:p-8 shadow-soft space-y-6">
            <h3 className="font-display text-headline-sm font-bold text-on-surface flex items-center gap-2">
              <Sparkles size={20} className="text-primary" />
              <span>Aquascaping Requirements &amp; Equipment Guide</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Soil & Substrate Recommendation */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Layers size={18} />
                  <span>Substrate &amp; Soil Bags</span>
                </div>
                <div className="space-y-1 text-xs text-amber-950">
                  <p>
                    Required Soil: <strong>{metrics.substrateLiters} Liters</strong> ({metrics.substrateWeightKg} kg)
                  </p>
                  <p>
                    Option A: <strong>{metrics.soil9LBags} bag(s) of 9L Soil</strong> (e.g. ADA Amazonia / Platinum)
                  </p>
                  <p>
                    Option B: <strong>{metrics.soil3LBags} bag(s) of 3L Soil</strong>
                  </p>
                  <p className="text-[11px] text-amber-800/80 pt-1">
                    Tip: Add 1-2L of volcanic pumice / Power Sand at the base for anaerobic prevention.
                  </p>
                </div>
              </div>

              {/* Lighting */}
              <div className="rounded-xl border border-yellow-200 bg-yellow-50/50 p-5 space-y-2">
                <div className="flex items-center gap-2 text-yellow-900 font-bold text-sm">
                  <Sun size={18} />
                  <span>Lighting Specs ({plantType === "high-tech" ? "High PAR" : "Moderate"})</span>
                </div>
                <div className="space-y-1 text-xs text-yellow-950">
                  <p>
                    Target Output: <strong>{metrics.recommendedLumens} Lumens</strong>
                  </p>
                  <p>
                    Estimated LED Wattage: <strong>~{metrics.recommendedWatts} Watts</strong> (Full Spectrum WRGB)
                  </p>
                  <p>
                    Photoperiod: <strong>7 - 8 hours/day</strong> with electronic timer.
                  </p>
                </div>
              </div>

              {/* Filtration */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <Waves size={18} />
                  <span>Canister Filter Flow Rate</span>
                </div>
                <div className="space-y-1 text-xs text-emerald-950">
                  <p>
                    Minimum Flow Rate (6x): <strong>{metrics.minFilterFlow} L/h</strong>
                  </p>
                  <p>
                    Ideal Flow Rate (8x-10x): <strong>{metrics.idealFilterFlow} L/h</strong>
                  </p>
                  <p className="text-[11px] text-emerald-800/80 pt-1">
                    Use lily pipes to create gentle surface vortex for oxygen exchange without driving out CO2.
                  </p>
                </div>
              </div>

              {/* CO2 & Heater */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <Flame size={18} />
                  <span>CO2 &amp; Temperature Control</span>
                </div>
                <div className="space-y-1 text-xs text-blue-950">
                  <p>
                    Recommended CO2: <strong>{metrics.co2Recommendation}</strong>
                  </p>
                  <p>
                    Heater Power: <strong>{metrics.heaterWatts} Watts</strong> (Maintain 23°C - 26°C)
                  </p>
                  <p className="text-[11px] text-blue-800/80 pt-1">
                    Check drop checker color: Lime green indicates optimal 30 ppm CO2 level.
                  </p>
                </div>
              </div>
            </div>

            {/* Bioload & Stocking Guide */}
            <div className="rounded-xl bg-surface-container-low p-5 border border-outline-variant/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Fish size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Recommended Safe Bioload
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Up to <strong>{metrics.maxFishCount} schooling nano fish</strong> (Tetras/Rasboras) and <strong>{metrics.maxShrimpCount} dwarf shrimp</strong> (Neocaridina/Caridina).
                  </p>
                </div>
              </div>

              <Link
                href="/shop?category=fish"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-on-primary hover:bg-primary-container"
              >
                <span>Browse Live Stock</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Quick Link to Equipment Shop */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/60 pt-6">
              <p className="text-xs text-on-surface-variant">
                Need premium substrate, lights, or canister filters for this setup?
              </p>
              <div className="flex gap-2">
                <Link
                  href="/shop?category=equipment"
                  className="inline-flex items-center gap-1.5 rounded-md border border-outline-variant bg-background-white px-3.5 py-2 text-xs font-bold text-on-surface hover:bg-surface-container transition-colors"
                >
                  <ShoppingBag size={14} className="text-primary" />
                  <span>Shop Equipment</span>
                </Link>
                <Link
                  href="/shop?category=hardscape"
                  className="inline-flex items-center gap-1.5 rounded-md border border-outline-variant bg-background-white px-3.5 py-2 text-xs font-bold text-on-surface hover:bg-surface-container transition-colors"
                >
                  <span>Shop Hardscape</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
