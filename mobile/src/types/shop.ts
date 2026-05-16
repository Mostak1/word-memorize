import { DashboardStreak } from "./dashboard";
import { Category } from "./api";

export type ShopCategory = Category & {
  shop_status: "owned" | "pending" | null;
};

export type ShopIndexResponse = {
  word_list_categories: ShopCategory[];
  pending_category_ids: number[];
  access_category_ids: number[];
};

export type XpShopStatus = {
  xp: {
    balance: number;
    next_freeze_cost: number;
    can_afford_freeze: boolean;
  };
  streak: DashboardStreak | null;
  dark_mode_unlocked: boolean;
};

export type ShopOrderPayload = {
  category_ids: number[];
  name: string;
  phone_number: string;
  address: string;
  profession?: string;
  transaction_id: string;
  note?: string;
};
