import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bot,
  HelpCircle,
  Mail,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { chatbotFAQs, popularFAQIds } from "../data/chatbotFAQs";

const normalize = (value) => String(value || "").trim().toLowerCase();

const getFAQById = (id) => chatbotFAQs.find((faq) => faq.id === id);

const QuestionCard = ({ faq, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(faq)}
    className="group relative w-full overflow-hidden rounded-2xl border border-[var(--border-card)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--bg-main)_92%,white),color-mix(in_srgb,var(--bg-card)_88%,var(--primary)_12%))] p-3.5 text-left shadow-[0_10px_24px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:border-[var(--border-primary)] hover:shadow-[0_16px_34px_rgba(0,0,0,0.18)]"
  >
    <span className="pointer-events-none absolute right-[-28px] top-[-28px] h-16 w-16 rounded-full bg-[var(--primary)]/10 blur-xl transition group-hover:bg-[var(--secondary)]/20" />
    <p className="text-sm font-bold leading-5 text-[var(--text-primary)]">
      {faq.question}
    </p>
    <div className="mt-2 flex items-center justify-between gap-3">
      <p className="rounded-full bg-[var(--accent-light)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[var(--primary)]">
        {faq.category}
      </p>
      <span className="text-xs font-black text-[var(--secondary)] transition group-hover:translate-x-0.5">
        →
      </span>
    </div>
  </button>
);

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedFAQ, setSelectedFAQ] = useState(null);

  const categories = useMemo(
    () => Array.from(new Set(chatbotFAQs.map((faq) => faq.category))),
    [],
  );

  const popularFAQs = useMemo(
    () => popularFAQIds.map(getFAQById).filter(Boolean),
    [],
  );

  const filteredFAQs = useMemo(() => {
    const search = normalize(query);

    if (!search && !activeCategory) return [];

    return chatbotFAQs.filter((faq) => {
      const matchesCategory = activeCategory
        ? faq.category === activeCategory
        : true;

      const searchableText = [
        faq.question,
        faq.category,
        ...(faq.keywords || []),
      ]
        .map(normalize)
        .join(" ");

      const matchesSearch = search ? searchableText.includes(search) : true;
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, query]);

  const relatedFAQs = useMemo(() => {
    if (!selectedFAQ?.related?.length) return [];
    return selectedFAQ.related.map(getFAQById).filter(Boolean);
  }, [selectedFAQ]);

  const handleBackHome = () => {
    setSelectedFAQ(null);
    setQuery("");
    setActiveCategory("");
  };

  const handleCategoryClick = (category) => {
    setSelectedFAQ(null);
    setActiveCategory((current) => (current === category ? "" : category));
  };

  const hasSearchContext = Boolean(query.trim() || activeCategory);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`group fixed bottom-5 right-5 z-[99990] flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-white/20 bg-[conic-gradient(from_140deg,var(--secondary),var(--primary),var(--secondary))] text-[#102033] shadow-[0_18px_44px_rgba(0,0,0,0.38),0_0_30px_color-mix(in_srgb,var(--primary)_28%,transparent)] transition hover:-translate-y-1 hover:scale-105 ${
          isOpen ? "pointer-events-none scale-95 opacity-0" : "opacity-100"
        }`}
        aria-label="Open Auction Assistant"
      >
        <span className="absolute inset-1 rounded-[1.1rem] bg-[linear-gradient(145deg,rgba(255,255,255,0.5),rgba(255,255,255,0.08))]" />
        <MessageCircle className="relative h-7 w-7 transition group-hover:rotate-[-8deg]" />
      </button>

      {isOpen && (
        <div className="fixed bottom-4 right-4 z-[99991] flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-[410px] flex-col overflow-hidden rounded-[1.75rem] border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-[0_28px_80px_rgba(0,0,0,0.48)] sm:bottom-5 sm:right-5 sm:max-h-[calc(100dvh-2.5rem)]">
          <div className="relative shrink-0 overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_18%_20%,rgba(255,196,0,0.32),transparent_28%),radial-gradient(circle_at_88%_10%,rgba(8,186,247,0.38),transparent_30%),linear-gradient(135deg,var(--bg-deep),var(--bg-main))] px-4 py-4">
            <span className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[var(--primary)]/20 blur-2xl" />
            <span className="pointer-events-none absolute -bottom-14 left-10 h-28 w-28 rounded-full bg-[var(--secondary)]/20 blur-2xl" />
            <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--secondary)] text-[#102033] shadow-[0_12px_28px_rgba(0,0,0,0.24)]">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-black text-white">Auction Assistant</h2>
               
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close Auction Assistant"
            >
              <X className="h-4 w-4" />
            </button>
            </div>
          </div>

          <div className="professional-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[linear-gradient(180deg,color-mix(in_srgb,var(--bg-card)_92%,var(--primary)_8%),var(--bg-card))] p-4">
            {selectedFAQ ? (
              <div>
                <button
                  type="button"
                  onClick={handleBackHome}
                  className="mb-3 inline-flex h-9 items-center gap-2 rounded-full border border-[var(--border-card)] bg-[var(--bg-main)] px-3 text-xs font-bold text-[var(--text-primary)] transition hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                <div className="mb-3 flex justify-end">
                  <div className="max-w-[86%] rounded-[1.35rem] rounded-tr-md bg-[linear-gradient(135deg,var(--secondary),var(--secondary-strong))] px-4 py-3 text-sm font-bold text-[#102033] shadow-[0_12px_24px_rgba(0,0,0,0.16)]">
                    {selectedFAQ.question}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-card)] bg-[var(--accent-light)] text-[var(--primary)]">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="max-w-[88%] rounded-[1.35rem] rounded-tl-md border border-[var(--border-card)] bg-[var(--bg-main)] px-4 py-3 shadow-[0_10px_28px_rgba(0,0,0,0.1)]">
                    <p className="mb-2 text-xs font-black uppercase tracking-wide text-[var(--primary)]">
                      Answer
                    </p>
                    {Array.isArray(selectedFAQ.answer) ? (
                      <ol className="list-decimal space-y-1.5 pl-4 text-sm leading-6 text-[var(--text-primary)]">
                        {selectedFAQ.answer.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-sm leading-6 text-[var(--text-primary)]">
                        {selectedFAQ.answer}
                      </p>
                    )}
                  </div>
                </div>

                {relatedFAQs.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[var(--text-secondary)]">
                      <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
                      Related questions
                    </p>
                    <div className="space-y-2">
                      {relatedFAQs.map((faq) => (
                        <QuestionCard
                          key={faq.id}
                          faq={faq}
                          onClick={setSelectedFAQ}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                    }}
                    placeholder="Search auction help..."
                    className="h-12 w-full rounded-2xl border border-[var(--border-card)] bg-[var(--bg-main)] pl-10 pr-10 text-sm font-semibold text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--border-primary)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_14%,transparent)]"
                  />
                  <Send className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--primary)]" />
                </div>

                {hasSearchContext ? (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-black uppercase tracking-wide text-[var(--text-secondary)]">
                        Results
                      </p>
                      <button
                        type="button"
                        onClick={handleBackHome}
                        className="text-xs font-bold text-[var(--primary)]"
                      >
                        Clear
                      </button>
                    </div>

                    {filteredFAQs.length > 0 ? (
                      <div className="space-y-2">
                        {filteredFAQs.map((faq) => (
                          <QuestionCard
                            key={faq.id}
                            faq={faq}
                            onClick={setSelectedFAQ}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-[var(--border-card)] bg-[var(--bg-main)] p-4 text-center">
                        <HelpCircle className="mx-auto mb-2 h-8 w-8 text-[var(--primary)]" />
                        <p className="text-sm font-bold text-[var(--text-primary)]">
                          No answer found
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                          Try different keywords or contact support for help.
                        </p>
                        <a
                          href="mailto:support@crickbro.com?subject=Auction%20Support%20Help"
                          className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--secondary)] px-3 text-xs font-black text-[#102033] transition hover:bg-[var(--secondary-strong)]"
                        >
                          <Mail className="h-4 w-4" />
                          Contact Support
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-black uppercase tracking-wide text-[var(--text-secondary)]">
                        Popular questions
                      </p>
                      <div className="space-y-2">
                        {popularFAQs.map((faq) => (
                          <QuestionCard
                            key={faq.id}
                            faq={faq}
                            onClick={setSelectedFAQ}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="mb-2 text-xs font-black uppercase tracking-wide text-[var(--text-secondary)]">
                        Categories
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => handleCategoryClick(category)}
                            className="rounded-full border border-[var(--border-card)] bg-[var(--bg-main)] px-3 py-2 text-xs font-bold text-[var(--text-primary)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--border-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--primary)]"
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
