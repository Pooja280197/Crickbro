import React, { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";

const FAQ = ({ pagedata }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const faqs = pagedata?.questionsAnswers || [];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      className="relative overflow-hidden py-10 md:py-14"
      style={{
        background:
          "linear-gradient(180deg, var(--reg-soft, #eff6ff) 0%, #ffffff 100%)",
        fontFamily:
          '"Inter", "Manrope", "Nunito Sans", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-blue-500/10 " />
      <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-amber-400/10 " />

      <div className="relative mx-auto max-w-4xl px-4 md:px-6">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{
              borderColor:
                "color-mix(in srgb, var(--reg-primary, #2563eb) 25%, transparent)",
              background:
                "color-mix(in srgb, var(--reg-primary, #2563eb) 8%, transparent)",
              color: "var(--reg-primary, #2563eb)",
            }}
          >
            <MessageCircle size={13} />
            Need Help?
          </span>
          <h2
            className="mt-3 text-3xl font-black tracking-tight md:text-4xl"
            style={{ color: "var(--reg-dark, #0f172a)" }}
          >
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600 md:text-base">
            Quick answers to common questions about registration, trials, and
            the auction process.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <article
              key={faq?._id || index}
              className={`group overflow-hidden rounded-2xl border bg-white transition-[border-color,box-shadow] duration-200 ${
                openIndex === index
                  ? "border-blue-200 shadow-[0_16px_40px_rgba(37,99,235,0.12)]"
                  : "border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors duration-200 hover:bg-blue-50/50 md:px-5"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-[background-color,color,box-shadow] duration-200 ${
                    openIndex === index
                      ? "text-white shadow-lg"
                      : "bg-blue-50 text-blue-600"
                  }`}
                  style={
                    openIndex === index
                      ? {
                          background:
                            "linear-gradient(135deg, var(--reg-primary, #2563eb), var(--reg-secondary, #1d4ed8))",
                        }
                      : undefined
                  }
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="min-w-0 flex-1 pr-2 text-sm font-bold leading-5 tracking-tight text-slate-900 md:text-base">
                  {faq.question}
                </h3>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
                    openIndex === index
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                  }`}
                >
                  <ChevronDown
                    size={17}
                    className={`transition-transform duration-200 ease-out ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>

              <div
                className={` ease-in-out overflow-hidden ${
                  openIndex === index
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="border-t border-slate-100 px-4 pb-5 pt-4 md:pl-[68px] md:pr-6">
                  <p className="text-sm font-medium leading-6 text-slate-600 md:text-[15px]">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
