import React, { useState, useEffect, useRef } from 'react'
import { CheckCircle, ArrowRight, MessageCircle } from 'lucide-react'
// import { useContent } from '../contexts/ContentContext'

const KeyFeatures = ({ pagedata }) => {
  const [visibleCards, setVisibleCards] = useState({})
  const sectionRef = useRef(null)
    // const { content } = useContent()
    // const points = content?.points 

  const points = pagedata?.keyFeatures?.features || []
  const keyFeaturesTitle = pagedata?.keyFeatures?.title || "Why Choose Us"

  useEffect(() => {
    const observers = new Map()

    points?.forEach((point) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleCards(prev => ({
              ...prev,
              [point._id || point.id]: true
            }))
            observer.unobserve(entry.target)
          }
        },
        {
          threshold: 0.2,
          rootMargin: '0px 0px -50px 0px'
        }
      )

      const element = document.getElementById(`point-${point._id || point.id}`)
      if (element) {
        observer.observe(element)
        observers.set(point._id || point.id, observer)
      }
    })

    return () => {
      observers.forEach(observer => observer.disconnect())
    }
  }, [points])

  return (
    <div ref={sectionRef} className="relative py-12 md:py-20 bg-gray-100" 
>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 opacity-10 w-96 h-96 rounded-full bg-yellow-600"
         />
      <div className="absolute bottom-0 left-0 opacity-10 w-80 h-80 rounded-full bg-purple-600"
 />

      <div className="relative z-10">
        {/* Heading */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-blue-900"
            style={{
              animation: 'slideInDown 0.8s ease-out'
            }}>
            {keyFeaturesTitle}
          </h2>
        
        </div>

        {/* Cards Grid */}
        <div className="max-w-7xl mx-auto px-4">
          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-6 mb-8">
            {points?.slice(0, 4)?.map((point, idx) => (
              <div
                key={point._id || point.id || idx}
                id={`point-${point._id || point.id}`}
                className={`transform transition-all duration-700 ease-out ${
                  visibleCards[point._id || point.id]
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: `${idx * 100}ms`
                }}
              >
                <div className="bg-white rounded-xl p-5 md:p-6 h-full relative group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-l-4 border-r border-t border-b border-gray-200 shadow-md"
                  style={{ borderLeftColor: 'var(--color-crickbroYellow)', borderLeftWidth: '5px' }}>
                  {/* Checkmark Icon */}
                  <div className="absolute top-3 right-3 text-yellow-400">
                    <CheckCircle size={20} />
                  </div>

                  <h3 className="font-bold text-sm md:text-base text-gray-900 mb-3 uppercase tracking-wide"
                    style={{ color: 'var(--color-header-1)' }}>
                    {point?.title}
                  </h3>

                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                    {point?.description}
                  </p>

                  {/* Arrow indicator */}
                  {idx < 3 && (
                    <div className="hidden lg:flex absolute -right-7 top-1/2 -translate-y-1/2 text-yellow-400">
                      <ArrowRight size={32} className="animate-pulse" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Second Row - Left Offset */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-6 relative pl-0 lg:pl-32">
            {points?.slice(4,8 )?.map((point, idx) => (
              <div
                key={point._id || point.id || idx}
                id={`point-${point._id || point.id}`}
                className={`transform transition-all duration-700 ease-out ${
                  visibleCards[point._id || point.id]
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: `${(idx + 4) * 100}ms`
                }}
              >
                <div className="bg-white rounded-xl p-5 md:p-6 h-full relative group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-l-4 border-r border-t border-b border-gray-200"
                  style={{ borderLeftColor: 'var(--color-crickbroYellow)', borderLeftWidth: '5px' }}>
                  {/* Checkmark Icon */}
                  <div className="absolute top-3 right-3 text-yellow-400">
                    <CheckCircle size={20} />
                  </div>

                  <h3 className="font-bold text-sm md:text-base text-gray-900 mb-3 uppercase tracking-wide"
                    style={{ color: 'var(--color-header-1)' }}>
                    {point?.title}
                  </h3>

                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                    {point?.description}
                  </p>

                  {/* Arrow indicator */}
                  {idx < 3 && (
                    <div className="hidden lg:flex absolute -right-7 top-1/2 -translate-y-1/2 text-yellow-400">
                      <ArrowRight size={32} className="animate-pulse" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Register Now Button - Bottom Right */}
        <div className="flex justify-center lg:justify-end max-w-7xl mx-auto px-4 mt-12">
        
        </div>
      </div>

      <style >{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}

export default KeyFeatures
