import React from 'react';
import Image from 'next/image';
import Search from './Search';

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="relative flex flex-col items-center pt-18 pb-0 px-6 w-full rounded-b-[4rem] shadow-2xl min-h-105 overflow-visible"
        style={{
          background: 'var(--gradient-primary)',
    backgroundSize: '400% 400%',
        }}
      >
        <div className="relative z-10 flex flex-col items-center w-full max-w-5xl text-center">

          <p className="text-white text-[11px] md:text-[23px] font-medium mb-5 tracking-wide opacity-90">
            EcoSwaech Marketplace. Find your EV. Charge your EV
          </p>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
            <span className="text-white">Find Your </span>
            <span className="gradient-text">
              EV Here
            </span>
          </h1>

          {/* Search bar */}
          <Search />

          {/* CTAs */}
          <div className="flex items-center gap-4 mb-8 flex-wrap justify-center">
            <button className="px-5 py-2 bg-white/10 border border-white/20 text-white text-[11px] font-bold rounded-full backdrop-blur-md hover:bg-white/20 transition-all">
              Businesses & Partnerships
            </button>
            <button className="btn-secondary text-[11px] rounded-full">
              Dealers
            </button>
          </div>
        </div>

        {/* Car image — reduced height, same overlap effect */}
        <div className="relative w-full max-w-4xl h-45 md:h-70 mt-auto transform translate-y-16 z-20">
          <Image
            src="/tesla.png"
            alt="Tesla Model S"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 56rem"
            className="object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
          />
        </div>
      </div>

      {/* Spacer matches translate-y-16 = 4rem */}
      <div className="h-16" />
    </section>
  );
}