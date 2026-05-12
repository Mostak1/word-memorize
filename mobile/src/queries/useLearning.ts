import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Category, Paginated, Word, WordList } from "../types/api";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get<{ categories: Category[] }>("/categories");

      return response.data.categories;
    },
  });
}

export function useCategoryWordlists(categoryId: string | number) {
  return useQuery({
    queryKey: ["categories", String(categoryId), "wordlists"],
    queryFn: async () => {
      const response = await api.get<{ category: Category; wordlists: Paginated<WordList> }>(
        `/categories/${categoryId}/wordlists`,
      );

      return response.data;
    },
  });
}

export function useWordlist(wordlistId: string | number) {
  return useQuery({
    queryKey: ["wordlists", String(wordlistId)],
    queryFn: async () => {
      const response = await api.get<{ wordlist: WordList; words: Paginated<Word> }>(
        `/wordlists/${wordlistId}`,
      );

      return response.data;
    },
  });
}

export function useWord(wordId: string | number) {
  return useQuery({
    queryKey: ["words", String(wordId)],
    queryFn: async () => {
      const response = await api.get<{ word: Word }>(`/words/${wordId}`);

      return response.data.word;
    },
  });
}

export function useWordlistSession(wordlistId: string | number, enabled = true) {
  return useQuery({
    queryKey: ["sessions", "wordlists", String(wordlistId)],
    enabled,
    queryFn: async () => {
      const response = await api.get<{
        wordlist: WordList;
        words: Array<{ kind: "word" | "quiz"; payload: Word | Record<string, unknown> }>;
        bookmarked_word_ids: number[];
        is_quiz_only: boolean;
      }>(`/sessions/wordlists/${wordlistId}/start`);

      return response.data;
    },
  });
}

export function useReviewWords(enabled = true) {
  return useQuery({
    queryKey: ["review"],
    enabled,
    queryFn: async () => {
      const response = await api.get<{ words: Paginated<Word> }>("/review");

      return response.data.words.data;
    },
  });
}

export function useSettings(enabled = true) {
  return useQuery({
    queryKey: ["settings"],
    enabled,
    queryFn: async () => {
      const response = await api.get<{
        settings: {
          show_bangla: boolean;
          sound_effects: boolean;
          ui_language: "en" | "bn";
          dark_mode_unlocked: boolean;
        };
      }>("/settings");

      return response.data.settings;
    },
  });
}
