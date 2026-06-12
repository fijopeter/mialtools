import React, { useEffect, useRef, useState } from 'react'
import { flattenMeterCatalog } from '../config/meterCatalog'
import './HomePage.css'

const meterImages = {
  'UltraSonicLevelMeter': new URL('../images/meter/UltraSonicLevelMeter.png', import.meta.url).href,
  'RadarLevelMeter': new URL('../images/meter/RadarLevelMeter.png', import.meta.url).href,
  'ElectromagneticBTUMeter': new URL('../images/meter/ElectromagneticBTUMeter.png', import.meta.url).href,
  'ElectromagneticFLOWMeter': new URL('../images/meter/ElectromagneticFLOWMeter.png', import.meta.url).href,
  'InlineUltrasonicFLOWMeter': new URL('../images/meter/InlineUltrasonicFLOWMeter.png', import.meta.url).href,
  'InlineUltrasonicBTUMeter': new URL('../images/meter/InlineUltrasonicBTUMeter.png', import.meta.url).href,
  'ClampOnUltrasonicFLOW5': new URL('../images/meter/ClampOnUltrasonicFLOW5.png', import.meta.url).href,
  'ClampOnUltrasonicFLOW1': new URL('../images/meter/ClampOnUltrasonicFLOW1.png', import.meta.url).href,
  'ClampOnUltrasonicBTU1': new URL('../images/meter/ClampOnUltrasonicBTU1.png', import.meta.url).href,
  'ClampOnUltrasonicBTU5': new URL('../images/meter/ClampOnUltrasonicBTU5.png', import.meta.url).href,
}

export default function HomePage() {
  const containerRef = useRef(null)
  const itemsRef = useRef([])
  const [visibleIndex, setVisibleIndex] = useState(0)

  useEffect(() => {
    const observerOptions = {
      threshold: [0.1, 0.5, 0.9],
      rootMargin: '0px 0px -20% 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = itemsRef.current.indexOf(entry.target)
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          setVisibleIndex(index)
          entry.target.classList.add('visible')
        } else {
          entry.target.classList.remove('visible')
        }
      })
    }, observerOptions)

    itemsRef.current.forEach((item) => {
      if (item) observer.observe(item)
    })

    return () => {
      itemsRef.current.forEach((item) => {
        if (item) observer.unobserve(item)
      })
    }
  }, [])

  const allMeters = flattenMeterCatalog()

  // Get unique meter categories with their first entry for display
  const uniqueMeters = {}
  allMeters.forEach((meter) => {
    if (!uniqueMeters[meter.id]) {
      uniqueMeters[meter.id] = meter
    }
  })

  const meterList = Object.values(uniqueMeters)

  return (
    <div className="home-page" ref={containerRef}>
      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-content">
          <h1 className="hero-title">MIAL Tools</h1>
          <p className="hero-subtitle">Modern Tools for you</p>
          <p className="hero-description">Streamline your workflow with our comprehensive suite of tools</p>
        </div>
      </section>

      {/* Scrolling Carousel */}
      <section className="meters-carousel">
        {meterList.map((meter, idx) => (
          <div
            key={meter.id}
            ref={(el) => (itemsRef.current[idx] = el)}
            className={`carousel-item ${idx % 2 === 0 ? 'image-left' : 'image-right'} fade-item`}
          >
            <div className="carousel-image">
              <img
                src={meterImages[meter.id] || meterImages[meter.code]}
                alt={meter.label}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>

            <div className="carousel-content">
              <div className="content-wrapper">
                {/* <span className="meter-number">0{idx + 1}</span> */}
                <h2 className="meter-title">{meter.label}</h2>
                <p className="meter-category">{meter.categoryLabel}</p>
                <p className="meter-long-description">{meter.description}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Bottom CTA */}
      <section className="home-footer">
        <div className="footer-content">
          <h2>Ready to Generate?</h2>
          <p>Navigate using the header menu to get started</p>
        </div>
      </section>
    </div>
  )
}
