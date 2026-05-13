/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  CheckCircle2, 
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- Mock Data & Constants ---

// Host is available from 09:00 to 15:30 every weekday
const HOST_AVAILABLE_HOURS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
  "12:00", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"
];

// Invitee Busy slots (Date specific)
const INVITEE_BUSY_MAP: Record<string, string[]> = {
  "2026-05-11": ["09:00", "11:00", "11:30", "14:00"],
  "2026-05-12": ["10:00", "10:30", "13:00", "15:00"],
  "2026-05-13": ["09:00", "09:30", "14:30", "15:30"],
  "2026-05-14": ["11:00", "12:00", "14:00", "15:00"],
  "2026-05-15": ["09:30", "10:00", "13:30", "14:30"],
};

const AVAILABLE_DAYS = [
  { id: "2026-05-11", label: "Mon", day: "11" },
  { id: "2026-05-12", label: "Tue", day: "12" },
  { id: "2026-05-13", label: "Wed", day: "13" },
  { id: "2026-05-14", label: "Thu", day: "14" },
  { id: "2026-05-15", label: "Fri", day: "15" },
];

type Step = "connect" | "select" | "success";

export default function App() {
  const [step, setStep] = useState<Step>("connect");
  const [isConnected, setIsConnected] = useState(false);
  const [selectedDateId, setSelectedDateId] = useState("2026-05-11");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // --- Logic ---

  const currentDaySlots = useMemo(() => {
    const busyOnDay = INVITEE_BUSY_MAP[selectedDateId] || [];
    return HOST_AVAILABLE_HOURS.map(hour => ({
      time: `${selectedDateId}T${hour}:00`,
      hour: hour,
      isMutual: !isConnected || !busyOnDay.includes(hour)
    }));
  }, [isConnected, selectedDateId]);

  const handleConnect = () => {
    // Simulating OAuth flow delay
    setTimeout(() => {
      setIsConnected(true);
      setStep("select");
    }, 800);
  };

  const handleSkip = () => {
    setIsConnected(false);
    setStep("select");
  };

  const handleConfirmTime = (time: string) => {
    setSelectedTime(time);
    setStep("success");
  };

  // --- Components ---

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1A1A1A] antialiased">
      <header className="flex items-center px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0069FF] rounded-full flex items-center justify-center">
             <div className="w-3 h-3 border-2 border-white rounded-full" />
          </div>
          <span className="font-bold text-xl tracking-tight">Calendly</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === "connect" && (
            <ConnectStep onConnect={handleConnect} onSkip={handleSkip} />
          )}
          {step === "select" && (
            <SelectStep 
              isConnected={isConnected} 
              slots={currentDaySlots} 
              selectedDateId={selectedDateId}
              onDateSelect={setSelectedDateId}
              onConfirm={handleConfirmTime}
            />
          )}
          {step === "success" && (
            <SuccessStep selectedTime={selectedTime!} />
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-4 left-0 right-0 text-center text-[11px] text-[#A3A3A3]">
        This prototype uses client-side logic only. No calendar data is stored or transmitted to servers.
      </footer>
    </div>
  );
}

function ConnectStep({ onConnect, onSkip }: { onConnect: () => void; onSkip: () => void }) {
  return (
    <motion.div 
      key="connect-step"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col md:flex-row bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden min-h-[500px]"
    >
      <SidePanel />
      
      <div className="flex-1 flex flex-col items-center justify-center p-12 relative">
        {/* Background Grid Decoration */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        
        <div className="z-10 flex flex-col items-center text-center max-w-sm">
          <div className="w-12 h-12 bg-[#F1F5F9] rounded-lg flex items-center justify-center mb-6">
            <CalendarIcon className="w-6 h-6 text-[#0069FF]" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4">See when you're both free</h2>
          <p className="text-[#64748B] text-sm leading-relaxed mb-8">
            Connect your calendar to instantly see mutual openings. 
            This is an <span className="font-semibold">ephemeral connection</span> — we only see if you're busy and never event titles or details.
          </p>

          <button 
            type="button"
            onClick={onConnect}
            className="w-full bg-[#0069FF] hover:bg-[#005AE0] text-white font-semibold py-3.5 rounded-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] mb-3 cursor-pointer"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5 bg-white rounded-full p-1" alt="Google" />
            Connect Google Calendar
          </button>
          
          <button 
            type="button"
            onClick={onSkip}
            className="w-full bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] font-medium py-3.5 rounded-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            Skip and see all availability
          </button>

          <div className="mt-8 flex items-center gap-2 text-[#94A3B8] text-[10px] uppercase tracking-widest font-semibold font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            Encrypted & Ephemeral Connection
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SelectStep({ 
  isConnected, 
  slots, 
  selectedDateId,
  onDateSelect,
  onConfirm 
}: { 
  isConnected: boolean; 
  slots: { time: string; hour: string; isMutual: boolean }[]; 
  selectedDateId: string;
  onDateSelect: (id: string) => void;
  onConfirm: (time: string) => void 
}) {
  return (
    <motion.div 
      key="select-step"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col md:flex-row bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden min-h-[600px]"
    >
      <SidePanel />

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">Select Date & Time</h2>
          {isConnected && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-black text-white px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2"
            >
               <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
               Mutual open times highlighted
            </motion.div>
          )}
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-center px-4 mb-4">
            <div className="flex gap-4 sm:gap-8 text-sm text-[#94A3B8] w-full justify-between sm:justify-start">
              <div className="flex flex-col items-center opacity-50 select-none"><span>Sun</span><span className="text-[#CBD5E1]">10</span></div>
              
              {AVAILABLE_DAYS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onDateSelect(d.id)}
                  className={`flex flex-col items-center transition-all cursor-pointer group ${
                    selectedDateId === d.id 
                      ? "text-[#1A1A1A] font-bold" 
                      : "hover:text-[#475569]"
                  }`}
                >
                  <span className="mb-2">{d.label}</span>
                  <span className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-all ${
                    selectedDateId === d.id ? "bg-[#0069FF] text-white" : "group-hover:bg-[#F1F5F9]"
                  }`}>
                    {d.day}
                  </span>
                </button>
              ))}

              <div className="flex flex-col items-center opacity-50 select-none"><span>Sat</span><span className="text-[#CBD5E1]">16</span></div>
            </div>
          </div>
          <div className="h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
             <motion.div 
               layoutId="underline"
               className="h-full bg-[#94A3B8]" 
               initial={false}
               animate={{ width: `${(AVAILABLE_DAYS.findIndex(d => d.id === selectedDateId) + 1) * 20}%` }} 
             />
          </div>
        </div>

        <div className="space-y-3 pr-2 overflow-y-auto max-h-[400px] custom-scrollbar scroll-smooth">
          <AnimatePresence mode="popLayout">
            {slots.map((slot, idx) => {
              const formattedTime = new Date(slot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              return (
                <motion.div 
                  key={slot.time}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`group relative p-4 rounded-lg border transition-all duration-300 ${
                    slot.isMutual && isConnected 
                      ? "border-[#0069FF] bg-[#F0F7FF] ring-2 ring-[#0069FF] ring-opacity-20"
                      : "border-[#E2E8F0] hover:border-[#0069FF]"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className={`text-lg font-bold ${!slot.isMutual && isConnected ? "text-[#CBD5E1]" : "text-[#1A1A1A]"}`}>
                        {formattedTime}
                      </span>
                      {slot.isMutual && isConnected && (
                        <p className="text-[10px] uppercase font-bold text-[#0069FF] mt-1 tracking-wider">
                          Recommended: You're both free
                        </p>
                      )}
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => onConfirm(slot.time)}
                      disabled={!slot.isMutual && isConnected}
                      className={`px-6 py-2 rounded font-bold text-sm transition-all ${
                        !slot.isMutual && isConnected 
                          ? "bg-white border text-[#CBD5E1] cursor-not-allowed"
                          : "bg-white border border-[#0069FF] text-[#0069FF] hover:bg-[#0069FF] hover:text-white cursor-pointer"
                      }`}
                    >
                      Confirm
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function SuccessStep({ selectedTime }: { selectedTime: string }) {
  const formattedTime = new Date(selectedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = new Date(selectedTime).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <motion.div 
      key="success-step"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="max-w-xl mx-auto flex flex-col items-center bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-12 text-center"
    >
      <div className="w-16 h-16 bg-[#F0FDF4] rounded-full flex items-center justify-center mb-8">
        <CheckCircle2 className="w-10 h-10 text-[#22C55E]" />
      </div>
      
      <h2 className="text-3xl font-bold mb-4">You are scheduled</h2>
      <p className="text-[#64748B] mb-12">
        A calendar invitation has been sent to your email address.
      </p>

      <div className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-8 text-left space-y-6">
        <div>
           <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-1">Acme Corp</p>
           <h3 className="text-xl font-bold">Product Strategy Discovery</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 text-[#475569]">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-[#E2E8F0]">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
               <p className="font-bold text-[#1A1A1A]">{formattedTime}</p>
               <p className="text-sm">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[#475569]">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-[#E2E8F0]">
              <Clock className="w-4 h-4" />
            </div>
            <p className="font-medium">30 min</p>
          </div>

          <div className="flex items-center gap-4 text-[#475569]">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-[#E2E8F0]">
              <Video className="w-4 h-4" />
            </div>
            <p className="font-medium">Web conferencing details to follow</p>
          </div>
        </div>
      </div>

      <button 
        onClick={() => { window.location.href = "/"; }}
        className="mt-12 text-[#0069FF] font-bold hover:underline cursor-pointer"
      >
        Schedule another event
      </button>
    </motion.div>
  );
}

function SidePanel() {
  return (
    <div className="w-full md:w-[320px] bg-white border-b md:border-b-0 md:border-r border-[#E2E8F0] p-8">
      <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-2">Acme Corp</p>
      <h1 className="text-2xl font-bold mb-8">Product Strategy Discovery</h1>
      
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-3 text-[#64748B] text-sm font-medium">
          <Clock className="w-4 h-4" />
          <span>30 min</span>
        </div>
        <div className="flex items-start gap-3 text-[#64748B] text-sm font-medium">
          <Video className="w-4 h-4 mt-0.5" />
          <span>Web conferencing details provided upon confirmation.</span>
        </div>
      </div>

      <div className="w-full h-px bg-[#E2E8F0] mb-8" />

      <p className="text-[#94A3B8] text-[13px] leading-relaxed italic">
        In this 30-minute discovery session, we'll dive into your team's objectives and explore how our platform can accelerate your product roadmap.
      </p>
    </div>
  );
}
