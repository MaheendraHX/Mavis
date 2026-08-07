import React from 'react';
import { Nav } from '../components/landing/Nav';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { HowItWorks } from '../components/landing/HowItWorks';
import { TechStack } from '../components/landing/TechStack';
import { CallToAction } from '../components/landing/CallToAction';
import { Footer } from '../components/landing/Footer';

export function Landing() {
  return (
    <div className="min-h-screen w-full bg-cream">
      <Nav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <TechStack />
        <CallToAction />
      </main>
      <Footer />
    </div>);

}