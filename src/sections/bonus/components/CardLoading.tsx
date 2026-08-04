export const CardLoading = () => {
  return <div className="flex flex-col p-4 gap-4 rounded-field border border-base-200 bg-base-200">
    <div className="flex items-center gap-4 h-15">
      <div className="skeleton w-12 h-12 rounded-lg"></div>
      <div className="skeleton h-10 rounded-lg flex-1"></div>
    </div>
    <div className="skeleton h-10 rounded-lg"></div>
  </div>;
};