const PROMOTIONAL_LOADING_CARD_COUNT = 8;

export const PromotionalSkeleton = () => {
  return (
    <div className="grid grid-cols-2 gap-1">
      {Array.from({ length: PROMOTIONAL_LOADING_CARD_COUNT }).map((_, index) => (
        <div key={index} className="skeleton h-10 bg-base-200" />
      ))}
    </div>
  );
};
