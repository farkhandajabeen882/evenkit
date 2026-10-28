"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import rules from "./rules.json";

type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
};

const topics = [
  { label: "Equipment", keyword: "equipment", icon: "▦" },
  { label: "Packages", keyword: "packages", icon: "✦" },
  { label: "Timings", keyword: "timings", icon: "◷" },
  { label: "Location", keyword: "location", icon: "⌖" },
  { label: "Delivery", keyword: "delivery", icon: "↗" },
  { label: "Payment", keyword: "payment", icon: "▤" },
];

const welcome: Message = {
  id: 0,
  sender: "bot",
  text: "Welcome to EventKit. I can help you explore event equipment, rental packages, delivery and booking information. How can I help you today?",
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function getReply(text: string) {
  const message = ` ${normalize(text)} `;

  const match = rules.find((rule) =>
    rule.keywords.some((keyword) => {
      const cleaned = normalize(keyword);

      return cleaned.length > 0 &&
        message.includes(` ${cleaned} `);
    })
  );

  return (
    match?.reply ??
    "I couldn't find a matching answer. Please ask about equipment, packages, timings, location, delivery, payment or booking."
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [activeTopic, setActiveTopic] = useState("");

  const nextId = useRef(1);
  const pending = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    const chat = chatRef.current;

    if (chat) {
      chat.scrollTo({
        top: chat.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, typing]);

  function sendMessage(value: string, topic = "") {
    const text = value.trim().replace(/\s+/g, " ");

    if (!text || pending.current) return;

    pending.current = true;

    const userMessage: Message = {
      id: nextId.current++,
      sender: "user",
      text,
    };

    const reply = getReply(text);

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setActiveTopic(topic);
    setTyping(true);

    timer.current = setTimeout(() => {
      const botMessage: Message = {
        id: nextId.current++,
        sender: "bot",
        text: reply,
      };

      setMessages((previous) => [...previous, botMessage]);
      setTyping(false);
      pending.current = false;
      timer.current = null;
    }, 500);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(input);
  }

  function resetChat() {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    pending.current = false;
    setTyping(false);
    setMessages([welcome]);
    setInput("");
    setActiveTopic("");
  }

  return (
    <main className="flex h-dvh overflow-hidden bg-[#eef3f3] font-sans text-[#163136]">
      {/* Desktop sidebar */}
      <aside className="relative hidden w-80 shrink-0 flex-col overflow-hidden bg-[#102a30] p-7 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#baf3d7] text-sm font-black text-[#102a30]">
            EK
          </div>

          <div>
            <p className="text-xl font-bold tracking-tight">
              EventKit
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-[#91acb0]">
              Events, thoughtfully equipped
            </p>
          </div>
        </div>

        <div className="mt-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9edfc2]">
            From plans to possibilities
          </p>

          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
            Great events
            <br />
            start here.
          </h2>

          <p className="mt-4 text-sm leading-6 text-[#a6bdc0]">
            Equipment, packages and practical guidance for
            your next occasion.
          </p>
        </div>

        <p className="mb-3 mt-10 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78979c]">
          Explore services
        </p>

        <nav
          aria-label="Quick topics"
          className="min-h-0 space-y-1 overflow-y-auto"
        >
          {topics.map((topic) => (
            <button
              key={topic.keyword}
              type="button"
              disabled={typing}
              onClick={() =>
                sendMessage(topic.keyword, topic.keyword)
              }
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition focus-visible:outline-2 focus-visible:outline-[#baf3d7] disabled:opacity-40 ${
                activeTopic === topic.keyword
                  ? "bg-[#baf3d7] text-[#102a30]"
                  : "text-[#b9ced1] hover:bg-white/5 hover:text-white"
              }`}
            >
              <span aria-hidden="true" className="text-lg">
                {topic.icon}
              </span>
              <span className="flex-1">{topic.label}</span>
              <span aria-hidden="true">↗</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-7">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-[#d5eee3]">
              Make room for memorable moments.
            </p>
            <p className="mt-2 text-xs leading-5 text-[#8faeb3]">
              Explore your options before planning your booking.
            </p>
          </div>
        </div>
      </aside>

      {/* Chat workspace */}
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#e1e9e8] bg-white px-4 py-4 sm:px-8">
          <div>
            <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#668c83]">
              EventKit concierge
            </p>
            <h1 className="text-base font-bold tracking-tight sm:text-xl">
              Event Planning Support
            </h1>
          </div>

          <button
            type="button"
            onClick={resetChat}
            className="shrink-0 rounded-xl border border-[#d6e5df] bg-[#f3f8f5] px-3 py-2 text-xs font-semibold text-[#285b4b] transition hover:bg-[#e4f3eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:px-4"
          >
            + New conversation
          </button>
        </header>

        {/* Mobile topics */}
        <nav
          aria-label="Mobile quick topics"
          className="flex shrink-0 gap-2 overflow-x-auto border-b border-[#e1e9e8] bg-white px-4 py-3 lg:hidden"
        >
          {topics.map((topic) => (
            <button
              key={topic.keyword}
              type="button"
              disabled={typing}
              onClick={() =>
                sendMessage(topic.keyword, topic.keyword)
              }
              className="shrink-0 rounded-full border border-[#dbe8e1] bg-[#f3f8f5] px-3 py-2 text-xs font-medium text-[#285b4b] disabled:opacity-40"
            >
              {topic.label}
            </button>
          ))}
        </nav>

        <div
          ref={chatRef}
          className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8"
        >
          <div className="mx-auto max-w-3xl">
            {messages.length === 1 && (
              <section className="pb-8 pt-2 sm:pt-6">
                <span className="inline-flex rounded-full border border-[#d5e5dd] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#42705e]">
                  A little guidance. A better event.
                </span>

                <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-[#163136] sm:text-5xl">
                  Bring your next
                  <br />
                  <span className="text-[#4b8971]">
                    occasion to life.
                  </span>
                </h2>

                <p className="mt-4 max-w-lg text-sm leading-6 text-[#72888a]">
                  Find the right equipment, explore rental
                  packages and understand the details before
                  your event.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {topics.slice(0, 2).map((topic) => (
                    <button
                      key={topic.keyword}
                      type="button"
                      onClick={() =>
                        sendMessage(topic.keyword, topic.keyword)
                      }
                      className="group flex items-center gap-3 rounded-2xl border border-[#dce7e2] bg-white p-4 text-left shadow-sm transition hover:border-[#94bea9] focus-visible:outline-2 focus-visible:outline-emerald-700"
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf6ef] text-lg text-[#42705e]"
                      >
                        {topic.icon}
                      </span>

                      <span className="flex-1">
                        <span className="block text-sm font-semibold">
                          {topic.label === "Equipment"
                            ? "Browse equipment"
                            : "Explore packages"}
                        </span>
                        <span className="mt-1 block text-xs text-[#819391]">
                          {topic.label === "Equipment"
                            ? "Rental items and daily rates"
                            : "Options for different occasions"}
                        </span>
                      </span>

                      <span className="text-[#8dad9d] group-hover:text-[#285b4b]">
                        <ArrowIcon />
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <div
              role="log"
              aria-label="Support conversation"
              aria-live="polite"
              aria-relevant="additions"
              className="space-y-6"
            >
              {messages.map((message) => {
                const isUser = message.sender === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex items-end gap-2 sm:gap-3 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div
                        aria-hidden="true"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#102a30] text-[10px] font-bold text-[#baf3d7]"
                      >
                        EK
                      </div>
                    )}

                    <div className="max-w-[85%] sm:max-w-[80%]">
                      <p
                        className={`mb-1.5 text-[10px] font-semibold ${
                          isUser
                            ? "text-right text-[#4b7666]"
                            : "text-[#7b9190]"
                        }`}
                      >
                        {isUser ? "You" : "EventKit Assistant"}
                      </p>

                      <div
                        className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                          isUser
                            ? "rounded-br-sm bg-[#254f46] text-white"
                            : "rounded-bl-sm border border-[#e0e8e4] bg-white text-[#526c6d]"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {typing && (
              <p
                role="status"
                className="mt-4 flex items-center gap-2 text-xs text-[#628776]"
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 animate-pulse rounded-full bg-[#70a78c]"
                />
                EventKit Assistant is typing...
              </p>
            )}
          </div>
        </div>

        <footer className="shrink-0 px-4 pb-4 pt-2 sm:px-8 sm:pb-5">
          <div className="mx-auto max-w-3xl">
            <form
              onSubmit={submit}
              className="flex items-center gap-2 rounded-2xl border border-[#d3e2da] bg-white p-2 shadow-lg shadow-[#102a30]/5 focus-within:border-[#87b99e] focus-within:ring-2 focus-within:ring-[#dcefe3]"
            >
              <label htmlFor="message" className="sr-only">
                Your message
              </label>

              <input
                id="message"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={typing}
                placeholder="Tell us what you need for your event..."
                autoComplete="off"
                maxLength={1000}
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-[#163136] outline-none placeholder:text-[#94a5a2] sm:px-3"
              />

              <button
                type="submit"
                disabled={!input.trim() || typing}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#102a30] text-[#baf3d7] transition hover:bg-[#254f46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowIcon />
              </button>
            </form>

            <p className="mt-3 text-center text-[10px] leading-4 text-[#8a9b96]">
              Equipment & rental guidance · Bookings require
              team confirmation
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
}