import React from 'react';
import GardenParticles from './GardenParticles';
import '../styles/garden-theme.css';

const GardenLayout = ({ children }) => {
  return (
    <div className="garden-container">
      <GardenParticles />
      
      <div className="garden-content">
        {children}
      </div>

      <style jsx>{`
        .garden-container {
          min-height: 100vh;
          background: linear-gradient(
            135deg,
            var(--garden-background) 0%,
            var(--garden-secondary) 100%
          );
          position: relative;
          overflow: hidden;
        }

        .garden-content {
          position: relative;
          z-index: 1;
          padding: var(--garden-spacing-large);
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--garden-spacing-medium);
          perspective: 1000px;
        }

        /* Ambient Background Elements */
        .garden-container::before,
        .garden-container::after {
          content: '';
          position: fixed;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: var(--garden-accent);
          opacity: 0.1;
          filter: blur(60px);
          z-index: 0;
          animation: float 8s infinite ease-in-out;
        }

        .garden-container::before {
          top: -100px;
          left: -100px;
          animation-delay: -4s;
        }

        .garden-container::after {
          bottom: -100px;
          right: -100px;
          background: var(--garden-primary);
        }

        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .garden-content {
            padding: var(--garden-spacing-medium);
            grid-template-columns: 1fr;
          }
        }

        /* Garden Entrance Animation */
        @keyframes gardenEntrance {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .garden-content > * {
          animation: gardenEntrance 0.6s ease-out forwards;
          animation-delay: calc(var(--index, 0) * 0.1s);
        }
      `}</style>
    </div>
  );
};

export default GardenLayout; 