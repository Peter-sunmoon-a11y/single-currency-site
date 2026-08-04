export const CheckInCardLoading = () => {
  return (
    <div className="grid grid-cols-6 gap-0.5">
      {Array.from({ length: 30 }).map((_, index) => (
        <div key={index} className="skeleton h-12 rounded-sm bg-base-200" />
      ))}
    </div>
  );
};