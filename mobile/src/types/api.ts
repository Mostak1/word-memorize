export type Category = {
  id: number;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  is_locked: boolean;
  has_access: boolean;
  wordlists_count: number;
  words_count: number;
};

export type WordList = {
  id: number;
  title: string;
  difficulty: string | null;
  category_id: number;
  is_locked: boolean;
  has_access: boolean;
  words_count: number;
  mastered_count: number;
  quiz_eligible: boolean;
  has_quiz: boolean;
};

export type Word = {
  id: number;
  wordlist_id: number;
  word: string;
  pronunciation: string | null;
  ipa: string | null;
  bangla_pronunciation: string | null;
  definition: string | null;
  bangla_meaning: string | null;
  example_sentences: string | null;
  synonym: string | null;
  antonym: string | null;
  image_url: string | null;
  images?: Array<{ id: number; url: string | null; caption: string | null }>;
  is_bookmarked: boolean;
};

export type Paginated<T> = {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};
