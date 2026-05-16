import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { ShopIndexResponse, XpShopStatus } from "../types/shop";

export function useShopIndex(enabled = true) {
  return useQuery({
    queryKey: ["shop"],
    enabled,
    queryFn: async () => {
      const response = await api.get<ShopIndexResponse>("/shop");

      return response.data;
    },
  });
}

export function useXpShopStatus(enabled = true) {
  return useQuery({
    queryKey: ["shop", "xp-status"],
    enabled,
    queryFn: async () => {
      const response = await api.get<XpShopStatus>("/shop/xp-status");

      return response.data;
    },
  });
}
