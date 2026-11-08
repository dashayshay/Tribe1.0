import React from 'react';
import { OrbitMap, OverlappingNiches } from './networkSections.jsx';
import { IdentityCard, PendingFeedback, VibeCloud, ReservedSpots, NicheList } from './profileSections.jsx';

const Scroll = ({ children }) => <div className="flex-1 overflow-y-auto px-5 pt-3 pb-28 space-y-4">{children}</div>;

/** Variant A — profile and network share one long tab. */
export function MyTribeView() {
  return (
    <Scroll>
      <IdentityCard />
      <PendingFeedback />
      <OrbitMap />
      <OverlappingNiches />
      <VibeCloud />
      <ReservedSpots />
      <NicheList />
    </Scroll>
  );
}

/** Variant B — dedicated Network tab. */
export function NetworkView() {
  return (
    <Scroll>
      <OrbitMap />
      <OverlappingNiches />
    </Scroll>
  );
}

/** Variant B — dedicated Profile tab. */
export function ProfileView() {
  return (
    <Scroll>
      <IdentityCard />
      <PendingFeedback />
      <ReservedSpots />
      <VibeCloud />
      <NicheList />
    </Scroll>
  );
}
