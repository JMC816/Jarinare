export interface TravelReview {
  id: number;
  author: string;
  title: string;
  content: string;
  rating: number;
  createdAt: string;
  imageUrl?: string | null;
  tags: string[];
}

export interface DestinationReviewSummary {
  city: string;
  averageRating: number;
  reviewCount: number;
}
