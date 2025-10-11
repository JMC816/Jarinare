export interface BoardPost {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  isNotice: boolean;
  category?: string;
  imageUrl?: string;
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
