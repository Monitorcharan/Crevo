import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import './CreatorCard.css';

export default function CreatorCard({ creator, onSelect, index = 0 }) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const isAvailable = creator.availabilityStatus === 'available';

  const handleNavigate = () => {
    if (onSelect) {
      onSelect(creator);
    }
    navigate(`/creators/${creator.id}`);
  };

  const primaryItem = creator.portfolioItems?.[0] || creator.portfolio || {
    image: creator.coverImage,
    title: creator.title,
    primaryModel: creator.tools?.[0] || 'AI Diffusion',
  };

  const portfolioImage = primaryItem.image || creator.coverImage;
  const portfolioTitle = primaryItem.title || creator.title;
  const portfolioModel = primaryItem.primaryModel || primaryItem.toolsUsed?.[0] || creator.tools?.[0] || 'AI Diffusion';

  return (
    <motion.article
      className="creator-card"
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: shouldReduceMotion ? 0 : Math.min(index * 0.08, 0.4),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={shouldReduceMotion ? {} : { y: -6, transition: { duration: 0.25 } }}
    >
      {/* Portfolio Visual Header */}
      <div className="creator-card__media" onClick={handleNavigate}>
        <img
          src={portfolioImage}
          alt={`${creator.name}'s portfolio — ${portfolioTitle}`}
          className="creator-card__image"
          loading="lazy"
        />
        <div className="creator-card__media-scrim" />

        {/* Top Badges */}
        <div className="creator-card__badges">
          <span className="creator-card__specialization-badge">
            {creator.specialization}
          </span>
          <span
            className={`creator-card__availability-badge ${
              isAvailable
                ? 'creator-card__availability-badge--available'
                : 'creator-card__availability-badge--booking'
            }`}
          >
            <span className="creator-card__availability-dot" aria-hidden="true" />
            {creator.availability}
          </span>
        </div>

        {/* Portfolio Caption overlay */}
        <div className="creator-card__media-caption">
          <span className="creator-card__portfolio-title">
            {portfolioTitle}
          </span>
          <span className="creator-card__portfolio-model">
            {portfolioModel}
          </span>
        </div>
      </div>

      {/* Creator Info Body */}
      <div className="creator-card__body">
        <div className="creator-card__profile-row">
          <img
            src={creator.avatar}
            alt={creator.name}
            className="creator-card__avatar"
            loading="lazy"
          />
          <div className="creator-card__identity">
            <div className="creator-card__name-line">
              <h3 className="creator-card__name" onClick={handleNavigate} style={{ cursor: 'pointer' }}>
                {creator.name}
              </h3>
              <span className="creator-card__verified" title="Verified AI Creator" aria-label="Verified AI Creator">
                <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-4.146-2.854a.5.5 0 0 0-.708 0L6.5 9.793 4.854 8.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l5-5a.5.5 0 0 0 0-.708z" />
                </svg>
              </span>
            </div>
            <p className="creator-card__title">{creator.title}</p>
          </div>
        </div>

        {/* Rating and Location */}
        <div className="creator-card__meta-bar">
          <span className="creator-card__rating">
            <svg viewBox="0 0 16 16" fill="currentColor" className="creator-card__star" aria-hidden="true">
              <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
            </svg>
            <strong>{creator.rating.toFixed(2)}</strong>
            <span className="creator-card__reviews-count">({creator.reviewsCount})</span>
          </span>
          <span className="creator-card__location">{creator.location}</span>
        </div>

        {/* Bio Snippet */}
        <p className="creator-card__bio">{creator.bio}</p>

        {/* AI Tools Badges */}
        <div className="creator-card__tools" aria-label="AI Tools Used">
          {creator.tools.slice(0, 4).map((tool) => (
            <span key={tool} className="creator-card__tool-pill">
              {tool}
            </span>
          ))}
          {creator.tools.length > 4 && (
            <span className="creator-card__tool-pill creator-card__tool-pill--more">
              +{creator.tools.length - 4}
            </span>
          )}
        </div>

        {/* Card Footer: Starting Price and View Profile */}
        <div className="creator-card__footer">
          <div className="creator-card__pricing">
            <span className="creator-card__price-label">Starting at</span>
            <span className="creator-card__price-val">
              ${creator.startingPrice.toLocaleString()}
              <span className="creator-card__price-unit">/{creator.priceUnit}</span>
            </span>
          </div>

          <button
            type="button"
            className="creator-card__btn-view"
            onClick={handleNavigate}
            aria-label={`View profile and portfolio of ${creator.name}`}
          >
            <span>View Profile</span>
            <svg viewBox="0 0 16 16" fill="none" className="creator-card__arrow" aria-hidden="true">
              <path
                d="M3 8h10m-4-4 4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </motion.article>
  );
}
