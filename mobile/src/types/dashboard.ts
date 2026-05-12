export type DashboardStreakDay = {
  date: string;
  short_day: string;
  is_active: boolean;
  is_freeze: boolean;
  is_today: boolean;
  is_future: boolean;
};

export type DashboardStreak = {
  current_streak: number;
  longest_streak: number;
  freeze_count: number;
  active_today: boolean;
  at_risk: boolean;
  is_frozen: boolean;
  is_broken: boolean;
  broken_streak_notified: boolean;
  auto_save_available: boolean;
  weekly_history: DashboardStreakDay[];
};

export type DashboardResponse = {
  mastered_count: number;
  review_count: number;
  streak: DashboardStreak | null;
  xp: {
    balance: number;
    next_freeze_cost: number;
    can_afford_freeze: boolean;
  };
  srs: {
    due_today: number;
    total_seen: number;
    mastered: number;
    by_box: Record<string, number>;
  };
  revise_counts: {
    all: number;
    learning: number;
    reviewing: number;
    more_practice: number;
  };
};
