/**
 * @role: pages — PC 여행지 후기 상세 페이지 상태·로직 훅
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpdateTravelReview } from '@/features/TravelReview/hooks/useUpdateTravelReview';
import { useDeleteTravelReview } from '@/features/TravelReview/hooks/useDeleteTravelReview';
import type { TravelReview } from '@/entities/TravelReview/types/travelReviewType';
import type { SortOption } from '../types/travelReviewPageType';

export type { SortOption };

export const usePCTravelReviewPage = (city: string) => {
  const navigate = useNavigate();
  const { updateReview } = useUpdateTravelReview(city);
  const { deleteReview } = useDeleteTravelReview(city);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('최신순');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [saving, setSaving] = useState(false);

  const handleEditStart = (
    id: string,
    title: string,
    content: string,
    rating: number,
  ) => {
    setEditingId(id);
    setEditTitle(title);
    setEditContent(content);
    setEditRating(rating);
  };

  const handleEditSave = async () => {
    if (!editingId || !editTitle.trim() || !editContent.trim()) return;
    setSaving(true);
    await updateReview(
      editingId,
      editTitle.trim(),
      editContent.trim(),
      editRating,
    );
    setSaving(false);
    setEditingId(null);
    navigate(0);
  };

  const handleDelete = async (id: string) => {
    await deleteReview(id);
    navigate(0);
  };

  const sortReviews = (reviews: TravelReview[]) => {
    if (sortOption === '별점순')
      return [...reviews].sort((a, b) => b.rating - a.rating);
    return [...reviews].sort((a, b) => b.createdAt - a.createdAt);
  };

  const filterReviews = (reviews: TravelReview[]) => {
    if (!searchQuery.trim()) return reviews;
    const q = searchQuery.toLowerCase();
    return reviews.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.content.toLowerCase().includes(q),
    );
  };

  const formatDate = (seconds: number) => {
    const d = new Date(seconds * 1000);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const getProcessedReviews = (reviews: TravelReview[]) =>
    sortReviews(filterReviews(reviews));

  const getRatingCounts = (reviews: TravelReview[]) =>
    [5, 4, 3, 2, 1].map((n) => ({
      star: n,
      count: reviews.filter((r) => r.rating === n).length,
      pct:
        reviews.length > 0
          ? (reviews.filter((r) => r.rating === n).length / reviews.length) *
            100
          : 0,
    }));

  return {
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    editingId,
    setEditingId,
    editTitle,
    setEditTitle,
    editContent,
    setEditContent,
    editRating,
    setEditRating,
    saving,
    handleEditStart,
    handleEditSave,
    handleDelete,
    getProcessedReviews,
    getRatingCounts,
    formatDate,
  };
};
