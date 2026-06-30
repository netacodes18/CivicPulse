import React from "react";
import { ArrowRight, MapPin, Globe, Compass, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-charcoal font-sans selection:bg-sand selection:text-charcoal overflow-x-hidden">
      
      {/* 1. Hero Section (Split Layout) */}
      <section className="relative min-h-[calc(100vh-73px)] flex flex-col md:flex-row border-b border-charcoal/10">
        
        {/* Left Content Side */}
        <div className="flex-1 flex flex-col justify-between px-6 py-12 md:p-16 lg:p-24 bg-[#FDFBF7]">
          {/* Top Label */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-forest">
              stewardship project
            </span>
            <div className="w-8 h-px bg-forest/30"></div>
          </div>

          {/* Main Title & Action */}
          <div className="my-auto max-w-xl py-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-charcoal leading-[1.1] mb-8">
              stewarding <br />
              <span className="font-semibold italic text-forest">urban integrity</span>
            </h1>
            <p className="text-charcoal/70 text-sm md:text-base font-light leading-relaxed mb-10 max-w-md">
              A collaborative citizen platform for crowdsourcing municipal caretakers. Report neighborhood issues. Monitor spatial resolutions. Shape cleaner cities.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-forest hover:bg-charcoal text-sand hover:text-white px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <span>Report an Issue</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById("process");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
                className="border border-charcoal/20 hover:border-charcoal hover:bg-charcoal/5 px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300"
              >
                Learn Process
              </button>
            </div>
          </div>

          {/* Micro Geometric Accents Info */}
          <div className="flex items-center space-x-8 pt-6 border-t border-charcoal/10">
            <div>
              <span className="block text-xl font-bold tracking-tight">120+</span>
              <span className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold">active sectors</span>
            </div>
            <div className="w-px h-6 bg-charcoal/20"></div>
            <div>
              <span className="block text-xl font-bold tracking-tight">2.5k</span>
              <span className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold">resolved cases</span>
            </div>
          </div>
        </div>

        {/* Right Imagery Side */}
        <div className="flex-1 relative min-h-[400px] md:min-h-0 bg-charcoal">
          <img
            src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1296&auto=format&fit=crop"
            alt="Modern Indian concrete architecture"
            className="absolute inset-0 w-full h-full object-cover opacity-85 filter grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
          />
          {/* Muted green geometric overlay box */}
          <div className="absolute bottom-12 left-0 bg-forest text-sand p-8 max-w-sm border-l-4 border-sand shadow-2xl hidden lg:block">
            <span className="text-[9px] uppercase tracking-widest font-bold text-sage block mb-2">active projects</span>
            <h3 className="text-lg font-light tracking-wide text-white leading-snug">
              "restoring infrastructure harmony in public corridors."
            </h3>
          </div>
        </div>
      </section>

      {/* 2. Intro Statement Section */}
      <section className="px-6 py-24 md:py-32 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-sage block mb-4">our ethos</span>
          <h2 className="text-3xl sm:text-4xl font-light text-charcoal tracking-tight leading-snug max-w-2xl">
            We believe that our neighborhoods are living architectures. When a public asset decays, it alters the <span className="font-semibold italic text-forest">communal space.</span>
          </h2>
        </div>
        <div className="lg:col-span-5 bg-sand/30 p-8 border border-charcoal/5 relative">
          {/* Geometric Accent Line */}
          <div className="absolute top-0 left-12 w-12 h-1 bg-forest"></div>
          <p className="text-charcoal/80 text-sm font-light leading-relaxed mb-6">
            CivicPulse treats local grievances as architectural restorations. By crowdsourcing municipal logs, we enable municipal caretakers and citizens to collaboratively rebuild structural integrity and ensure active service standards.
          </p>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-forest">
            <span>stewardship metrics</span>
            <ArrowUpRight size={14} />
          </div>
        </div>
      </section>

      {/* 3. Sectors of Concern (Services Redesign) */}
      <section className="px-6 py-24 bg-forest text-sand border-y border-charcoal/10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-sage block mb-2">operational sectors</span>
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
                Grievance Restoration Categories
              </h2>
            </div>
            <p className="text-sage max-w-xs text-sm font-light leading-relaxed">
              We catalog public space anomalies into structured architectural sectors for swift administrative mapping.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: "01",
                title: "Road Integrity",
                desc: "Pothole repair, pedestrian path cracks, public paving structural adjustments.",
              },
              {
                num: "02",
                title: "Spatial Lighting",
                desc: "Dark corner illumination, broken streetlight replacement, energy standards.",
              },
              {
                num: "03",
                title: "Sanitation Standards",
                desc: "Public waste dump clearance, street cleanliness, container monitoring.",
              },
              {
                num: "04",
                title: "Hydraulic Integrity",
                desc: "Water main leaks, community drain clears, pipe flow restorations.",
              },
            ].map((sector, idx) => (
              <div
                key={idx}
                className="border border-sand/10 hover:border-sand/40 p-8 flex flex-col justify-between h-[250px] transition-all duration-300 hover:bg-white/5"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono text-sage">{sector.num}</span>
                  <div className="w-1.5 h-1.5 bg-sand rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2 uppercase tracking-wider">{sector.title}</h3>
                  <p className="text-sage text-xs font-light leading-relaxed">{sector.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Stats Section */}
      <section className="bg-charcoal text-sand py-24 px-6 border-b border-charcoal/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
          {[
            { label: "Complaints Registered", val: "542+", sub: "Logged cases state-wide" },
            { label: "Municipal Coverage", val: "18 Districts", sub: "Active administrative zones" },
            { label: "Average Closeout", val: "4.8 Days", sub: "Response resolution time" },
          ].map((stat, idx) => (
            <div key={idx} className="border-l border-sand/20 pl-8 flex flex-col justify-between py-2">
              <span className="text-xs uppercase tracking-widest text-sage block mb-4">{stat.label}</span>
              <div>
                <span className="text-4xl sm:text-5xl font-light tracking-tight text-white block mb-2">{stat.val}</span>
                <span className="text-xs text-sage font-light block">{stat.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. The Process (How it works) */}
      <section id="process" className="px-6 py-24 md:py-32 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-forest block mb-2">workflow</span>
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-charcoal">
            stewardship progression
          </h2>
          <div className="w-8 h-1 bg-forest mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              step: "01",
              title: "Log public anomaly",
              desc: "Snap a photo of the public structural issue, specify state/area, and register detail logs."
            },
            {
              step: "02",
              title: "Administrative assignment",
              desc: "Local municipal admins verify the reported category and route standard requests to field workers."
            },
            {
              step: "03",
              title: "Structural closeout",
              desc: "Monitor live resolution progress and receive photo updates once the asset integrity is verified."
            }
          ].map((proc, idx) => (
            <div key={idx} className="bg-white border border-charcoal/5 p-8 relative flex flex-col justify-between min-h-[260px] shadow-sm hover:shadow-md transition-shadow">
              {/* Corner accent block */}
              <div className="absolute top-0 right-0 w-3 h-3 bg-sand"></div>
              
              <span className="text-3xl font-light text-forest italic block mb-6">{proc.step}</span>
              <div>
                <h3 className="text-base font-semibold uppercase tracking-widest text-charcoal mb-3">{proc.title}</h3>
                <p className="text-charcoal/70 text-xs font-light leading-relaxed">{proc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Footer Call To Action */}
      <section
        className="px-6 py-24 text-center relative overflow-hidden bg-charcoal border-t border-charcoal/20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(17,26,23,0.95), rgba(17,26,23,0.85)),
            url('https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1920&auto=format&fit=crop')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-3xl mx-auto relative z-10 py-8">
          <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-sage block mb-4">take stewardship</span>
          <h2 className="text-3xl sm:text-4xl font-light text-white mb-6 leading-tight tracking-tight">
            Ready to participate in urban restoration?
          </h2>
          <p className="text-sand/70 text-sm font-light mb-10 max-w-lg mx-auto leading-relaxed">
            Create an account to join thousands of residents working side-by-side with local municipal bodies across the country.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-sand hover:bg-white text-charcoal px-10 py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 inline-flex items-center gap-2 group shadow-lg"
          >
            <span>Enter Citizen Portal</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* 7. Footer Credits */}
      <footer className="bg-charcoal text-sage/40 text-xs text-center py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="tracking-widest uppercase text-[10px] font-bold text-sand/30">civicpulse.</span>
          <span className="font-light">
            Designed for urban restoration by <span className="text-sand/50 font-medium">Hardyansh, IIIT Ranchi</span>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
