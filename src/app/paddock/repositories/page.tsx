'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, Search, Star, GitFork, AlertTriangle, 
  ExternalLink, ArrowLeft, Calendar, ShieldCheck, 
  Users, MapPin, Code, Link as LinkIcon, RefreshCw,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { useSound } from '@/context/SoundContext';

// Programming language color coding mapping
const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#F1E05A',
  TypeScript: '#3178C6',
  Python: '#3572A5',
  HTML: '#E34C26',
  CSS: '#563D7C',
  Rust: '#DEA584',
  Go: '#00ADD8',
  'C++': '#F34B7D',
  Swift: '#F05138',
  Java: '#B07219',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Shell: '#89E051',
  C: '#555555',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB'
};

interface GitHubProfile {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
}

interface Repository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  updated_at: string;
}

export default function GitHubReposPage() {
  const { playSound } = useSound();
  const [usernameInput, setUsernameInput] = useState('vercel');
  const [activeUsername, setActiveUsername] = useState('vercel');
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Local Filtering / Sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'stars' | 'forks' | 'updated' | 'name'>('stars');

  useEffect(() => {
    fetchUserData(activeUsername);
  }, [activeUsername]);

  const fetchUserData = async (username: string) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Profile Details
      const profileRes = await fetch(`https://api.github.com/users/${username}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });

      if (profileRes.status === 404) {
        throw new Error('TELEMETRY NODE UNRESOLVED: Profile node not found in DNS registry.');
      } else if (profileRes.status === 403) {
        throw new Error('TELEMETRY TIMEOUT: GitHub API limit exceeded. Request authenticated sync.');
      } else if (!profileRes.ok) {
        throw new Error('NODE LINK FAILURE: Telemetry pipeline encountered an error.');
      }

      const profileData = await profileRes.json();
      setProfile(profileData);

      // Fetch Repository Details (limit to 100 max public repositories for performance)
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });

      if (!reposRes.ok) {
        throw new Error('PIPELINE FLUSH ERROR: Failed to stream repository packets.');
      }

      const reposData = await reposRes.json();
      setRepos(reposData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unknown network failure.');
      setProfile(null);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    playSound('engine-rev');
    setActiveUsername(usernameInput.trim());
  };

  // Compute stats metrics
  const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
  const totalForks = repos.reduce((acc, repo) => acc + repo.forks_count, 0);
  
  // Calculate top programming language
  const languageCounts = repos.reduce((acc, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const languagesList = Object.keys(languageCounts);
  
  const topLanguage = Object.entries(languageCounts).reduce(
    (max, curr) => (curr[1] > max[1] ? curr : max),
    ['None', 0]
  )[0];

  const mostPopularRepo = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count)[0];

  // Apply filters and sorting
  const filteredAndSortedRepos = repos
    .filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLanguage = languageFilter === 'All' || repo.language === languageFilter;
      return matchesSearch && matchesLanguage;
    })
    .sort((a, b) => {
      if (sortBy === 'stars') return b.stargazers_count - a.stargazers_count;
      if (sortBy === 'forks') return b.forks_count - a.forks_count;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  return (
    <main className="min-h-screen pt-32 pb-24 px-4 md:px-8 bg-carbon-black relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(225,6,0,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Back Link */}
        <Link 
          href="/paddock" 
          onClick={() => playSound('click')}
          className="inline-flex items-center gap-2 text-xs font-orbitron font-bold text-white/40 hover:text-white transition-colors mb-6 no-underline"
        >
          <ArrowLeft size={14} /> BACK TO PADDOCK PORTAL
        </Link>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-[1px] bg-racing-red" />
              <span className="font-orbitron text-[9px] font-black tracking-widest text-racing-red uppercase">Live telemetry nodes & repos</span>
            </div>
            <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter">
              TELEMETRY <span className="text-racing-red">REPOSITORIES</span>
            </h1>
          </div>
          <p className="text-white/40 text-xs font-mono max-w-sm text-left md:text-right">
            Synchronize external developer nodes to query repository telemetry, statistics matrices, and engineering repositories.
          </p>
        </div>

        {/* Search Node Terminal */}
        <div className="glass rounded-2xl p-6 border-white/10 mb-8 max-w-3xl">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch gap-4">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter GitHub node handle (e.g. vercel)"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 font-orbitron font-black text-sm text-white uppercase tracking-wider focus:outline-none focus:border-racing-red focus:bg-white/10 transition-all placeholder:text-white/20"
              />
            </div>
            <button
              type="submit"
              className="btn-racing !py-3.5 flex items-center justify-center gap-2 text-xs tracking-widest"
            >
              <Terminal size={14} />
              <span>SYNC TELEMETRY NODE</span>
            </button>
          </form>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="space-y-8 animate-pulse">
            {/* Profile HUD Skeleton */}
            <div className="glass p-8 rounded-3xl border-white/5 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-24 h-24 rounded-full bg-white/5 shrink-0" />
              <div className="flex-1 space-y-4">
                <div className="h-6 w-48 bg-white/10 rounded" />
                <div className="h-4 w-72 bg-white/5 rounded" />
                <div className="flex gap-4">
                  <div className="h-6 w-24 bg-white/5 rounded-full" />
                  <div className="h-6 w-24 bg-white/5 rounded-full" />
                </div>
              </div>
            </div>
            {/* Stats Matrix Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass p-6 rounded-2xl border-white/5 h-28 bg-white/5" />
              ))}
            </div>
            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass p-6 rounded-2xl border-white/5 h-48 bg-white/5" />
              ))}
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="glass border-racing-red/30 p-8 rounded-3xl max-w-xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 bg-racing-red/10 border border-racing-red rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="text-racing-red" size={32} />
            </div>
            <h3 className="font-orbitron text-xl font-black text-white italic uppercase tracking-tighter">
              TELEMETRY CONNECTION FAILED
            </h3>
            <p className="text-xs text-white/50 font-mono leading-relaxed uppercase tracking-wider">
              {error}
            </p>
            <div className="h-[1px] bg-white/5 my-4" />
            <button
              onClick={() => fetchUserData(activeUsername)}
              className="glass border-white/20 hover:border-white px-6 py-3 rounded-xl font-orbitron text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw size={12} />
              RETRY TELEMETRY PIPELINE
            </button>
          </div>
        )}

        {/* SUCCESS HUD & DATA RENDER */}
        {!loading && !error && profile && (
          <div className="space-y-8">
            {/* Developer HUD Info Card */}
            <div className="glass p-8 rounded-3xl border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 backdrop-blur-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-racing-red/5 blur-3xl rounded-full" />
              
              <div className="relative w-24 h-24 rounded-full border-2 border-white/10 bg-white/5 flex items-center justify-center shadow-2xl overflow-hidden shrink-0">
                <img src={profile.avatar_url} alt={profile.name || profile.login} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 text-center md:text-left z-10 space-y-3">
                <div>
                  <h2 className="font-orbitron text-2xl font-black text-white italic tracking-tight uppercase">
                    {profile.name || profile.login}
                  </h2>
                  <p className="text-racing-red font-mono text-xs uppercase tracking-widest mt-1">
                    @{profile.login}
                  </p>
                </div>
                {profile.bio && (
                  <p className="text-white/60 text-xs font-light max-w-xl">
                    {profile.bio}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[10px] font-orbitron font-bold uppercase tracking-wider text-white/40">
                  {profile.location && (
                    <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                      <MapPin size={10} className="text-racing-red" /> {profile.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                    <Users size={10} className="text-pit-yellow" /> {profile.followers} Followers
                  </span>
                  {profile.blog && (
                    <a
                      href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/5 text-white/40 hover:text-white/80 transition-colors no-underline"
                    >
                      <LinkIcon size={10} /> Blog
                    </a>
                  )}
                </div>
              </div>

              <div className="z-10 flex flex-col gap-2 shrink-0">
                <a
                  href={profile.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass border-racing-red/30 text-racing-red px-6 py-3 rounded-xl font-orbitron text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-racing-red/10 transition-colors no-underline"
                >
                  <ExternalLink size={14} /> GITHUB PROFILE
                </a>
              </div>
            </div>

            {/* Computed Statistics Matrix */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass p-5 rounded-2xl border-white/5 relative overflow-hidden bg-white/5">
                <div className="absolute top-3 right-3 text-white/5">
                  <Star size={40} />
                </div>
                <span className="text-[8px] font-orbitron font-black text-white/40 tracking-wider uppercase block mb-1">AGGREGATED STARS</span>
                <div className="font-orbitron text-2xl font-black text-white">
                  {totalStars.toLocaleString()}
                </div>
              </div>

              <div className="glass p-5 rounded-2xl border-white/5 relative overflow-hidden bg-white/5">
                <div className="absolute top-3 right-3 text-white/5">
                  <GitFork size={40} />
                </div>
                <span className="text-[8px] font-orbitron font-black text-white/40 tracking-wider uppercase block mb-1">AGGREGATED FORKS</span>
                <div className="font-orbitron text-2xl font-black text-white">
                  {totalForks.toLocaleString()}
                </div>
              </div>

              <div className="glass p-5 rounded-2xl border-white/5 relative overflow-hidden bg-white/5">
                <div className="absolute top-3 right-3 text-white/5">
                  <Code size={40} />
                </div>
                <span className="text-[8px] font-orbitron font-black text-white/40 tracking-wider uppercase block mb-1">TOP LANGUAGE</span>
                <div className="font-orbitron text-xl font-black text-pit-yellow truncate">
                  {topLanguage}
                </div>
              </div>

              <div className="glass p-5 rounded-2xl border-white/5 relative overflow-hidden bg-white/5">
                <div className="absolute top-3 right-3 text-white/5">
                  <BookOpen size={40} />
                </div>
                <span className="text-[8px] font-orbitron font-black text-white/40 tracking-wider uppercase block mb-1">MOST POPULAR REPO</span>
                <div className="font-orbitron text-sm font-black text-white truncate max-w-full">
                  {mostPopularRepo ? mostPopularRepo.name : 'N/A'}
                </div>
              </div>
            </div>

            {/* List Header and Telemetry Filters */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h3 className="font-orbitron font-bold text-lg text-white flex items-center gap-2">
                    <ShieldCheck className="text-racing-red animate-pulse" size={16} />
                    REPOSITORIES MATRIX ({filteredAndSortedRepos.length})
                  </h3>
                  <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest mt-1">
                    Telemetry list representing the open source engineering layer of the node.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-stretch w-full lg:w-auto">
                  {/* Search inside repos */}
                  <div className="relative flex-1 lg:flex-initial min-w-[200px]">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter repo..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-racing-red transition-all"
                    />
                  </div>

                  {/* Language filter dropdown */}
                  <select
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className="bg-carbon-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-racing-red transition-all"
                  >
                    <option value="All">All Languages</option>
                    {languagesList.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>

                  {/* Sorting dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-carbon-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-racing-red transition-all"
                  >
                    <option value="stars">Sort by Stars</option>
                    <option value="forks">Sort by Forks</option>
                    <option value="updated">Sort by Updated</option>
                    <option value="name">Sort by Name</option>
                  </select>
                </div>
              </div>

              {/* REPOSITORIES GRID */}
              {filteredAndSortedRepos.length === 0 ? (
                <div className="glass rounded-2xl p-12 border-white/5 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/20">
                    <Terminal size={20} />
                  </div>
                  <p className="font-orbitron text-xs font-black text-white/40 tracking-widest uppercase">No Repositories Match</p>
                  <p className="text-[10px] text-white/30 font-mono max-w-md mx-auto">No repositories match your active filter queries. Adjust search text or language constraints.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedRepos.map((repo, i) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.05, 0.4) }}
                      whileHover={{ y: -4 }}
                      key={repo.id}
                      className="glass rounded-2xl border-white/5 p-6 hover:border-racing-red/20 transition-all duration-300 flex flex-col justify-between h-56 bg-white/3 group relative overflow-hidden"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-orbitron font-black text-sm text-white truncate max-w-[85%] italic tracking-tight group-hover:text-racing-red transition-colors">
                            {repo.name}
                          </h4>
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => playSound('click')}
                            className="text-white/30 hover:text-white transition-colors p-1"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>

                        <p className="text-[11px] text-white/50 leading-relaxed font-light line-clamp-3">
                          {repo.description || 'No descriptive telemetry logged for this repository packet.'}
                        </p>
                      </div>

                      <div className="border-t border-white/5 pt-4 flex justify-between items-center text-[10px]">
                        {/* Stats items */}
                        <div className="flex items-center gap-3 text-white/40 font-mono font-medium">
                          <span className="flex items-center gap-1">
                            <Star size={11} className="text-pit-yellow" />
                            {repo.stargazers_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork size={11} className="text-white/40" />
                            {repo.forks_count}
                          </span>
                        </div>

                        {/* Language pill and updated date */}
                        <div className="flex items-center gap-3">
                          {repo.language && (
                            <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5 text-[9px] font-orbitron font-bold">
                              <span 
                                className="w-1.5 h-1.5 rounded-full shrink-0" 
                                style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || '#FFFFFF' }}
                              />
                              {repo.language}
                            </span>
                          )}
                          <span className="text-white/30 font-mono text-[9px] flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(repo.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
