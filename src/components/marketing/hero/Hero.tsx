"use client";

import React, { useState } from "react";
import Link from "next/link";

interface SliderSetting {
  id: number;
  settingName: string;
  title: string;
  description: string;
  deviceType: string;
  syncDataPayload: string;
  speedBenchmark: string;
  imageSrc: string;
}

const SLIDE_SETTINGS: SliderSetting[] = [
  {
    id: 1,
    settingName: "Setting 01 / Outdoor Street Market",
    title: "Mobile Android POS in Action",
    description:
      "Processing offline payments seamlessly during grid power blackouts.",
    deviceType: "Smartphone (Android/iOS)",
    syncDataPayload: "1.2 KB",
    speedBenchmark: "0.18s",
    imageSrc: "/images/hero-slider-retail.jpg",
  },
  {
    id: 2,
    settingName: "Setting 02 / Quick-Service Cafe",
    title: "High-Speed Counter Tablet Checkout",
    description:
      "Instant order processing with local offline receipt generation.",
    deviceType: "10-inch Low-Cost Android Tablet",
    syncDataPayload: "1.6 KB",
    speedBenchmark: "0.15s",
    imageSrc: "/images/hero-slider-cafe.jpg",
  },
  {
    id: 3,
    settingName: "Setting 03 / Multi-Location Storefront",
    title: "Centralized Desktop Inventory Node",
    description:
      "Multi-tenant stock control and user permissions across venues.",
    deviceType: "Standard Laptop / PC Terminal",
    syncDataPayload: "1.9 KB",
    speedBenchmark: "0.20s",
    imageSrc: "/images/hero-slider-multiunit.jpg",
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDE_SETTINGS.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + SLIDE_SETTINGS.length) % SLIDE_SETTINGS.length,
    );
  };

  const activeSetting = SLIDE_SETTINGS[currentSlide];

  return (
    <section className="relative bg-[#090A0F] text-[#F9FAFB] min-h-[90vh] flex items-center py-16 lg:py-24 px-4 sm:px-6 overflow-hidden">
      {/* Radial Glow Atmosphere (Option A Visual System) */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/4 w-96 h-96 bg-[#84CC16]/10 rounded-full blur-[120px] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-10 right-10 w-96 h-96 bg-[#84CC16]/5 rounded-full blur-[140px] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full">
        {/* Left Column: Copy Architecture & CTAs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#11131F] border border-[#1F2937] text-xs font-medium text-[#84CC16]">
            <span className="w-2 h-2 rounded-full bg-[#84CC16] animate-pulse" />
            <span>⚡ Built for Power Instability & Unstable Connectivity</span>
          </div>

          {/* H1 Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
            The Ultra-Fast, Zero-Downtime POS for Any Business.
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-[#9CA3AF] max-w-2xl leading-relaxed">
            Keep sales moving through power blackouts and internet drops. Run
            Zestry on your existing devices with zero upfront hardware costs,
            micro-payload data sync, and local data security.
          </p>

          {/* Dual Call-to-Action Group (Touch Targets >= 48 px) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Link
              href="/book-a-call"
              className="min-h-[48px] px-8 py-3 rounded-lg bg-[#84CC16] hover:bg-[#65A30D] text-[#090A0F] font-bold text-sm flex items-center justify-center transition-all shadow-[0_0_24px_rgba(132,204,22,0.3)] focus:outline-none focus:ring-2 focus:ring-[#84CC16] focus:ring-offset-2 focus:ring-offset-[#090A0F]"
            >
              Book a Call
            </Link>

            <Link
              href="/product"
              className="min-h-[48px] px-6 py-3 rounded-lg bg-[#11131F] hover:bg-[#1A1D2E] text-[#F9FAFB] border border-[#1F2937] font-semibold text-sm flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-[#1F2937]"
            >
              Explore Product Specs &rarr;
            </Link>
          </div>

          {/* Infrastructure Trust Metric Bar */}
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#1F2937] text-xs text-[#9CA3AF]">
            <div className="space-y-0.5">
              <span className="block font-bold text-[#F9FAFB] text-sm">
                100% Offline
              </span>
              <span>Full local transaction database</span>
            </div>
            <div className="space-y-0.5">
              <span className="block font-bold text-[#F9FAFB] text-sm">
                &lt; 2KB Payload
              </span>
              <span>Ultra-low data mobile sync</span>
            </div>
            <div className="space-y-0.5">
              <span className="block font-bold text-[#F9FAFB] text-sm">
                $0 CapEx
              </span>
              <span>BYOD on phone, tablet, or PC</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Setting Slider */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-2xl bg-[#11131F]/80 backdrop-blur-xl border border-[#1F2937] p-5 shadow-2xl space-y-4">
            {/* Live Operational Engine Status Header */}
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#84CC16]" />
                <span className="font-bold text-[#F9FAFB]">
                  Local Node Active
                </span>
              </div>
              <span className="text-[#84CC16] bg-[#84CC16]/10 px-2.5 py-1 rounded border border-[#84CC16]/20 font-mono text-[11px]">
                {activeSetting.speedBenchmark} Speed Benchmark
              </span>
            </div>

            {/* Slider Visual Card Display */}
            <div className="relative aspect-video rounded-lg bg-[#090A0F] border border-[#1F2937] overflow-hidden flex flex-col justify-between p-4 group">
              {/* Image Overlay Placeholder / Next.js Image Component */}
              <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#090A0F] via-[#090A0F]/60 to-transparent opacity-80" />

              {/* Optional: Uncomment when actual assets are present in public/ directory */}
              {/* <Image 
                    src={activeSetting.imageSrc} 
                    alt={activeSetting.title}
                    fill
                    className="object-cover z-0"
                  /> */}

              {/* Card Top Metadata */}
              <div className="relative z-10 flex justify-between items-center text-[11px] font-mono">
                <span className="text-[#84CC16] uppercase tracking-wider">
                  {activeSetting.settingName}
                </span>
                <span className="text-[#9CA3AF] bg-[#11131F] px-2 py-0.5 rounded border border-[#1F2937]">
                  Sync Payload: {activeSetting.syncDataPayload}
                </span>
              </div>

              {/* Card Bottom Description */}
              <div className="relative z-10 space-y-1">
                <h3 className="text-sm font-bold text-[#F9FAFB]">
                  {activeSetting.title}
                </h3>
                <p className="text-xs text-[#9CA3AF] leading-normal">
                  {activeSetting.description}
                </p>
                <div className="text-[11px] text-[#84CC16] font-medium pt-1">
                  Device: {activeSetting.deviceType}
                </div>
              </div>
            </div>

            {/* Interactive Controls & Slide Pagination Indicators */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                onClick={handlePrevSlide}
                aria-label="Previous Setting Slide"
                className="min-h-[44px] min-w-[44px] px-3 py-1.5 rounded bg-[#090A0F] border border-[#1F2937] hover:border-[#84CC16] text-[#9CA3AF] hover:text-[#F9FAFB] transition-all flex items-center justify-center focus:outline-none"
              >
                &larr; Prev
              </button>

              {/* Slide Dot Indicators */}
              <div className="flex items-center gap-2">
                {SLIDE_SETTINGS.map((setting, idx) => (
                  <button
                    key={setting.id}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all min-h-[44px] min-w-[12px] flex items-center justify-center ${
                      idx === currentSlide
                        ? "w-6 bg-[#84CC16]"
                        : "w-2.5 bg-[#1F2937]"
                    }`}
                  >
                    <span className="sr-only">Slide {idx + 1}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextSlide}
                aria-label="Next Setting Slide"
                className="min-h-[44px] min-w-[44px] px-3 py-1.5 rounded bg-[#090A0F] border border-[#1F2937] hover:border-[#84CC16] text-[#9CA3AF] hover:text-[#F9FAFB] transition-all flex items-center justify-center focus:outline-none"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
