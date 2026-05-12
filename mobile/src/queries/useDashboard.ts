import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { DashboardResponse } from "../types/dashboard";

export function useDashboard(enabled = true) {
  return useQuery({
    queryKey: ["dashboard"],
    enabled,
    queryFn: async () => {
      const response = await api.get<DashboardResponse>("/dashboard");

      return response.data;
    },
  });
}
