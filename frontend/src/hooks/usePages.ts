import { useQuery } from "@tanstack/react-query";
import { pageApi } from "@/api/page";

export function usePages() {
  return useQuery({
    queryKey: ["pages"],
    queryFn: pageApi.list,
  });
}
