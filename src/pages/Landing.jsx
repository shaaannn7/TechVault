import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Users, Shield, ArrowRight, BookMarked, Sparkles } from 'lucide-react';

export default function Landing({ setActivePage }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const stats = [
    { label: 'Verified Engineers', count: '1,200+', icon: Users, color: 'from-violet-500 to-fuchsia-500' },
    { label: 'Engineering Notes', count: '450+', icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
    { label: 'Exam Papers (PYQs)', count: '180+', icon: GraduationCap, color: 'from-emerald-500 to-teal-500' },
    { label: 'Moderator Approvals', count: '99.8%', icon: Shield, color: 'from-amber-500 to-orange-500' }
  ];

  const branches = [
    { name: 'Computer Science', desc: 'DSA, Operating Systems, Computer Architecture, and Networks.', count: 48, code: 'CSE' },
    { name: 'Mathematics', desc: 'Advanced Calculus, Matrices, Statistics, and Discrete Math.', count: 32, code: 'MATH' },
    { name: 'Electronics Engineering', desc: 'Signals, Digital Logic, Microprocessors, and VLSI.', count: 28, code: 'ECE' },
    { name: 'Civil Engineering', desc: 'RCC Design, Structural Mechanics, Fluid Dynamics.', count: 18, code: 'CIVIL' },
    { name: 'Physics', desc: 'Quantum Mechanics, Solid State Physics, Optics.', count: 22, code: 'PHYS' },
    { name: 'Chemistry', desc: 'Organic Mechanisms, Polymer Chemistry, Nano-materials.', count: 15, code: 'CHEM' }
  ];

  return (
    <div className="flex flex-col w-full relative pb-20 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[180px] pointer-events-none"></div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-24 text-center z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-6"
        >
          {/* Tag */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold tracking-wide"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Excellence Redefined for JECRC Foundation</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight uppercase max-w-4xl text-slate-100"
          >
            Your Vault for Premium <span className="gradient-text">Engineering</span> Knowledge
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            variants={itemVariants}
            className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed"
          >
            Access peer-reviewed course summaries, RTU syllabus exam papers, and engineering resources tailored for JECRC Foundation. Upload your work, earn reputation, and study smarter.
          </motion.p>

          {/* Action CTAs */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto"
          >
            <button
              onClick={() => setActivePage('notes')}
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-violet-500/20 hover:shadow-violet-500/35 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
            >
              <span>Explore Notes</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setActivePage('pyqs')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-white/10 text-slate-300 hover:text-white font-bold rounded-2xl transition-all duration-300 cursor-pointer"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Past Year Papers</span>
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Campus Showcase Section */}
      <motion.section 
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-6xl mx-auto w-full px-4 md:px-8 mt-12 z-10"
      >
        <div className="relative group rounded-3xl overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-md p-2 hover:border-violet-500/30 transition-all duration-500 shadow-2xl shadow-violet-500/5">
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9]">
            <img 
              src="/college.jpg" 
              alt="JECRC Foundation Campus" 
              className="w-full h-full object-cover object-center transform group-hover:scale-[1.02] transition-transform duration-700 ease-out brightness-[0.8] group-hover:brightness-100"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-85"></div>
            
            {/* Floating Badge / Text Overlay */}
            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 text-left max-w-lg">
              <span className="text-[10px] md:text-xs font-black tracking-widest text-violet-400 uppercase bg-slate-950/80 px-3 py-1.5 border border-violet-500/20 rounded-full mb-3 inline-block backdrop-blur-sm">
                JECRC Foundation Campus
              </span>
              <h3 className="text-xl md:text-3xl font-extrabold text-white tracking-tight uppercase">
                The Heart of our Knowledge Sharing
              </h3>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-md hidden sm:block">
                Explore the study vault, upload resources, and collaborate with peer engineers across our departments.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stats Counter Section */}
      <section className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-24 md:mt-32 z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => {
            const IconComponent = stat.icon;
            return (
              <div 
                key={i}
                className="glass-card rounded-2xl p-5 md:p-6 text-left flex flex-col justify-between h-36 relative overflow-hidden group hover:border-white/10 transition-all"
              >
                {/* Visual Glow */}
                <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-gradient-to-tr ${stat.color} opacity-5 group-hover:opacity-10 blur-xl transition-opacity`}></div>

                <div className="flex justify-between items-start">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-300">
                    <IconComponent className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex flex-col mt-4">
                  <span className="text-2xl md:text-3xl font-black text-slate-100">{stat.count}</span>
                  <span className="text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Branches/Departments */}
      <section className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-28 md:mt-36 z-10">
        <div className="flex flex-col items-center text-center mb-16 gap-3">
          <span className="text-xs font-extrabold text-violet-500 uppercase tracking-widest">Academic Branches</span>
          <h2 className="text-3xl md:text-4xl font-extrabold uppercase text-slate-100 tracking-tight">Structured by Engineering Sectors</h2>
          <div className="w-12 h-1 bg-violet-600 rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch, i) => (
            <div 
              key={i}
              className="glass-card rounded-2xl p-6 text-left border border-white/5 hover:border-white/10 hover:bg-slate-900/35 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase bg-slate-900/80 px-2 py-1 border border-white/5 rounded">
                    {branch.code}
                  </span>
                  <span className="text-xs font-bold text-violet-400 group-hover:underline cursor-pointer flex items-center gap-1" onClick={() => setActivePage('notes')}>
                    Browse Note ({branch.count})
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-200 uppercase tracking-tight mb-2 group-hover:text-violet-400 transition-colors">
                  {branch.name}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  {branch.desc}
                </p>
              </div>

              <button
                onClick={() => setActivePage('notes')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-300 group-hover:text-white transition-colors cursor-pointer mt-4"
              >
                <span>Browse materials</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Semester Directory Quick-Access Widget */}
      <section className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-28 md:mt-36 z-10 text-center">
        <div className="flex flex-col items-center mb-12 gap-3">
          <span className="text-xs font-extrabold text-violet-500 uppercase tracking-widest">Syllabus Directory</span>
          <h2 className="text-3xl md:text-4xl font-extrabold uppercase text-slate-100 tracking-tight">RTU Semester Quick-Access</h2>
          <div className="w-12 h-1 bg-violet-600 rounded"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <button
              key={sem}
              onClick={() => {
                localStorage.setItem('tv_initial_sem', sem.toString());
                setActivePage('notes');
              }}
              className="glass-card rounded-2xl p-6 text-center border border-white/5 hover:border-violet-500/30 hover:bg-slate-900/35 transition-all group flex flex-col items-center justify-center gap-3 cursor-pointer"
            >
              <div className="p-3 rounded-full bg-violet-500/10 border border-violet-500/20 group-hover:bg-violet-600 group-hover:text-white transition-all">
                <GraduationCap className="w-5 h-5 text-violet-400 group-hover:text-white" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-extrabold text-slate-200 group-hover:text-violet-400">Semester {sem}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">RTU Syllabus Scheme</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
