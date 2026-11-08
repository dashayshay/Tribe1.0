import React, { useEffect, useState } from 'react';
import { TribeProvider, useTribe } from './state/TribeContext.jsx';
import { StatusBar, Toast, BottomNav } from './components/Chrome.jsx';
import ExperimentLab from './components/ExperimentLab.jsx';
import ExploreView from './views/ExploreView.jsx';
import ExclusiveView from './views/ExclusiveView.jsx';
import HostHubView from './views/HostHubView.jsx';
import { MyTribeView, NetworkView, ProfileView } from './views/TribeViews.jsx';
import EventDetail from './sheets/EventDetail.jsx';
import CreateEventSheet from './sheets/CreateEventSheet.jsx';
import Onboarding, { NichesSheet } from './sheets/Onboarding.jsx';
import FeedbackSheet from './sheets/FeedbackSheet.jsx';
import ChatSheet from './sheets/ChatSheet.jsx';
import CoHostSheet from './sheets/CoHostSheet.jsx';
import PublishSlotSheet from './sheets/PublishSlotSheet.jsx';

const VIEWS = {
  discover: ExploreView,
  exclusive: ExclusiveView,
  tribe: MyTribeView,
  network: NetworkView,
  profile: ProfileView,
  host: HostHubView,
};

const OVERLAYS = {
  event: EventDetail,
  create: CreateEventSheet,
  onboarding: Onboarding,
  niches: NichesSheet,
  feedback: FeedbackSheet,
  chat: ChatSheet,
  cohost: CoHostSheet,
  publishSlot: PublishSlotSheet,
};

function wantsLab() {
  try {
    return new URLSearchParams(window.location.search).has('lab');
  } catch {
    return false;
  }
}

function Shell() {
  const { tab, overlay, state, open } = useTribe();
  const [labOpen, setLabOpen] = useState(wantsLab);

  // First run: show onboarding until it's completed or skipped.
  useEffect(() => {
    if (!state.onboarded && !overlay) open('onboarding', { step: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.onboarded]);

  const View = VIEWS[tab] ?? ExploreView;
  const Overlay = overlay ? OVERLAYS[overlay.type] : null;
  const { type: _type, ...overlayProps } = overlay ?? {};

  return (
    <div className="min-h-screen bg-stone-950 flex justify-center items-center gap-8 p-0 md:p-6 font-sans text-stone-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.08),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(147,51,234,0.08),transparent_50%)]" />

      <main className="w-full max-w-[420px] h-[100dvh] md:h-[880px] bg-stone-900 border border-stone-800 md:rounded-[44px] shadow-2xl shadow-black/80 flex flex-col relative overflow-hidden ring-1 ring-white/10">
        <StatusBar onClockTap={() => setLabOpen((o) => !o)} />
        <Toast />

        <div className="flex-1 flex flex-col overflow-hidden" key={tab}>
          <View />
        </div>

        <BottomNav />
        <div className="h-4 bg-stone-900 shrink-0 flex justify-center items-center" aria-hidden="true">
          <div className="w-32 h-1 bg-stone-700/60 rounded-full" />
        </div>

        {Overlay && <Overlay {...overlayProps} />}

        {/* Small screens: lab opens as an overlay inside the phone frame. */}
        {labOpen && (
          <div className="xl:hidden absolute inset-0 z-[70] bg-black/80 backdrop-blur-sm p-3 pt-12 animate-fade-in flex">
            <ExperimentLab overlay onClose={() => setLabOpen(false)} />
          </div>
        )}
      </main>

      {/* Wide screens: lab sits beside the phone. */}
      <div className="hidden xl:block relative">
        <ExperimentLab />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <TribeProvider>
      <Shell />
    </TribeProvider>
  );
}
