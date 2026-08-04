import type { Particle } from './types';

interface ParticlesProps {
  particles: Particle[];
}

export const Particles = ({ particles }: ParticlesProps) => {
  return (
    <div className="inset-0 z-[11150] pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: p.x,
            top: p.y,
            backgroundColor: p.color,
            opacity: p.life,
            boxShadow: `0 0 8px ${p.color}, 0 0 16px ${p.color}`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
};


//创建粒子
export const createParticles = (x: number, y: number, color: string, count: number = 20): Particle[] => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return Array.from({ length: count }, (_, i) => ({
    id: `${timestamp}-${random}-${i}`,
    x,
    y,
    vx: (Math.random() - 0.5) * 10,
    vy: (Math.random() - 0.5) * 10 - 5,
    color,
    life: 1,
  }));
};
