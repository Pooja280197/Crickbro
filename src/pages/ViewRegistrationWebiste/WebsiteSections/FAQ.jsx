import React, { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
// import { useContent } from '../contexts/ContentContext'

const FAQ = ({ pagedata }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const faqs = pagedata?.questionsAnswers || [];
  // const { content } = useContent()

  // const faqs = content.faqs

  // const faqs = pagedata?.questionsAnswers || [];
  // const faqs =[
  //   {
  //     id: 1,
  //     question: "How can I register for an auction?",
  //     answer: "Players can register using their mobile number and OTP.You’ll need to fill in basic details and complete the payment (in case of paid registrations).",
  //   },
  //    {
  //     id: 2,
  //     question: "How does the selection process work in case of trial auctions?",
  //     answer: "In trial auctions, your performance will be evaluated, and the selector will give a rating. Based on this rating, participants are selected for the main auction or tournament.",
  //   },
  //    {
  //     id: 3,
  //     question: "What makes our auction different from other tournaments?",
  //     answer: "This auction focuses on fairness, transparency, and high-quality experiences. We ensure secure bidding, expert curation of items, and unique rewards that set us apart from other auctions.",
  //   },
  //    {
  //     id: 4,
  //     question: "Is there a fee to participate in an auction or tournament?",
  //     answer: "Some auctions may have a registration or participation fee, while others are free. You can check the specific auction details on our website before registering.",
  //   }
  // ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="relative py-12 md:py-20 bg-gray-50">
      {/* Container */}
      <div className="max-w-4xl mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            <span style={{ color: "var(--color-header-1)" }}>
              FREQUENTLY ASKED{" "}
            </span>
            <span style={{ color: "var(--color-crickbroYellow)" }}>
              QUESTIONS
            </span>
          </h2>

          {/* Yellow Underline */}
          <div className="flex justify-center mt-6">
            <div
              className="h-1 w-24"
              style={{ backgroundColor: "var(--color-crickbroYellow)" }}
            />
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4 md:space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              {/* Question Button */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 md:px-8 py-5 md:py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <h3
                  className="text-sm md:text-base font-bold uppercase tracking-wide pr-4"
                  style={{ color: "var(--color-header-1)" }}
                >
                  {faq.question}
                </h3>

                <ChevronDown
                  size={24}
                  className="flex-shrink-0 transition-transform duration-300"
                  style={{
                    color: "var(--color-header-1)",
                    transform:
                      openIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {/* Answer */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 md:px-8 pb-5 md:pb-6 text-gray-600 text-sm md:text-base leading-relaxed border-t border-gray-100">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
