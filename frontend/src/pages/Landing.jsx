import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { 
  MapPin, 
  ChevronDown, 
  Eye, 
  Edit3, 
  ListTodo, 
  CheckCircle2, 
  Navigation,
  Clock,
  Users,
  ShieldCheck,
  Map,
  AlertCircle,
  Settings,
  Menu,
  Home,
  FileText,
  Search,
  Trophy,
  Bell,
  Megaphone,
  Plus,
  ThumbsUp,
  Layers,
  BarChart3,
  Globe
} from "lucide-react";
import Navbar from "../components/Navbar";

// Dummy image assets for avatars
const av1 = "https://i.pravatar.cc/100?img=11";
const av2 = "https://i.pravatar.cc/100?img=33";
const av3 = "https://i.pravatar.cc/100?img=68";

const Landing = () => {
  const { user: _user } = useContext(AuthContext);
  const [publicStats, setPublicStats] = useState({
    totalReports: "10K+",
    resolvedReports: "8.9K+",
    activeCitizens: "4.8K+",
    resolutionRate: "92"
  });

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const res = await api.get("/api/public/stats");
        setPublicStats({
          totalReports: res.data.totalReports,
          resolvedReports: res.data.resolvedReports,
          activeCitizens: res.data.activeCitizens,
          resolutionRate: res.data.resolutionRate
        });
      } catch (err) {
        console.error("Failed to fetch public stats", err);
      }
    };
    fetchPublicStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden relative">
      <main>
      
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-emerald-200/40 mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-[10%] -right-[10%] w-[70%] h-[70%] rounded-full bg-teal-200/40 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[70%] h-[70%] rounded-full bg-green-200/40 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* 1. TOP NAVBAR */}
      <Navbar />

      {/* 2. HERO SECTION */}
      <div className="relative pt-12 pb-12 lg:pt-20 lg:pb-24 overflow-hidden z-10">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">
            
            {/* Left Content */}
            <div className="flex-1 max-w-2xl relative z-20">
              <div className="inline-block mb-4 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/80 shadow-sm text-xs font-bold text-emerald-800 uppercase tracking-widest">
                Reimagining Civic Tech
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.05] tracking-tight mb-6">
                Your Voice.<br />
                Your City.<br />
                Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">Civic Pulse.</span>
              </h1>
              <p className="text-lg text-slate-600 mb-10 max-w-xl leading-relaxed">
                Report local issues, track their progress, and work together with your community to make your city better.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 mb-12">
                <Link to="/signup" className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform duration-300 shadow-xl shadow-emerald-600/20">
                  <Edit3 size={20} />
                  <span>Report an Issue</span>
                </Link>
                <Link to="/login" className="flex items-center gap-2 bg-white/80 backdrop-blur-md text-slate-700 border border-white shadow-sm px-8 py-4 rounded-2xl font-bold hover:bg-white hover:scale-105 transition-all duration-300">
                  <Search size={20} />
                  <span>Explore Issues</span>
                </Link>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <img src={av1} alt="Citizen" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" />
                  <img src={av2} alt="Citizen" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" />
                  <img src={av3} alt="Citizen" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" />
                  <img src={av1} alt="Citizen" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-gray-900 leading-tight">10K+</p>
                  <p className="text-xs text-[#476077] font-semibold">Active Citizens</p>
                </div>
              </div>
            </div>

            {/* Right Dashboard Mockup */}
            <div className="flex-1 relative w-full max-w-[700px] lg:max-w-none ml-auto animate-float-slow z-20">
              {/* City skyline background hint behind dashboard */}
              <div className="absolute -bottom-20 -left-40 right-0 h-40 bg-[url('https://www.svgrepo.com/show/285098/cityscape-buildings.svg')] bg-repeat-x bg-bottom opacity-10 pointer-events-none z-0 scale-150"></div>

              <div className="bg-white/70 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden flex relative z-10 border border-white/50">
                
                {/* Mock Sidebar */}
                <div className="w-56 bg-brand-dark/95 backdrop-blur-md text-white p-4 hidden sm:flex flex-col flex-shrink-0 relative border-r border-brand-light/20">
                  <div className="flex items-center gap-2 mb-8 mt-2 px-2">
                    <div className="bg-white/20 p-1 rounded-full"><MapPin size={20} className="text-white fill-white" /></div>
                    <span className="font-bold text-lg tracking-wide">Civic Pulse</span>
                  </div>

                  <div className="space-y-1 text-sm flex-1">
                    <div className="flex items-center gap-3 bg-[#1e8f5e] p-3 rounded-xl font-medium shadow-sm"><Home size={18}/> Home</div>
                    <div className="flex items-center gap-3 p-3 text-white/80 hover:bg-white/5 rounded-xl cursor-pointer"><FileText size={18}/> My Reports</div>
                    <div className="flex items-center gap-3 p-3 text-white/80 hover:bg-white/5 rounded-xl cursor-pointer"><Search size={18}/> Explore Issues</div>
                    <div className="flex items-center gap-3 p-3 text-white/80 hover:bg-white/5 rounded-xl cursor-pointer"><Trophy size={18}/> Leaderboard</div>
                    <div className="flex items-center gap-3 p-3 text-white/80 hover:bg-white/5 rounded-xl cursor-pointer justify-between">
                      <div className="flex items-center gap-3"><Bell size={18}/> Notifications</div>
                      <span className="bg-[#1e8f5e] text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">3</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 text-white/80 hover:bg-white/5 rounded-xl cursor-pointer"><Megaphone size={18}/> Announcements</div>
                    <div className="flex items-center gap-3 p-3 text-white/80 hover:bg-white/5 rounded-xl cursor-pointer"><BarChart3 size={18}/> Analytics</div>
                  </div>

                  <div className="mt-8 mb-4">
                    <div className="flex items-center justify-center gap-2 bg-[#176a42] text-white py-3 rounded-xl font-semibold cursor-pointer border border-[#238654]">
                      <Edit3 size={16} />
                      <span>Report an Issue</span>
                    </div>
                  </div>

                  <div className="mt-2 bg-[#093d28] p-3 rounded-xl flex items-center justify-between border border-[#135c3e]">
                     <div className="flex items-center gap-3">
                       <img src={av1} alt="User avatar" className="w-8 h-8 rounded-full border border-white/20" />
                       <div className="flex flex-col leading-none">
                         <span className="text-sm font-semibold tracking-wide">Utkarsh Pratap</span>
                         <span className="text-[10px] text-white/60 mt-1">Lucknow, UP</span>
                       </div>
                     </div>
                     <ChevronDown size={14} className="text-white/40" />
                  </div>
                </div>

                {/* Mock Main Area */}
                <div className="flex-1 p-6 bg-white/60 flex flex-col relative z-0">
                  
                  {/* Top Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-[18px] font-extrabold text-gray-900 mb-1">Good morning, Utkarsh! 👋</p>
                      <p className="text-[11px] text-gray-500">Let's make our city a better place to live.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full cursor-pointer shadow-sm">
                        <MapPin size={14} className="text-gray-400" /> Lucknow, UP <ChevronDown size={14} className="text-gray-400 ml-1" />
                      </div>
                      <div className="relative text-gray-400 cursor-pointer hover:text-gray-600">
                        <Bell size={20} />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-[#1e8f5e] rounded-full border-2 border-white"></span>
                      </div>
                      <img src={av1} alt="Profile avatar" className="w-8 h-8 rounded-full border border-gray-200 shadow-sm cursor-pointer" />
                    </div>
                  </div>

                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 text-[#1e8f5e] rounded-xl flex items-center justify-center flex-shrink-0"><Plus size={18}/></div>
                      <div>
                        <span className="text-[11px] font-bold text-[#1e8f5e] block leading-none mb-1">Total Reports</span>
                        <div className="flex items-baseline gap-2">
                          <p className="text-xl font-extrabold text-gray-900 leading-none">128</p>
                          <p className="text-[9px] text-gray-400 font-medium">+12/wk</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center flex-shrink-0"><Clock size={18}/></div>
                      <div>
                        <span className="text-[11px] font-bold text-orange-500 block leading-none mb-1">In Progress</span>
                        <div className="flex items-baseline gap-2">
                          <p className="text-xl font-extrabold text-gray-900 leading-none">48</p>
                          <p className="text-[9px] text-gray-400 font-medium">37% total</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center flex-shrink-0"><CheckCircle2 size={18} fill="currentColor" className="text-white" /></div>
                      <div>
                        <span className="text-[11px] font-bold text-blue-500 block leading-none mb-1">Resolved</span>
                        <div className="flex items-baseline gap-2">
                          <p className="text-xl font-extrabold text-gray-900 leading-none">75</p>
                          <p className="text-[9px] text-gray-400 font-medium">+18/wk</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0"><ThumbsUp size={18} fill="currentColor" className="text-purple-200" /></div>
                      <div>
                        <span className="text-[11px] font-bold text-purple-600 block leading-none mb-1">Upvotes</span>
                        <div className="flex items-baseline gap-2">
                          <p className="text-xl font-extrabold text-gray-900 leading-none">1.2K</p>
                          <p className="text-[9px] text-gray-400 font-medium">+210/wk</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Heatmap Area */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                    <p className="text-xs font-bold text-gray-900 mb-3">Issue Heatmap</p>
                    <div className="h-48 bg-gray-50 rounded-xl relative overflow-hidden border border-gray-100">
                      <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/osm-intl/13/4232/2779.png')] bg-cover bg-center opacity-60"></div>
                      
                      {/* Map Points/Blobs */}
                      <div className="absolute top-12 left-[30%] w-12 h-12 bg-red-500 rounded-full blur-xl opacity-80"></div>
                      <div className="absolute top-16 left-[32%] w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow-sm z-10"></div>
                      
                      <div className="absolute bottom-10 left-[40%] w-10 h-10 bg-orange-500 rounded-full blur-xl opacity-80"></div>
                      <div className="absolute bottom-12 left-[42%] w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-sm z-10"></div>

                      <div className="absolute top-1/2 right-[20%] w-14 h-14 bg-green-500 rounded-full blur-xl opacity-80"></div>
                      <div className="absolute top-1/2 right-[22%] w-3 h-3 bg-green-600 rounded-full border-2 border-white shadow-sm z-10"></div>
                      
                      <div className="absolute top-10 right-[15%] w-10 h-10 bg-red-500 rounded-full blur-xl opacity-80"></div>
                      <div className="absolute top-12 right-[16%] w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow-sm z-10"></div>

                      <div className="absolute bottom-8 right-[30%] w-12 h-12 bg-red-500 rounded-full blur-xl opacity-80"></div>
                      <div className="absolute bottom-10 right-[32%] w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow-sm z-10"></div>

                      {/* Map Controls */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
                          <button className="p-2 border-b border-gray-100 text-gray-500 hover:text-gray-900 font-bold">+</button>
                          <button className="p-2 text-gray-500 hover:text-gray-900 font-bold">−</button>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 text-gray-600 cursor-pointer">
                          <Layers size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. STATS STRIP */}
      <div className="max-w-6xl mx-auto px-4 mb-24 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-wrap gap-8 justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center"><ListTodo size={24}/></div>
             <div><h3 className="text-2xl font-extrabold text-gray-900">{publicStats.totalReports}</h3><p className="text-sm text-gray-500 font-medium">Issues Reported</p></div>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center"><CheckCircle2 size={24}/></div>
             <div><h3 className="text-2xl font-extrabold text-gray-900">{publicStats.resolvedReports}</h3><p className="text-sm text-gray-500 font-medium">Issues Resolved</p></div>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center"><Users size={24}/></div>
             <div><h3 className="text-2xl font-extrabold text-gray-900">{publicStats.activeCitizens}</h3><p className="text-sm text-gray-500 font-medium">Active Citizens</p></div>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center"><BarChart3 size={24}/></div>
             <div><h3 className="text-2xl font-extrabold text-gray-900">{publicStats.resolutionRate}%</h3><p className="text-sm text-gray-500 font-medium">Resolution Rate</p></div>
          </div>
        </div>
      </div>

      {/* 4. HOW IT WORKS */}
      <div id="how-it-works" className="py-20 text-center px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">How <span className="text-brand">Civic Pulse</span> Works</h2>
        <p className="text-gray-500 mb-16">Simple steps to create a better community</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
           {/* Horizontal Line for desktop */}
           <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-200 border-t-2 border-dashed border-gray-300 -z-10"></div>
           
           <div className="flex flex-col items-center">
             <div className="w-24 h-24 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-brand mb-6 z-10 relative">
                <Eye size={40} />
             </div>
             <span className="text-brand font-bold text-sm mb-2">01</span>
             <h3 className="font-bold text-gray-900 mb-3">Spot an Issue</h3>
             <p className="text-sm text-gray-500 max-w-xs">See a pothole, garbage problem, broken streetlight, water issue or any other civic problem.</p>
           </div>
           
           <div className="flex flex-col items-center">
             <div className="w-24 h-24 bg-orange-50 rounded-full shadow-lg border border-orange-100 flex items-center justify-center text-orange-500 mb-6 z-10 relative">
                <Edit3 size={40} />
             </div>
             <span className="text-orange-500 font-bold text-sm mb-2">02</span>
             <h3 className="font-bold text-gray-900 mb-3">Report It</h3>
             <p className="text-sm text-gray-500 max-w-xs">Upload a photo, describe the issue, and provide its location in just a few seconds.</p>
           </div>

           <div className="flex flex-col items-center">
             <div className="w-24 h-24 bg-blue-50 rounded-full shadow-lg border border-blue-100 flex items-center justify-center text-blue-500 mb-6 z-10 relative">
                <ListTodo size={40} />
             </div>
             <span className="text-blue-500 font-bold text-sm mb-2">03</span>
             <h3 className="font-bold text-gray-900 mb-3">Track Progress</h3>
             <p className="text-sm text-gray-500 max-w-xs">Follow your report and stay updated as the issue moves from submission to resolution.</p>
           </div>

           <div className="flex flex-col items-center">
             <div className="w-24 h-24 bg-brand/10 rounded-full shadow-lg border border-brand/20 flex items-center justify-center text-brand mb-6 z-10 relative">
                <CheckCircle2 size={40} />
             </div>
             <span className="text-brand font-bold text-sm mb-2">04</span>
             <h3 className="font-bold text-gray-900 mb-3">Make an Impact</h3>
             <p className="text-sm text-gray-500 max-w-xs">Upvote important issues, participate in your community and help make your city better.</p>
           </div>
        </div>
      </div>

      {/* 5. WHY CIVIC PULSE? (FEATURES) */}
      <div id="features" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Why <span className="text-brand">Civic Pulse?</span></h2>
          <p className="text-gray-500 mb-16">Powerful features to empower citizens and build better cities</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
             {[
               { icon: Navigation, title: "Easy Reporting", desc: "Report issues in seconds with photos, location and details.", color: "text-brand", bg: "bg-brand/10" },
               { icon: Clock, title: "Real-time Tracking", desc: "Track the status of your reports from submission to resolution.", color: "text-orange-500", bg: "bg-orange-50" },
               { icon: Users, title: "Community Powered", desc: "Upvote and highlight important issues that need immediate attention.", color: "text-purple-600", bg: "bg-purple-50" },
               { icon: ShieldCheck, title: "Transparent Resolution", desc: "See updates and progress at every step of issue resolution.", color: "text-blue-500", bg: "bg-blue-50" },
               { icon: MapPin, title: "Location Based", desc: "View issues around your area and help municipalities identify hotspot.", color: "text-brand", bg: "bg-brand/10" },
               { icon: BarChart3, title: "Better Communities", desc: "Turn individual reports into meaningful community improvements.", color: "text-orange-500", bg: "bg-orange-50" },
             ].map((f, i) => (
               <div key={i} className="flex flex-col items-center text-center p-4">
                 <div className={`w-16 h-16 rounded-2xl ${f.bg} ${f.color} flex items-center justify-center mb-6`}>
                   <f.icon size={28} />
                 </div>
                 <h3 className="font-bold text-gray-900 mb-3 text-sm">{f.title}</h3>
                 <p className="text-xs text-gray-500">{f.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* 6. SEE WHAT'S HAPPENING AROUND YOUR CITY (MAP SECTION) */}
      <div className="py-24 px-4 bg-[#F4FAF6]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/3">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 leading-tight">See What's Happening Around Your City</h2>
            <p className="text-gray-600 mb-8">Civic Pulse turns individual reports into a clearer picture of what communities need.</p>
            <Link to="/login" className="inline-flex bg-brand text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-dark transition-colors shadow-sm">
              Explore Issues
            </Link>
          </div>
          <div className="lg:w-2/3 w-full bg-white rounded-2xl shadow-sm border border-brand/20 p-4">
            {/* Map Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-4">
              <span className="flex items-center gap-2 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-red-500"></div> Roads</span>
              <span className="flex items-center gap-2 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-green-500"></div> Garbage</span>
              <span className="flex items-center gap-2 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Street Lights</span>
              <span className="flex items-center gap-2 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Water</span>
              <span className="flex items-center gap-2 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-purple-500"></div> Sewage</span>
              <span className="flex items-center gap-2 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-brand"></div> Parks</span>
            </div>
            {/* Fake Map */}
            <div className="w-full h-[300px] bg-gray-100 rounded-xl relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/osm-intl/13/4232/2779.png')] bg-cover bg-center opacity-70"></div>
               {/* Map markers mock */}
               <MapPin size={24} className="absolute top-10 left-10 text-red-500 drop-shadow-md" />
               <MapPin size={24} className="absolute top-20 left-1/3 text-green-500 drop-shadow-md" />
               <MapPin size={24} className="absolute bottom-20 left-1/4 text-yellow-500 drop-shadow-md" />
               <MapPin size={24} className="absolute top-1/2 right-1/4 text-blue-500 drop-shadow-md" />
               <MapPin size={24} className="absolute bottom-1/4 right-10 text-brand drop-shadow-md" />
            </div>
          </div>
        </div>
      </div>

      {/* 7. LIFECYCLE DIAGRAM */}
      <div className="py-24 px-4 bg-white border-t border-gray-100 text-center">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">From Reporting a Problem to Seeing a Solution</h2>
        <p className="text-gray-500 mb-16">Civic Pulse ensures every issue is heard, tracked and resolved.</p>
        
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 relative">
          <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-0.5 bg-gray-100 border-t border-dashed border-gray-300 -z-10"></div>
          
          <div className="flex flex-col items-center bg-white p-4 w-56">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4"><AlertCircle size={24}/></div>
            <h3 className="font-bold text-gray-900 text-sm mb-2">Reported</h3>
            <p className="text-[10px] text-gray-500">Issue is reported by a citizen with details and location.</p>
          </div>
          
          <div className="flex flex-col items-center bg-white p-4 w-56">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-4"><Eye size={24}/></div>
            <h3 className="font-bold text-gray-900 text-sm mb-2">Acknowledged</h3>
            <p className="text-[10px] text-gray-500">Municipality acknowledges the issue and reviews it.</p>
          </div>

          <div className="flex flex-col items-center bg-white p-4 w-56">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4"><Settings size={24}/></div>
            <h3 className="font-bold text-gray-900 text-sm mb-2">In Progress</h3>
            <p className="text-[10px] text-gray-500">The issue is assigned and work is in progress.</p>
          </div>

          <div className="flex flex-col items-center bg-white p-4 w-56">
            <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-4"><CheckCircle2 size={24}/></div>
            <h3 className="font-bold text-gray-900 text-sm mb-2">Resolved</h3>
            <p className="text-[10px] text-gray-500">Issue is resolved and community is notified.</p>
          </div>
        </div>
      </div>

      {/* 8. FOOTER */}
      <footer className="bg-[#111111] text-white pt-16 pb-8 px-4 border-t-4 border-brand">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white">
                <MapPin size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight">Civic Pulse</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Empowering communities and municipalities to work together for cleaner, safer, and better cities.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/report" className="hover:text-brand transition-colors">Report an Issue</Link></li>
              <li><Link to="/login" className="hover:text-brand transition-colors">Explore Map</Link></li>
              <li><Link to="/community" className="hover:text-brand transition-colors">Community Feed</Link></li>
              <li><a href="#" className="hover:text-brand transition-colors">Leaderboard</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Organization</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-brand transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">For Municipalities</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Press & Media</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-brand transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Civic Pulse. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Globe size={14}/> Available in EN & HI</span>
          </div>
        </div>
      </footer>

      </main>
    </div>
  );
};

export default Landing;
