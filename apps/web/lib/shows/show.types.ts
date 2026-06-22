export type ShowListItem = {
  id: number;
  name: string;
  type: string;
  language: string;
  genres: string[];
  status: string;
  premieredYear: string | null;
  endedYear: string | null;
  weight: number;
  imageUrl: string | null;
  summary: string;
};

export type WatchedShowItem = {
  id: number;
  name: string;
};

export type ListShowsResult = {
  shows: ShowListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: string;
};
