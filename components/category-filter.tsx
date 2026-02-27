'use client'

import { Button } from '@/components/ui/button'

interface CategoryFilterProps {
  selected: string
  onSelect: (category: string) => void
}

const CATEGORIES = [
  { id: 'all', label: 'All Events', icon: '🎯' },
  { id: 'concert', label: 'Concerts', icon: '🎵' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'movie', label: 'Movies', icon: '🎬' },
  { id: 'conference', label: 'Conferences', icon: '🎤' },
  { id: 'theater', label: 'Theater', icon: '🎭' },
  { id: 'workshop', label: 'Workshops', icon: '✨' },
]

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
      <div className="flex flex-wrap gap-3">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
              selected === category.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
