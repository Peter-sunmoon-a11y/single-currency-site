import { useQuery } from "@tanstack/react-query";
import { getCountryCodeByIp } from "@/services/public/config";
import { getAggregationPayload, useAggregationConfig } from "@/hooks/api/usePublic";

export function useCountryCodeByIp() {
  const { data: aggregationResponse, isFetching: isAggregationFetching } = useAggregationConfig();
  const aggregationPayload = getAggregationPayload(aggregationResponse);
  const hasAggregatedCountryCode = aggregationPayload?.country_code?.code === 0;

  return useQuery({
    queryKey: ['countryCodeByIp'],
    queryFn: () => getCountryCodeByIp(),
    enabled: !isAggregationFetching && !hasAggregatedCountryCode,
  });
}
