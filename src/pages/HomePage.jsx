import React from 'react'
import { flattenMeterCatalog, categories } from '../config/meterCatalog'
import { toolsCatalog } from '../config/toolsCatalog'
import TiltCard from '../components/TiltCard'
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

const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M13 5l7 7-7 7"></path>
  </svg>
)

const IconLayers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
)

const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
)

const IconFileText = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
  </svg>
)

const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
)

export default function HomePage({ onExploreClick }) {
  const allMeters = flattenMeterCatalog()

  // Get unique meter categories with their first entry for display
  const uniqueMeters = {}
  allMeters.forEach((meter) => {
    if (!uniqueMeters[meter.id]) {
      uniqueMeters[meter.id] = meter
    }
  })

  const meterList = Object.values(uniqueMeters)

  const stats = [
    { icon: IconLayers, value: meterList.length, label: 'Meter Types' },
    { icon: IconGrid, value: categories.length, label: 'Categories' },
    { icon: IconFileText, value: toolsCatalog.length, label: 'Tools' },
    { icon: IconClock, value: '24/7', label: 'Available' },
  ]

  return (
    <div className="home-page container">
      <div className="bento-grid home-bento">
        <div className="bento-tile bento-tile--hero home-hero glass-card">
          <div className="home-hero__glow" />
          <div className="home-hero__content">
            <span className="home-hero__badge">Calibration Toolkit</span>
            <h1 className="home-hero__title">
              Welcome to <span className="gradient-text">MIAL Tools</span>
            </h1>
            <p className="home-hero__desc">
              Generate calibration certificates, print tags, and manage your certificate repository — all from one streamlined dashboard.
            </p>
            <button className="home-hero__cta" onClick={onExploreClick}>
              <span>Explore Tools</span>
              <IconArrowRight />
            </button>
          </div>
        </div>

        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bento-tile home-stat glass-card"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <span className="home-stat__icon">
                <Icon />
              </span>
              <span className="home-stat__value gradient-text">{stat.value}</span>
              <span className="home-stat__label">{stat.label}</span>
            </div>
          )
        })}
      </div>

      <section className="home-showcase">
        <div className="home-showcase__header">
          <h2>Supported Meters</h2>
          <p>Browse the instrument families covered by our certificate and tag generators.</p>
        </div>
        <div className="home-showcase__row">
          <div className="home-showcase__track">
            {[...meterList, ...meterList].map((meter, idx) => (
              <TiltCard key={`${meter.id}-${idx}`} className="glass-card showcase-card">
                <div className="showcase-card__image">
                  <img
                    src={meterImages[meter.id] || meterImages[meter.code]}
                    alt={meter.label}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
                <div className="showcase-card__body">
                  <span className="showcase-card__category">{meter.categoryLabel}</span>
                  <h3 className="showcase-card__title">{meter.label}</h3>
                  <p className="showcase-card__desc">{meter.description}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      <section className="home-footer glass-panel">
        <div className="footer-content">
          <h2>Ready to Accelerate?</h2>
          <p>Jump straight into the tools dashboard and start generating certificates and tags.</p>
          <button className="home-hero__cta" onClick={onExploreClick}>
            <span>Browse Tools</span>
            <IconArrowRight />
          </button>
        </div>
      </section>
    </div>
  )
}
