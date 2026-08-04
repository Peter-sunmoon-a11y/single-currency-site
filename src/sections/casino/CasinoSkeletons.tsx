
export const CasinoHeroSkeleton = () => {
  return (
    <div className="relative h-[180px] overflow-hidden rounded-lg bg-base-200 animate-pulse">
    </div>
  );
};

export const CasinoSectionSkeleton = ({ className = "h-[172px]" }: { className?: string }) => (
  <div className={`${className} rounded-lg bg-base-200 skeleton`} />
);

export const CasinoActivitiesSkeleton = () => (
  <div className="grid grid-cols-2 gap-1">
    {Array.from({ length: 2 }).map((_, index) => (
      <div key={index} className="h-[77px] rounded-lg bg-base-200 skeleton" />
    ))}
  </div>
);
