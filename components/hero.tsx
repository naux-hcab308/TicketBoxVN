'use client'

import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-primary via-primary to-accent py-20 text-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                Find Your Next
                <span className="block text-accent">Amazing Event</span>
              </h1>
              <p className="text-lg text-white/80">
                Discover concerts, conferences, sports, movies, plays and more. Book your tickets now and create unforgettable memories.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="secondary">
                Explore Events
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
              <div>
                <div className="text-2xl font-bold">10K+</div>
                <p className="text-sm text-white/70">Events</p>
              </div>
              <div>
                <div className="text-2xl font-bold">500K+</div>
                <p className="text-sm text-white/70">Users</p>
              </div>
              <div>
                <div className="text-2xl font-bold">1M+</div>
                <p className="text-sm text-white/70">Tickets Sold</p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="hidden md:flex justify-center">
            <div className="relative w-full h-96 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">🎭</div>
                <p className="text-white font-semibold">Concerts • Sports</p>
                <p className="text-white/70 text-sm">Movies • Conferences • Shows</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
