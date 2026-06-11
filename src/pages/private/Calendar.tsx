import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Video,
  MapPin,
  MoreVertical,
  Search,
  Filter,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const events = [
  { id: 1, title: "Project Kickoff", time: "10:00 AM - 11:00 AM", type: "Meeting", project: "Fyose Mobile App", date: 15 },
  { id: 2, title: "Design Review", time: "02:00 PM - 03:30 PM", type: "Review", project: "Fyose Mobile App", date: 18 },
  { id: 3, title: "Sprint Planning", time: "09:00 AM - 10:30 AM", type: "Planning", project: "Enterprise ERP v2", date: 22 },
  { id: 4, title: "Client Demo", time: "04:00 PM - 05:00 PM", type: "Demo", project: "Fyose Mobile App", date: 25 },
];

const Calendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  const daysInMonth = 31; // Simplified for demo
  const startDay = 1; // Simplified for demo

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-gray-500 mt-2">Schedule and manage your project meetings and milestones.</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Schedule Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Calendar Grid */}
        <div className="lg:col-span-8 bg-black/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-bold">March 2026</h2>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const hasEvents = events.some(e => e.date === day);
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all relative group",
                    selectedDate === day
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span className="text-sm font-bold">{day}</span>
                  {hasEvents && (
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      selectedDate === day ? "bg-white" : "bg-blue-500"
                    )} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Events Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="p-8 bg-black/40 backdrop-blur-xl border border-white/5 rounded-[32px]">
            <h3 className="text-lg font-bold mb-8">Events for March {selectedDate}</h3>
            <div className="space-y-6">
              {events.filter(e => e.date === selectedDate).length > 0 ? (
                events.filter(e => e.date === selectedDate).map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 bg-white/5 border border-white/10 rounded-2xl group hover:border-blue-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-bold rounded uppercase tracking-wider">
                        {event.type}
                      </span>
                      <MoreVertical className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="text-sm font-bold mb-1 group-hover:text-blue-400 transition-colors">{event.title}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-4">{event.project}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{event.time}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-500">No events scheduled for this day.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/10 rounded-[32px]">
            <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <button className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-between group">
                <span>Sync with Google</span>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
              <button className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-between group">
                <span>Export Calendar</span>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
