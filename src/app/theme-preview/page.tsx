'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight, 
  Star, 
  Search, 
  ShoppingCart, 
  User, 
  Camera, 
  Laptop, 
  Shirt, 
  Building, 
  Volume2, 
  Check, 
  Layers,
  ChevronRight,
  Palette,
  Sliders,
  RotateCcw,
  Copy,
  Code2,
  X,
  Type,
  Paintbrush,
  Download,
  Eye
} from 'lucide-react'

export interface ThemeConfig {
  id: number
  batch: string
  name: string
  tagline: string
  bg: string
  surface: string
  surfaceBorder: string
  textPrimary: string
  textSecondary: string
  navBg: string
  navText: string
  ctaBg: string
  ctaText: string
  accentGold: string
  badgeBg: string
  badgeText: string
  isDark: boolean
  swatches: { name: string; hex: string }[]
}

export const THEMES: ThemeConfig[] = [
  // --- BATCH 1 (1–5) ---
  {
    id: 1,
    batch: 'Batch 1',
    name: 'Indigo & Mango',
    tagline: 'Modern Tech & High-Speed Gadgets',
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceBorder: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    navBg: '#4B3FCF',
    navText: '#FFFFFF',
    ctaBg: '#FFCE6B',
    ctaText: '#1E1B4B',
    accentGold: '#FFCE6B',
    badgeBg: '#EEF2FF',
    badgeText: '#4B3FCF',
    isDark: false,
    swatches: [
      { name: 'Indigo Flame', hex: '#4B3FCF' },
      { name: 'Melted Mango', hex: '#FFCE6B' }
    ]
  },
  {
    id: 2,
    batch: 'Batch 1',
    name: 'Cyberpunk Neon',
    tagline: 'Human Next • Futuristic AI Tech',
    bg: '#0A0A0A',
    surface: '#141414',
    surfaceBorder: '#007BA7',
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    navBg: '#050505',
    navText: '#007BA7',
    ctaBg: '#FF2D95',
    ctaText: '#FFFFFF',
    accentGold: '#007BA7',
    badgeBg: '#007BA720',
    badgeText: '#007BA7',
    isDark: true,
    swatches: [
      { name: 'Jet Black', hex: '#0A0A0A' },
      { name: 'Cerulean Blue', hex: '#007BA7' },
      { name: 'Neon Rose', hex: '#FF2D95' }
    ]
  },
  {
    id: 3,
    batch: 'Batch 1',
    name: 'Royal Editorial',
    tagline: 'Slow is a New Power • Heritage Luxury',
    bg: '#EDF1F5',
    surface: '#FFFFFF',
    surfaceBorder: '#DDE3E8',
    textPrimary: '#3A0F34',
    textSecondary: '#6B4C65',
    navBg: '#3A0F34',
    navText: '#FFFFFF',
    ctaBg: '#EAAA00',
    ctaText: '#2B0B27',
    accentGold: '#EAAA00',
    badgeBg: '#FDF2F8',
    badgeText: '#3A0F34',
    isDark: false,
    swatches: [
      { name: 'Ice Silver', hex: '#DDE3E8' },
      { name: 'Deep Aubergine', hex: '#3A0F34' },
      { name: 'Marigold', hex: '#EAAA00' }
    ]
  },
  {
    id: 4,
    batch: 'Batch 1',
    name: 'Muted Studio',
    tagline: 'Choreo Class • Dance & Studio Movement',
    bg: '#F5F4F2',
    surface: '#FFFFFF',
    surfaceBorder: '#E5E4E2',
    textPrimary: '#6F4E37',
    textSecondary: '#8D7B68',
    navBg: '#0F1A36',
    navText: '#FFFFFF',
    ctaBg: '#E6E0F0',
    ctaText: '#3C2A21',
    accentGold: '#C5A880',
    badgeBg: '#FAF5EF',
    badgeText: '#6F4E37',
    isDark: false,
    swatches: [
      { name: 'Mocha Brown', hex: '#6F4E37' },
      { name: 'Platinum Silver', hex: '#E5E4E2' },
      { name: 'Pale Lavender', hex: '#E6E0F0' }
    ]
  },
  {
    id: 5,
    batch: 'Batch 1',
    name: 'Automotive Power',
    tagline: 'Built Differently • Sports & High Performance',
    bg: '#171717',
    surface: '#222222',
    surfaceBorder: '#2E3A33',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    navBg: '#111111',
    navText: '#F8FAFC',
    ctaBg: '#A31C1B',
    ctaText: '#FFFFFF',
    accentGold: '#2D6A4F',
    badgeBg: '#1F382B',
    badgeText: '#52B788',
    isDark: true,
    swatches: [
      { name: 'Charcoal Black', hex: '#171717' },
      { name: 'Forest Green', hex: '#1F382B' },
      { name: 'Crimson Red', hex: '#A31C1B' }
    ]
  },

  // --- BATCH 2 (6–10) ---
  {
    id: 6,
    batch: 'Batch 2',
    name: 'Pop Art Studio',
    tagline: 'Creative Studio • Bold Ideas & Avant-Garde',
    bg: '#FFFCE0',
    surface: '#FFFFFF',
    surfaceBorder: '#FFE600',
    textPrimary: '#1A1A1A',
    textSecondary: '#4A4A4A',
    navBg: '#1A1A1A',
    navText: '#FFF21A',
    ctaBg: '#A66BFF',
    ctaText: '#FFFFFF',
    accentGold: '#FFF21A',
    badgeBg: '#FFFBE6',
    badgeText: '#9A6B00',
    isDark: false,
    swatches: [
      { name: 'Lemon', hex: '#FFF21A' },
      { name: 'Charcoal Black', hex: '#1A1A1A' },
      { name: 'Electric Lavender', hex: '#A66BFF' }
    ]
  },
  {
    id: 7,
    batch: 'Batch 2',
    name: 'Gold Luxury (Champion)',
    tagline: 'Inner Peace • The 5-Star Concierge Standard',
    bg: '#FCFBF9',
    surface: '#FFFFFF',
    surfaceBorder: '#F4D9A0',
    textPrimary: '#5B4632',
    textSecondary: '#8C7A6B',
    navBg: '#5B4632',
    navText: '#F4D9A0',
    ctaBg: '#C8792C',
    ctaText: '#FFFFFF',
    accentGold: '#F4D9A0',
    badgeBg: '#FFF8ED',
    badgeText: '#B45309',
    isDark: false,
    swatches: [
      { name: 'Mocha Brown', hex: '#5B4632' },
      { name: 'Champagne Gold', hex: '#F4D9A0' },
      { name: 'Burnt Amber', hex: '#C8792C' }
    ]
  },
  {
    id: 8,
    batch: 'Batch 2',
    name: 'Orchard Market',
    tagline: 'Sun-Ripened Goodness • Farm Fresh',
    bg: '#FAF3EA',
    surface: '#FFFFFF',
    surfaceBorder: '#F9EAD7',
    textPrimary: '#2D3748',
    textSecondary: '#718096',
    navBg: '#2E3A23',
    navText: '#FFFFFF',
    ctaBg: '#E10600',
    ctaText: '#FFFFFF',
    accentGold: '#BFE23A',
    badgeBg: '#F0FDF4',
    badgeText: '#15803D',
    isDark: false,
    swatches: [
      { name: 'Soft Peach', hex: '#F9EAD7' },
      { name: 'Lime Green', hex: '#BFE23A' },
      { name: 'Crimson', hex: '#E10600' }
    ]
  },
  {
    id: 9,
    batch: 'Batch 2',
    name: 'Botanical Zen',
    tagline: 'Lotus • Inspiration in Stillness & Spa',
    bg: '#F5EFE6',
    surface: '#FFFFFF',
    surfaceBorder: '#E8DCC6',
    textPrimary: '#1F382E',
    textSecondary: '#4A6B5D',
    navBg: '#1F382E',
    navText: '#E8DCC6',
    ctaBg: '#C8B3E8',
    ctaText: '#1F382E',
    accentGold: '#C8B3E8',
    badgeBg: '#E8F5E9',
    badgeText: '#1F382E',
    isDark: false,
    swatches: [
      { name: 'Oatmeal', hex: '#E8DCC6' },
      { name: 'Pine Green', hex: '#1F382E' },
      { name: 'Soft Lilac', hex: '#C8B3E8' }
    ]
  },
  {
    id: 10,
    batch: 'Batch 2',
    name: 'Plum & Terracotta',
    tagline: 'Cream • Confectionery & Gourmet Artisanal',
    bg: '#FAF3F5',
    surface: '#FFFFFF',
    surfaceBorder: '#C9A0A7',
    textPrimary: '#3A0F34',
    textSecondary: '#704264',
    navBg: '#3A0F34',
    navText: '#FFFFFF',
    ctaBg: '#C75A3A',
    ctaText: '#FFFFFF',
    accentGold: '#C9A0A7',
    badgeBg: '#FDF2F4',
    badgeText: '#C75A3A',
    isDark: false,
    swatches: [
      { name: 'Dusty Mauve', hex: '#C9A0A7' },
      { name: 'Deep Plum', hex: '#3A0F34' },
      { name: 'Terracotta', hex: '#C75A3A' }
    ]
  },

  // --- BATCH 3 (11–15) ---
  {
    id: 11,
    batch: 'Batch 3',
    name: 'Creative Momentum',
    tagline: 'Pop Triad • Modern Dynamic Expression',
    bg: '#F5EEF8',
    surface: '#FFFFFF',
    surfaceBorder: '#E8D8F0',
    textPrimary: '#2E1065',
    textSecondary: '#6B46C1',
    navBg: '#C093E0',
    navText: '#2E1065',
    ctaBg: '#FC3234',
    ctaText: '#FFFFFF',
    accentGold: '#D4FF3F',
    badgeBg: '#F5F3FF',
    badgeText: '#7C3AED',
    isDark: false,
    swatches: [
      { name: 'Lavender', hex: '#C093E0' },
      { name: 'Chartreuse', hex: '#D4FF3F' },
      { name: 'Tomato Red', hex: '#FC3234' }
    ]
  },
  {
    id: 12,
    batch: 'Batch 3',
    name: 'Sound Waves',
    tagline: 'Festival Rave • High Voltage Electronic Beats',
    bg: '#0B0B0B',
    surface: '#181818',
    surfaceBorder: '#262626',
    textPrimary: '#FFFFFF',
    textSecondary: '#A3A3A3',
    navBg: '#000000',
    navText: '#D4FF3F',
    ctaBg: '#FF2D8B',
    ctaText: '#FFFFFF',
    accentGold: '#D4FF3F',
    badgeBg: '#2A081B',
    badgeText: '#FF2D8B',
    isDark: true,
    swatches: [
      { name: 'Jet Black', hex: '#0B0B0B' },
      { name: 'Hot Pink', hex: '#FF2D8B' },
      { name: 'Chartreuse', hex: '#D4FF3F' }
    ]
  },
  {
    id: 13,
    batch: 'Batch 3',
    name: 'Change of Perspective',
    tagline: 'Retro Modern Poster • Editorial Art',
    bg: '#F9EBD7',
    surface: '#FFFFFF',
    surfaceBorder: '#E5D5BF',
    textPrimary: '#0D6A39',
    textSecondary: '#3C5243',
    navBg: '#0D6A39',
    navText: '#F9EBD7',
    ctaBg: '#E84222',
    ctaText: '#FFFFFF',
    accentGold: '#E84222',
    badgeBg: '#E8F5E9',
    badgeText: '#0D6A39',
    isDark: false,
    swatches: [
      { name: 'Warm Ivory', hex: '#F9EBD7' },
      { name: 'Emerald Green', hex: '#0D6A39' },
      { name: 'Vermilion', hex: '#E84222' }
    ]
  },
  {
    id: 14,
    batch: 'Batch 3',
    name: 'Dark Minimalist',
    tagline: 'Better Experiences • Monolith Exhibition',
    bg: '#2A2A2A',
    surface: '#333333',
    surfaceBorder: '#444444',
    textPrimary: '#F5F5F5',
    textSecondary: '#A3A3A3',
    navBg: '#1F1F1F',
    navText: '#FFFFFF',
    ctaBg: '#E10600',
    ctaText: '#FFFFFF',
    accentGold: '#C0C0C0',
    badgeBg: '#3E2020',
    badgeText: '#F87171',
    isDark: true,
    swatches: [
      { name: 'Charcoal Grey', hex: '#2A2A2A' },
      { name: 'Moonlit Silver', hex: '#C0C0C0' },
      { name: 'Signal Red', hex: '#E10600' }
    ]
  },
  {
    id: 15,
    batch: 'Batch 3',
    name: 'Bioluminescent Bloom',
    tagline: 'A Deeper Kind of Beauty • Dark Fantasy',
    bg: '#050505',
    surface: '#121217',
    surfaceBorder: '#2A1B3D',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    navBg: '#3B0A6B',
    navText: '#00E5FF',
    ctaBg: '#00E5FF',
    ctaText: '#050505',
    accentGold: '#00E5FF',
    badgeBg: '#1A0E2B',
    badgeText: '#D8B4FE',
    isDark: true,
    swatches: [
      { name: 'Jet Black', hex: '#050505' },
      { name: 'Royal Amethyst', hex: '#3B0A6B' },
      { name: 'Electric Cyan', hex: '#00E5FF' }
    ]
  },

  // --- BATCH 4 (16–20) ---
  {
    id: 16,
    batch: 'Batch 4',
    name: 'Spaces That Feel Alive',
    tagline: 'Curated Living • Mediterranean Architectural Calm',
    bg: '#F5EFE6',
    surface: '#FFFFFF',
    surfaceBorder: '#E5DCCC',
    textPrimary: '#5A3E2B',
    textSecondary: '#7A6B5D',
    navBg: '#5A3E2B',
    navText: '#F5EFE6',
    ctaBg: '#D5851F',
    ctaText: '#FFFFFF',
    accentGold: '#87A96B',
    badgeBg: '#EDF4E8',
    badgeText: '#3B5E28',
    isDark: false,
    swatches: [
      { name: 'Sage Green', hex: '#87A96B' },
      { name: 'Walnut Brown', hex: '#5A3E2B' },
      { name: 'Amber Glow', hex: '#D5851F' }
    ]
  },
  {
    id: 17,
    batch: 'Batch 4',
    name: 'The Midnight Journal',
    tagline: 'Gothic Literary • Mystery & Red Ribbon',
    bg: '#0F1A36',
    surface: '#162347',
    surfaceBorder: '#273866',
    textPrimary: '#F1F5F9',
    textSecondary: '#AFAF87',
    navBg: '#0B132B',
    navText: '#F1F5F9',
    ctaBg: '#D21319',
    ctaText: '#FFFFFF',
    accentGold: '#AFAF87',
    badgeBg: '#2D1622',
    badgeText: '#F87171',
    isDark: true,
    swatches: [
      { name: 'Midnight Navy', hex: '#101E4A' },
      { name: 'Warm Stone Grey', hex: '#AFAF87' },
      { name: 'Crimson Red', hex: '#D21319' }
    ]
  },
  {
    id: 18,
    batch: 'Batch 4',
    name: 'Nocturne After Dark',
    tagline: 'Culture in Motion • Underground Club Night',
    bg: '#080708',
    surface: '#151318',
    surfaceBorder: '#2D1F3B',
    textPrimary: '#FFFFFF',
    textSecondary: '#A3A3A3',
    navBg: '#050405',
    navText: '#4E50DE',
    ctaBg: '#F32E35',
    ctaText: '#FFFFFF',
    accentGold: '#4E50DE',
    badgeBg: '#1E1528',
    badgeText: '#A5B4FC',
    isDark: true,
    swatches: [
      { name: 'Deep Black', hex: '#080708' },
      { name: 'Neon Red', hex: '#F32E35' },
      { name: 'Indigo', hex: '#4E50DE' }
    ]
  },
  {
    id: 19,
    batch: 'Batch 4',
    name: 'Rooted in Goodness',
    tagline: 'Pure Ingredients • Bold Botanical Contrast',
    bg: '#7E60EB',
    surface: '#FFFFFF',
    surfaceBorder: '#E2E8F0',
    textPrimary: '#000000',
    textSecondary: '#4A5568',
    navBg: '#000000',
    navText: '#FFFFFF',
    ctaBg: '#FF5A5F',
    ctaText: '#FFFFFF',
    accentGold: '#FF5A5F',
    badgeBg: '#FEE2E2',
    badgeText: '#991B1B',
    isDark: false,
    swatches: [
      { name: 'Periwinkle', hex: '#7E60EB' },
      { name: 'Pure Black', hex: '#000000' },
      { name: 'Coral Red', hex: '#FF5A5F' }
    ]
  },
  {
    id: 20,
    batch: 'Batch 4',
    name: 'Lumen Creative Journal',
    tagline: '1970s Nostalgia • Retro Editorial Warmth',
    bg: '#E6D5BD',
    surface: '#F5EADB',
    surfaceBorder: '#D8C2A5',
    textPrimary: '#101010',
    textSecondary: '#4A4A4A',
    navBg: '#101010',
    navText: '#E6D5BD',
    ctaBg: '#D5360C',
    ctaText: '#FFFFFF',
    accentGold: '#D5360C',
    badgeBg: '#FDF0ED',
    badgeText: '#9A2508',
    isDark: false,
    swatches: [
      { name: 'Burnt Orange', hex: '#D5360C' },
      { name: 'Warm Ivory', hex: '#E6D5BD' },
      { name: 'Soft Black', hex: '#101010' }
    ]
  },

  // --- BATCH 5 (21–25) ---
  {
    id: 21,
    batch: 'Batch 5',
    name: 'Bloom Editorial Blue',
    tagline: 'Modern Trust • High-Conversion Lifestyle Marketplace',
    bg: '#F5F3ED',
    surface: '#FFFFFF',
    surfaceBorder: '#E5E1D5',
    textPrimary: '#226192',
    textSecondary: '#4E738F',
    navBg: '#226192',
    navText: '#FFFFFF',
    ctaBg: '#EF8557',
    ctaText: '#FFFFFF',
    accentGold: '#EF8557',
    badgeBg: '#EFF6FF',
    badgeText: '#1E40AF',
    isDark: false,
    swatches: [
      { name: 'Warm Ivory', hex: '#EAE6DE' },
      { name: 'Deep Editorial Blue', hex: '#226192' },
      { name: 'Coral Orange', hex: '#EF8557' }
    ]
  },
  {
    id: 22,
    batch: 'Batch 5',
    name: 'Strawberry Citrus',
    tagline: 'Good Fruits Brighter Days • Fresh Summer Energy',
    bg: '#FEF2F4',
    surface: '#FFFFFF',
    surfaceBorder: '#FDA2AC',
    textPrimary: '#881337',
    textSecondary: '#9F1239',
    navBg: '#CB0E31',
    navText: '#FFFFFF',
    ctaBg: '#8AD62C',
    ctaText: '#1A2E05',
    accentGold: '#FDA2AC',
    badgeBg: '#F0FDF4',
    badgeText: '#15803D',
    isDark: false,
    swatches: [
      { name: 'Soft Strawberry Pink', hex: '#FDA2AC' },
      { name: 'Vibrant Crimson Red', hex: '#CB0E31' },
      { name: 'Lime Green', hex: '#8AD62C' }
    ]
  },
  {
    id: 23,
    batch: 'Batch 5',
    name: 'Blue in Full Bloom',
    tagline: 'Deep Cobalt Floral • Dramatic Botanical Contrast',
    bg: '#050E29',
    surface: '#0B1C4D',
    surfaceBorder: '#1A3480',
    textPrimary: '#FFFFFF',
    textSecondary: '#93C5FD',
    navBg: '#021861',
    navText: '#FFFFFF',
    ctaBg: '#DE1110',
    ctaText: '#FFFFFF',
    accentGold: '#255DCE',
    badgeBg: '#1E293B',
    badgeText: '#60A5FA',
    isDark: true,
    swatches: [
      { name: 'Midnight Navy', hex: '#021861' },
      { name: 'Cobalt Blue', hex: '#255DCE' },
      { name: 'Bright Red', hex: '#DE1110' }
    ]
  },
  {
    id: 24,
    batch: 'Batch 5',
    name: 'We Observe What Remains',
    tagline: 'Cinematic Dystopian Film • Earth Moody',
    bg: '#0F0E0B',
    surface: '#1A1813',
    surfaceBorder: '#332E24',
    textPrimary: '#E2DFD6',
    textSecondary: '#A39E8F',
    navBg: '#090907',
    navText: '#E2DFD6',
    ctaBg: '#899D73',
    ctaText: '#1A1813',
    accentGold: '#6C5636',
    badgeBg: '#212019',
    badgeText: '#C4BEA9',
    isDark: true,
    swatches: [
      { name: 'Charcoal', hex: '#090907' },
      { name: 'Earth Brown', hex: '#6C5636' },
      { name: 'Burnt Amber', hex: '#899D73' }
    ]
  },
  {
    id: 25,
    batch: 'Batch 5',
    name: 'Lumora Electric Teal',
    tagline: 'Designing What Feels Alive • Organic Luminous',
    bg: '#061312',
    surface: '#0C2120',
    surfaceBorder: '#163B39',
    textPrimary: '#F0FDFA',
    textSecondary: '#99F6E4',
    navBg: '#031211',
    navText: '#00AEB8',
    ctaBg: '#00AEB8',
    ctaText: '#031211',
    accentGold: '#00AEB8',
    badgeBg: '#082624',
    badgeText: '#2DD4BF',
    isDark: true,
    swatches: [
      { name: 'Ink Black', hex: '#031211' },
      { name: 'Warm Ivory', hex: '#E8E4D3' },
      { name: 'Electric Teal', hex: '#00AEB8' }
    ]
  },

  // --- BATCH 6 (26–30) ---
  {
    id: 26,
    batch: 'Batch 6',
    name: 'Cosmic Latte',
    tagline: 'Artisanal Coffee & Rich Roasted Burgundy',
    bg: '#F5EFE8',
    surface: '#FFFFFF',
    surfaceBorder: '#E8DCC6',
    textPrimary: '#722F37',
    textSecondary: '#8F575E',
    navBg: '#722F37',
    navText: '#FFFFFF',
    ctaBg: '#B7A89A',
    ctaText: '#3B171C',
    accentGold: '#B7A89A',
    badgeBg: '#FDF4F5',
    badgeText: '#722F37',
    isDark: false,
    swatches: [
      { name: 'Cosmic Latte', hex: '#B7A89A' },
      { name: 'Mocha Cream', hex: '#E8DCC6' },
      { name: 'Deep Burgundy', hex: '#722F37' }
    ]
  },
  {
    id: 27,
    batch: 'Batch 6',
    name: 'Verdane Living Green',
    tagline: 'Indoor Terrarium & Concrete Modern Living',
    bg: '#F1F3EE',
    surface: '#FFFFFF',
    surfaceBorder: '#D8DDD3',
    textPrimary: '#2E3A25',
    textSecondary: '#5A6E4F',
    navBg: '#3F4F33',
    navText: '#FFFFFF',
    ctaBg: '#CC5500',
    ctaText: '#FFFFFF',
    accentGold: '#9CAF88',
    badgeBg: '#F2F6EF',
    badgeText: '#2E3A25',
    isDark: false,
    swatches: [
      { name: 'Sage Green', hex: '#9CAF88' },
      { name: 'Concrete Grey', hex: '#A7A7A7' },
      { name: 'Burnt Amber', hex: '#CC5500' }
    ]
  },
  {
    id: 28,
    batch: 'Batch 6',
    name: 'Velara Fine Jewellery',
    tagline: 'Midnight Velvet & High-Carat Diamond Luxury',
    bg: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceBorder: '#E2E8F0',
    textPrimary: '#000000',
    textSecondary: '#475569',
    navBg: '#000000',
    navText: '#FFFFFF',
    ctaBg: '#2C3480',
    ctaText: '#FFFFFF',
    accentGold: '#2C3480',
    badgeBg: '#EEF2FF',
    badgeText: '#2C3480',
    isDark: false,
    swatches: [
      { name: 'Black', hex: '#000000' },
      { name: 'Cobalt Blue Deep', hex: '#2C3480' },
      { name: 'White', hex: '#FFFFFF' }
    ]
  },
  {
    id: 29,
    batch: 'Batch 6',
    name: 'Vela Chocolate & Cream',
    tagline: 'Gourmet Chocolates • Rich Truffles & Amber',
    bg: '#FAF6EE',
    surface: '#FFFFFF',
    surfaceBorder: '#EFE7D8',
    textPrimary: '#4E342E',
    textSecondary: '#795548',
    navBg: '#4E342E',
    navText: '#FFFFFF',
    ctaBg: '#CC5500',
    ctaText: '#FFFFFF',
    accentGold: '#D7CCC8',
    badgeBg: '#FFF7ED',
    badgeText: '#C2410C',
    isDark: false,
    swatches: [
      { name: 'Chocolate Brown', hex: '#4E342E' },
      { name: 'Burnt Orange', hex: '#CC5500' },
      { name: 'Warm Cream', hex: '#F8F4E7' }
    ]
  },
  {
    id: 30,
    batch: 'Batch 6',
    name: 'Lumiere Scented Fragrance',
    tagline: 'Fragrances That Feel Like Home • Warm Wax Candle',
    bg: '#FAF4F1',
    surface: '#FFFFFF',
    surfaceBorder: '#EEDDD4',
    textPrimary: '#5C242B',
    textSecondary: '#8C4D56',
    navBg: '#5C242B',
    navText: '#FFFFFF',
    ctaBg: '#D7A7B1',
    ctaText: '#3B1017',
    accentGold: '#D7A7B1',
    badgeBg: '#FDF2F4',
    badgeText: '#9F1239',
    isDark: false,
    swatches: [
      { name: 'Burgundy', hex: '#722F37' },
      { name: 'Dusty Pink', hex: '#D7A7B1' },
      { name: 'Warm Cream', hex: '#F8F4E7' }
    ]
  }
]

