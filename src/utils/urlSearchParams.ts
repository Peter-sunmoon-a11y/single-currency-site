export const toUrlSearchParams = (search: unknown): URLSearchParams => {
  if (!search) return new URLSearchParams();
  if (typeof search === "string") return new URLSearchParams(search);
  if (search instanceof URLSearchParams) return search;
  if (typeof search === "object") {
    const searchParams = new URLSearchParams();
    Object.entries(search as Record<string, unknown>).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.set(key, String(value));
      }
    });
    return searchParams;
  }
  return new URLSearchParams();
};
