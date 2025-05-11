"use client";
import GardenParticles from './GardenParticles';
import styles from '../app/page.module.scss';

export default function BackgroundEffects() {
  return (
    <>
      <GardenParticles />
      <svg className={styles.leafBackground} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 2C18 18 2 32 32 62C62 32 46 18 32 2Z" fill="#7c9a92"/>
        <path d="M32 2C18 18 2 32 32 62C62 32 46 18 32 2Z" fill="#b8c4b9" fillOpacity="0.3"/>
      </svg>
    </>
  );
} 