export default function ThemePreviewPage() {
  const searchParams = useSearchParams()
  const initialThemeId = searchParams?.get('theme') ? parseInt(searchParams.get('theme')!) : 4
  const [selectedThemeId, setSelectedThemeId] = useState<number>(initialThemeId || 4)
  const [filterBatch, setFilterBatch] = useState<string>('All')

  // Find base preset
  const basePreset = THEMES.find((t) => t.id === selectedThemeId) || THEMES[3]

  // LIVE EDITABLE THEME STATE (User can tweak any color in real-time)
  const [activeTheme, setActiveTheme] = useState<ThemeConfig>(basePreset)
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(true)
  const [copiedType, setCopiedType] = useState<string | null>(null)

  // LIVE EDITABLE CONTENT STATE (User can customize headings & CTA text)
  const [content, setContent] = useState({
    logoText: 'RentKart',
    pillText: "India's 1st Luxury 3D Rental Hub",
    headlineMain: 'Rent Exceptional Assets.',
    headlineHighlight: 'Zero Ownership Hassle.',
    subheadline: 'Access cinema gear, designer couture, Apple workstations, and grand banquets with instant Aadhaar verification, doorstep delivery, and zero security deposit.',
    primaryCtaText: 'Rent Assets Now',
    secondaryCtaText: 'Explore Categories',
    spotlightTitle: 'Sony Cinema FX3 & G-Master Kit',
    spotlightPrice: '₹2,999',
    spotlightUnit: '/day',
    spotlightCtaText: 'Instant Rent'
  })

  // When selected preset changes, reset activeTheme to that preset
  useEffect(() => {
    const nextPreset = THEMES.find((t) => t.id === selectedThemeId) || THEMES[6]
    setActiveTheme({ ...nextPreset })
  }, [selectedThemeId])

  const batches = ['All', 'Batch 1', 'Batch 2', 'Batch 3', 'Batch 4', 'Batch 5', 'Batch 6']
  const filteredThemes = filterBatch === 'All' ? THEMES : THEMES.filter((t) => t.batch === filterBatch)

  const handleColorChange = (key: keyof ThemeConfig, value: string) => {
    setActiveTheme((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const handleResetToPreset = () => {
    setActiveTheme({ ...basePreset })
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 2500)
  }

  const tailwindSnippet = `// tailwind.config.ts (Theme: ${activeTheme.name})
module.exports = {
  theme: {
    extend: {
      colors: {
        canvas: '${activeTheme.bg}',
        surface: '${activeTheme.surface}',
        'surface-border': '${activeTheme.surfaceBorder}',
        'text-primary': '${activeTheme.textPrimary}',
        'text-secondary': '${activeTheme.textSecondary}',
        'nav-bg': '${activeTheme.navBg}',
        'nav-text': '${activeTheme.navText}',
        'cta-primary': '${activeTheme.ctaBg}',
        'cta-text': '${activeTheme.ctaText}',
        'accent-gold': '${activeTheme.accentGold}',
        'badge-bg': '${activeTheme.badgeBg}',
        'badge-text': '${activeTheme.badgeText}',
      }
    }
  }
}`

  const cssVariablesSnippet = `/* globals.css (Theme: ${activeTheme.name}) */
:root {
  --bg-canvas: ${activeTheme.bg};
  --bg-surface: ${activeTheme.surface};
  --border-surface: ${activeTheme.surfaceBorder};
  --text-primary: ${activeTheme.textPrimary};
  --text-secondary: ${activeTheme.textSecondary};
  --nav-bg: ${activeTheme.navBg};
  --nav-text: ${activeTheme.navText};
  --cta-bg: ${activeTheme.ctaBg};
  --cta-text: ${activeTheme.ctaText};
  --accent-gold: ${activeTheme.accentGold};
  --badge-bg: ${activeTheme.badgeBg};
  --badge-text: ${activeTheme.badgeText};
}`

  const sampleProducts = [
    {
      id: 'cam-1',
      title: 'Sony Cinema FX3 & G-Master Kit',
      category: 'Cameras & Rigs',
      price: '₹2,999',
      unit: '/day',
      rating: '4.98',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
      tag: 'CREATOR PRO'
    },
    {
      id: 'fash-1',
      title: 'Royal Bridal Velvet Lehenga Couture',
      category: 'Wedding Fashion',
      price: '₹3,499',
      unit: '/day',
      rating: '5.0',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600',
      tag: 'HERITAGE ROYAL'
    },
    {
      id: 'tech-1',
      title: 'Apple MacBook Pro M3 Max 128GB',
      category: 'Workstations & Tech',
      price: '₹1,499',
      unit: '/day',
      rating: '4.95',
      image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=600',
      tag: 'DEVELOPER POWER'
    },
    {
      id: 'hall-1',
      title: 'Grand Regal Banquet & Reception Lawn',
      category: 'Banquet Halls',
      price: '₹24,999',
      unit: '/day',
      rating: '4.92',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600',
      tag: 'GRAND OCCASIONS'
    }
  ]

  return (
    <div 
      className="min-h-screen flex flex-col font-sans transition-colors duration-200 relative overflow-hidden" 
      style={{ 
        backgroundColor: activeTheme.bg,
        backgroundImage: `
          radial-gradient(circle at 18% 12%, ${activeTheme.accentGold}25 0%, transparent 45%),
          radial-gradient(circle at 82% 16%, ${activeTheme.ctaBg}60 0%, transparent 48%),
          radial-gradient(circle at 50% 50%, ${activeTheme.badgeBg}80 0%, transparent 55%),
          radial-gradient(circle at 12% 78%, ${activeTheme.accentGold}20 0%, transparent 45%),
          radial-gradient(circle at 88% 85%, ${activeTheme.ctaBg}50 0%, transparent 50%)
        `
      }}
    >
      {/* Ambient Floating Orbs for Live Theme Preview */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
        <div 
          className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full animate-float-orb-1"
          style={{
            background: `radial-gradient(circle, ${activeTheme.accentGold}35 0%, transparent 70%)`,
            filter: 'blur(90px)'
          }}
        />
        <div 
          className="absolute top-20 -right-24 w-[600px] h-[600px] rounded-full animate-float-orb-2"
          style={{
            background: `radial-gradient(circle, ${activeTheme.ctaBg}70 0%, transparent 70%)`,
            filter: 'blur(100px)'
          }}
        />
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(${activeTheme.textPrimary}18 1.25px, transparent 1.25px)`,
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse 90% 80% at 50% 35%, black 40%, transparent 95%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 35%, black 40%, transparent 95%)'
          }}
        />
      </div>
      
      {/* =========================================================================
          TOP DOCK: PRESET SELECTOR & LIVE EDITOR TOGGLE
         ========================================================================= */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md text-white border-b border-slate-800 shadow-2xl py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center">
                <Paintbrush className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-2">
                  <span>RentKart Live Theme Studio & Editor</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Live Editable Component
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">
                  Select any preset below, or open the Live Customizer to edit any color & text in real time
                </p>
              </div>
            </div>

            {/* Actions: Toggle Editor, Copy Config */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditorOpen(!isEditorOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isEditorOpen 
                    ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-400/50' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isEditorOpen ? 'Hide Editor Panel' : 'Edit Theme Colors & Text'}</span>
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(tailwindSnippet, 'tailwind')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
              >
                {copiedType === 'tailwind' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'tailwind' ? 'Copied Tailwind!' : 'Copy Tailwind'}</span>
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(cssVariablesSnippet, 'css')}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
              >
                {copiedType === 'css' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code2 className="w-3.5 h-3.5" />}
                <span>{copiedType === 'css' ? 'Copied CSS!' : 'Copy CSS'}</span>
              </button>
            </div>
          </div>

          {/* Batch Selector Filters */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
              {batches.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setFilterBatch(b)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    filterBatch === b
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 font-mono hidden lg:flex items-center gap-2">
              <span>Selected Preset:</span>
              <span className="font-bold text-amber-300">#{activeTheme.id} {activeTheme.name}</span>
            </div>
          </div>

          {/* Presets Horizontal Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
            {filteredThemes.map((t) => {
              const isSelected = t.id === selectedThemeId
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedThemeId(t.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-900 border-amber-400 ring-2 ring-amber-400/50 shadow-lg scale-102'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex -space-x-1.5 items-center">
                    {t.swatches.map((sw, idx) => (
                      <span
                        key={idx}
                        className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-xs"
                        style={{ backgroundColor: sw.hex }}
                        title={`${sw.name}: ${sw.hex}`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">#{t.id}</span>
                  <span className="truncate max-w-[110px]">{t.name}</span>
                </button>
              )
            })}
          </div>

        </div>
      </header>

      {/* =========================================================================
          LIVE EDITABLE CONTROLS DRAWER / ACCORDION (COLOR & TEXT CUSTOMIZER)
         ========================================================================= */}
      {isEditorOpen && (
        <section className="bg-slate-900 border-b border-amber-400/30 text-white px-4 sm:px-6 py-4 shadow-2xl transition-all animate-in slide-in-from-top-4 duration-300">
          <div className="max-w-7xl mx-auto space-y-4">
            
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-3">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-300">
                <Sliders className="w-4 h-4" />
                <span>Live Theme Color & Content Customizer</span>
                <span className="text-slate-500 font-normal">| Changes reflect instantly on the page below</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToPreset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Preset Default</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                  title="Close Drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Color Pickers Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              
              {/* 1. Background Canvas */}
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-300">Canvas Base (bg)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeTheme.bg}
                    onChange={(e) => handleColorChange('bg', e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={activeTheme.bg}
                    onChange={(e) => handleColorChange('bg', e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-amber-300 outline-none"
                  />
                </div>
              </div>

              {/* 2. Surface / Card */}
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-300">Card Surface (surface)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeTheme.surface}
                    onChange={(e) => handleColorChange('surface', e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={activeTheme.surface}
                    onChange={(e) => handleColorChange('surface', e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-amber-300 outline-none"
                  />
                </div>
              </div>

              {/* 3. Surface Border */}
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-300">Card Border</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeTheme.surfaceBorder}
                    onChange={(e) => handleColorChange('surfaceBorder', e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={activeTheme.surfaceBorder}
                    onChange={(e) => handleColorChange('surfaceBorder', e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-amber-300 outline-none"
                  />
                </div>
              </div>

              {/* 4. Text Primary */}
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-300">Heading & Text</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeTheme.textPrimary}
                    onChange={(e) => handleColorChange('textPrimary', e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={activeTheme.textPrimary}
                    onChange={(e) => handleColorChange('textPrimary', e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-amber-300 outline-none"
                  />
                </div>
              </div>

              {/* 5. Primary CTA (Button) */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/40 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-amber-300">Primary CTA (ctaBg)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeTheme.ctaBg}
                    onChange={(e) => handleColorChange('ctaBg', e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={activeTheme.ctaBg}
                    onChange={(e) => handleColorChange('ctaBg', e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-amber-300 outline-none"
                  />
                </div>
              </div>

              {/* 6. CTA Button Text */}
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-300">CTA Text Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeTheme.ctaText}
                    onChange={(e) => handleColorChange('ctaText', e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={activeTheme.ctaText}
                    onChange={(e) => handleColorChange('ctaText', e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-amber-300 outline-none"
                  />
                </div>
              </div>

              {/* 7. Navbar Background */}
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-300">Navbar (navBg)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeTheme.navBg}
                    onChange={(e) => handleColorChange('navBg', e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={activeTheme.navBg}
                    onChange={(e) => handleColorChange('navBg', e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-amber-300 outline-none"
                  />
                </div>
              </div>

              {/* 8. Navbar Text */}
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-300">Navbar Text</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeTheme.navText}
                    onChange={(e) => handleColorChange('navText', e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={activeTheme.navText}
                    onChange={(e) => handleColorChange('navText', e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-amber-300 outline-none"
                  />
                </div>
              </div>

              {/* 9. Accent Gold */}
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-300">Accent Gold</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeTheme.accentGold}
                    onChange={(e) => handleColorChange('accentGold', e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={activeTheme.accentGold}
                    onChange={(e) => handleColorChange('accentGold', e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-amber-300 outline-none"
                  />
                </div>
              </div>

              {/* 10. Badge Background */}
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-300">Badge Background</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeTheme.badgeBg}
                    onChange={(e) => handleColorChange('badgeBg', e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={activeTheme.badgeBg}
                    onChange={(e) => handleColorChange('badgeBg', e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-amber-300 outline-none"
                  />
                </div>
              </div>

              {/* 11. Badge Text */}
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-300">Badge Text</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeTheme.badgeText}
                    onChange={(e) => handleColorChange('badgeText', e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={activeTheme.badgeText}
                    onChange={(e) => handleColorChange('badgeText', e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-amber-300 outline-none"
                  />
                </div>
              </div>

              {/* 12. Text Secondary */}
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-300">Secondary Text</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeTheme.textSecondary}
                    onChange={(e) => handleColorChange('textSecondary', e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={activeTheme.textSecondary}
                    onChange={(e) => handleColorChange('textSecondary', e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-amber-300 outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Editable Content Fields */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Headline Text
                </label>
                <input
                  type="text"
                  value={content.headlineMain}
                  onChange={(e) => setContent({ ...content, headlineMain: e.target.value })}
                  className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Headline Highlight Phrase
                </label>
                <input
                  type="text"
                  value={content.headlineHighlight}
                  onChange={(e) => setContent({ ...content, headlineHighlight: e.target.value })}
                  className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-300 font-bold outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={content.primaryCtaText}
                  onChange={(e) => setContent({ ...content, primaryCtaText: e.target.value })}
                  className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>

          </div>
        </section>
      )}

      {/* =========================================================================
          LIVE SIMULATED RENTKART MAIN PAGE (RESPONSIVE & EDITABLE)
         ========================================================================= */}
      
      {/* 1. Simulated Themed Navbar */}
      <nav 
        className="w-full shadow-md transition-colors duration-200"
        style={{ backgroundColor: activeTheme.navBg, color: activeTheme.navText }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2 font-black text-xl tracking-tight">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center font-mono text-sm" style={{ backgroundColor: activeTheme.ctaBg, color: activeTheme.ctaText }}>
              {content.logoText.charAt(0)}
            </span>
            <span>{content.logoText}</span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl items-center relative">
            <input 
              type="text" 
              placeholder="Search cameras, wedding couture, MacBooks, banquet halls..."
              readOnly
              className="w-full py-2.5 pl-10 pr-4 rounded-full text-xs outline-none bg-white/95 text-slate-800 placeholder-slate-400 shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 text-xs font-bold">
            <button 
              className="hidden sm:inline-flex px-3.5 py-2 rounded-xl transition-all"
              style={{ backgroundColor: `${activeTheme.navText}15`, color: activeTheme.navText }}
            >
              List Your Gear
            </button>
            <button 
              className="px-4 py-2 rounded-xl font-black uppercase text-[11px] tracking-wider shadow-sm transition-all"
              style={{ backgroundColor: activeTheme.ctaBg, color: activeTheme.ctaText }}
            >
              Sign In
            </button>
          </div>

        </div>
      </nav>

      {/* 2. Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* Hero Section */}
        <section 
          className="rounded-3xl p-6 sm:p-10 border transition-all duration-200 shadow-xl relative overflow-hidden"
          style={{ 
            backgroundColor: activeTheme.surface, 
            borderColor: activeTheme.surfaceBorder,
            color: activeTheme.textPrimary 
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Value Proposition */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Trust Pill */}
              <div 
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-xs"
                style={{ 
                  backgroundColor: activeTheme.badgeBg, 
                  color: activeTheme.badgeText,
                  borderColor: `${activeTheme.badgeText}30`
                }}
              >
                <Sparkles className="w-3 h-3" />
                <span>{content.pillText}</span>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeTheme.ctaBg }} />
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.12]">
                {content.headlineMain}{' '}
                <span style={{ color: activeTheme.ctaBg }}>
                  {content.headlineHighlight}
                </span>
              </h1>

              <p className="text-sm font-medium leading-relaxed" style={{ color: activeTheme.textSecondary }}>
                {content.subheadline}
              </p>

              {/* Guarantees */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                {[
                  { icon: ShieldCheck, text: '₹0 Security Deposit' },
                  { icon: Zap, text: 'Instant 30-Min Dispatch' },
                  { icon: Star, text: 'Aadhaar Verified' }
                ].map((g, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border"
                    style={{ 
                      backgroundColor: activeTheme.badgeBg, 
                      color: activeTheme.badgeText, 
                      borderColor: `${activeTheme.badgeText}25` 
                    }}
                  >
                    <g.icon className="w-3.5 h-3.5" />
                    <span>{g.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Group */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button 
                  className="px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-transform hover:scale-102 active:scale-98 cursor-pointer"
                  style={{ backgroundColor: activeTheme.ctaBg, color: activeTheme.ctaText }}
                >
                  <span>{content.primaryCtaText}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button 
                  className="px-5 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider border transition-all hover:bg-black/5"
                  style={{ borderColor: activeTheme.surfaceBorder, color: activeTheme.textPrimary }}
                >
                  {content.secondaryCtaText}
                </button>
              </div>

            </div>

            {/* Right Spotlight 3D Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div 
                className="w-full max-w-md rounded-2xl p-4 border shadow-2xl transition-all"
                style={{ 
                  backgroundColor: activeTheme.isDark ? '#1C1C1E' : '#FFFFFF', 
                  borderColor: activeTheme.accentGold 
                }}
              >
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span 
                    className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: activeTheme.badgeBg, color: activeTheme.badgeText }}
                  >
                    CREATOR TIER
                  </span>
                  <div className="flex items-center gap-1 font-mono font-bold text-emerald-600">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>4.98</span>
                    <span className="text-[10px] text-slate-400">(342 rentals)</span>
                  </div>
                </div>

                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 mb-3 shadow-inner">
                  <Image 
                    src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600" 
                    alt="Sony Cinema FX3"
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <span className="text-[9px] uppercase tracking-wider font-mono" style={{ color: activeTheme.accentGold }}>
                      Pro Cine & Camera Rigs
                    </span>
                    <h3 className="text-sm font-black text-white">
                      {content.spotlightTitle}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: activeTheme.surfaceBorder }}>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider block font-bold" style={{ color: activeTheme.textSecondary }}>
                      Daily Rental Rate
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black font-mono" style={{ color: activeTheme.textPrimary }}>
                        {content.spotlightPrice}
                      </span>
                      <span className="text-xs font-bold" style={{ color: activeTheme.textSecondary }}>
                        {content.spotlightUnit}
                      </span>
                    </div>
                  </div>

                  <button 
                    className="px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5"
                    style={{ backgroundColor: activeTheme.ctaBg, color: activeTheme.ctaText }}
                  >
                    <span>{content.spotlightCtaText}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Featured Rental Catalog Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: activeTheme.textPrimary }}>
                Spotlight Rental Catalog
              </h2>
              <p className="text-xs font-medium" style={{ color: activeTheme.textSecondary }}>
                Curated high-demand assets available with same-day dispatch
              </p>
            </div>
            <span 
              className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              style={{ color: activeTheme.ctaBg }}
            >
              <span>View All Assets</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {sampleProducts.map((p) => (
              <div 
                key={p.id}
                className="rounded-2xl p-3.5 border transition-all duration-200 hover:-translate-y-1 shadow-md hover:shadow-xl group"
                style={{ 
                  backgroundColor: activeTheme.surface, 
                  borderColor: activeTheme.surfaceBorder,
                  color: activeTheme.textPrimary 
                }}
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-3">
                  <Image 
                    src={p.image} 
                    alt={p.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="300px"
                  />
                  <span 
                    className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-xs"
                    style={{ backgroundColor: activeTheme.badgeBg, color: activeTheme.badgeText }}
                  >
                    {p.tag}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider block" style={{ color: activeTheme.textSecondary }}>
                    {p.category}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold line-clamp-1" style={{ color: activeTheme.textPrimary }}>
                    {p.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t" style={{ borderColor: activeTheme.surfaceBorder }}>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-base font-black" style={{ color: activeTheme.textPrimary }}>{p.price}</span>
                    <span className="text-[10px] font-bold" style={{ color: activeTheme.textSecondary }}>{p.unit}</span>
                  </div>

                  <button 
                    className="px-3 py-1.5 rounded-lg font-black text-[11px] uppercase tracking-wider shadow-xs transition-transform active:scale-95"
                    style={{ backgroundColor: activeTheme.ctaBg, color: activeTheme.ctaText }}
                  >
                    Rent Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live Active Theme Spec Sheet */}
        <section 
          className="rounded-2xl p-5 border text-xs space-y-3"
          style={{ 
            backgroundColor: activeTheme.surface, 
            borderColor: activeTheme.surfaceBorder,
            color: activeTheme.textPrimary 
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4" style={{ color: activeTheme.ctaBg }} />
              Live Theme Color Values (Ready for Tailwind / CSS)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(tailwindSnippet, 'tailwind')}
                className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border cursor-pointer"
                style={{ borderColor: activeTheme.surfaceBorder, color: activeTheme.textPrimary }}
              >
                Copy Tailwind
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(cssVariablesSnippet, 'css')}
                className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border cursor-pointer"
                style={{ borderColor: activeTheme.surfaceBorder, color: activeTheme.textPrimary }}
              >
                Copy CSS
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
            {[
              { label: 'Canvas (bg)', val: activeTheme.bg },
              { label: 'Card Surface', val: activeTheme.surface },
              { label: 'Card Border', val: activeTheme.surfaceBorder },
              { label: 'Text Primary', val: activeTheme.textPrimary },
              { label: 'Text Secondary', val: activeTheme.textSecondary },
              { label: 'Navbar Bg', val: activeTheme.navBg },
              { label: 'Navbar Text', val: activeTheme.navText },
              { label: 'Primary CTA', val: activeTheme.ctaBg },
              { label: 'CTA Text', val: activeTheme.ctaText },
              { label: 'Accent Gold', val: activeTheme.accentGold },
              { label: 'Badge Bg', val: activeTheme.badgeBg },
              { label: 'Badge Text', val: activeTheme.badgeText },
            ].map((item, i) => (
              <div key={i} className="p-2.5 rounded-xl border flex flex-col gap-1.5" style={{ borderColor: activeTheme.surfaceBorder }}>
                <div className="w-full h-8 rounded-lg border shadow-xs" style={{ backgroundColor: item.val }} />
                <span className="font-bold text-[11px] truncate">{item.label}</span>
                <span className="font-mono text-[10px] opacity-75">{item.val}</span>
              </div>
            ))}
          </div>
        </section>

      </main>

    </div>
  )
}
