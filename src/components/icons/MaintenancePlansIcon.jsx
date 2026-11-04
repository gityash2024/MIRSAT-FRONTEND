import PropTypes from 'prop-types';

// Exact sidebar vector from the Maintenance Plans Figma handoff.
export default function MaintenancePlansIcon({ size = 20, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true" focusable="false">
      <g transform="translate(-31 -572.5)" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50.6001 580.9L54.6001 576.9C55.1305 576.369 55.85 576.071 56.6001 576.071C57.3502 576.071 58.0697 576.369 58.6001 576.9C59.1305 577.43 59.4285 578.15 59.4285 578.9C59.4285 579.65 59.1305 580.369 58.6001 580.9L54.6001 584.9" />
        <path d="M43.4 596.1L39.4 600.1C38.8695 600.63 38.1501 600.928 37.4 600.928C36.6498 600.928 35.9304 600.63 35.4 600.1C34.8695 599.569 34.5715 598.85 34.5715 598.1C34.5715 597.349 34.8695 596.63 35.4 596.1L39.4 592.1" />
        <path d="M41.6667 593.834L52.3334 583.167" />
        <path d="M37.6667 575.167V577.834M37.6667 577.834V580.5M37.6667 577.834H35M37.6667 577.834H40.3333M56.3333 596.5V599.167M56.3333 599.167V601.834M56.3333 599.167H53.6667M56.3333 599.167H59" />
      </g>
    </svg>
  );
}

MaintenancePlansIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
};
