import React, { useEffect, useRef, useState } from 'react';
import { Send, Handshake, Lightbulb } from 'lucide-react';
import { useTribe } from '../state/TribeContext.jsx';
import { getPerson, sharedNiches, NICHES } from '../data/people.js';
import { ICEBREAKERS, CANNED_REPLIES } from '../data/content.js';
import { Avatar, Sheet, NicheTag } from '../components/ui.jsx';
import { track } from '../lib/analytics.js';

export default function ChatSheet({ personId }) {
  const { state, dispatch, close, open } = useTribe();
  const person = getPerson(personId);
  const messages = state.chats[personId] ?? [];
  const shared = person ? sharedNiches(person, state.niches) : [];
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const replyTimer = useRef(null);

  useEffect(() => {
    track('chat_open', { person: personId });
    return () => clearTimeout(replyTimer.current);
  }, [personId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, typing]);

  if (!person) return null;

  // Icebreaker suggestions drawn from the categories you share.
  const sharedCats = [...new Set(shared.map((n) => NICHES.find((x) => x.label === n)?.category).filter(Boolean))];
  const suggestions = [
    ...sharedCats.slice(0, 2).map((c) => ICEBREAKERS[c]?.[0]).filter(Boolean),
    `How's the ${person.project.split(' ').slice(0, 3).join(' ').toLowerCase()} going?`,
  ].slice(0, 3);

  const send = (text) => {
    const body = text.trim();
    if (!body) return;
    dispatch({ type: 'SEND_MESSAGE', personId, message: { from: 'me', text: body } });
    track('chat_send', { person: personId });
    setDraft('');
    setTyping(true);
    clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      setTyping(false);
      const reply = CANNED_REPLIES[(messages.length + body.length) % CANNED_REPLIES.length];
      dispatch({ type: 'SEND_MESSAGE', personId, message: { from: 'them', text: reply } });
    }, 1400);
  };

  return (
    <Sheet title={person.name} subtitle={person.role} icon={null} onClose={close} tall>
      <div className="flex flex-col h-full">
        <div className="px-5 py-3 border-b border-stone-800/70 flex items-center gap-3 shrink-0">
          <Avatar person={person} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1">
              {shared.length ? shared.map((n) => <NicheTag key={n}>{n}</NicheTag>) : <span className="text-[11px] text-stone-500">In your orbit</span>}
            </div>
          </div>
          <button
            onClick={() => open('cohost', { personId })}
            className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold flex items-center gap-1 shrink-0"
          >
            <Handshake size={13} /> Co-host
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-2" aria-live="polite">
          {messages.length === 0 && (
            <p className="text-center text-xs text-stone-500 py-6">Say hi — you two overlap on {shared.length || 'a few'} things.</p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'} animate-rise-in`}>
              <p
                className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-[13px] leading-snug ${
                  m.from === 'me' ? 'bg-purple-600 text-white rounded-br-md' : 'bg-stone-800 text-stone-100 rounded-bl-md'
                }`}
              >
                {m.text}
              </p>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <span className="bg-stone-800 rounded-2xl rounded-bl-md px-3.5 py-2.5 flex gap-1" aria-label={`${person.name} is typing`}>
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-stone-300 animate-typing" style={{ animationDelay: `${i * 160}ms` }} />
                ))}
              </span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="px-4 pt-2 pb-4 border-t border-stone-800 space-y-2 shrink-0">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="shrink-0 max-w-[240px] truncate px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-purple-200 text-[11px] font-medium flex items-center gap-1"
              >
                <Lightbulb size={11} className="shrink-0" /> <span className="truncate">{s}</span>
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
            className="flex gap-2"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label={`Message ${person.name}`}
              placeholder="Message…"
              className="flex-1 bg-stone-950 border border-stone-800 focus:border-purple-500 rounded-2xl px-3.5 py-2.5 text-[13px] text-white outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Send"
              className="w-11 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </Sheet>
  );
}
