export interface BoardPost {
  id: string;
  author: string;
  content: string;
  title: string;
  views: number;
  likes: number;
  createdAt: number;
  imageUrl: string | null;
}

export interface BoardCategory {
  id: string;
  name: string;
  description?: string;
}

export interface BoardState {
  posts: BoardPost[];
  categories: BoardCategory[];
  currentCategory: string | null;
  isLoading: boolean;
  error: string | null;
}
