/**
 * @role: pages — 여행지 후기 상세 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import backward from '@/assets/icons/backward.png';
import { auth } from '@/shared/firebase/firebase';
import { useGetTravelReviews } from '@/features/TravelReview/hooks/useGetTravelReviews';
import { useDeleteTravelReview } from '@/features/TravelReview/hooks/useDeleteTravelReview';
import { useUpdateTravelReview } from '@/features/TravelReview/hooks/useUpdateTravelReview';
import StarRating from '@/shared/ui/StarRating';

const formatDate = (seconds: number) => {
  const d = new Date(seconds * 1000);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const StarPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className={`text-xl ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </button>
    ))}
  </div>
);

const TravelReviewPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const city: string = state?.city ?? '';

  const currentUser = auth.currentUser;
  const { reviews, isLoaded, averageRating } = useGetTravelReviews(city);
  const { deleteReview } = useDeleteTravelReview(city);
  const { updateReview } = useUpdateTravelReview(city);

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

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100">
      {/* 헤더 */}
      <div className="flex w-full shrink-0 items-center gap-4 bg-blue px-[28px] py-4">
        <img
          onClick={() => navigate(-1)}
          src={backward}
          className="h-[20px] w-[12px] cursor-pointer brightness-0 invert"
        />
        <span className="text-lg font-bold text-white">{city} 후기</span>
      </div>

      {/* 평균 별점 */}
      <div className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-1 text-xs text-gray-400">평균 별점</p>
        <div className="flex items-center gap-2">
          <StarRating rating={averageRating} />
          <span className="text-sm font-bold text-gray-800">
            {reviews.length > 0 ? averageRating.toFixed(1) : '-'}
          </span>
          <span className="text-xs text-gray-400">
            ({reviews.length}개 후기)
          </span>
        </div>
      </div>

      {/* 후기 목록 */}
      <div className="mt-3 flex flex-col gap-3 px-4 pb-6">
        {!isLoaded && (
          <div className="flex h-20 items-center justify-center text-sm text-gray-400">
            불러오는 중...
          </div>
        )}
        {isLoaded && reviews.length === 0 && (
          <div className="flex h-20 items-center justify-center rounded-2xl bg-white text-sm text-gray-400 shadow-sm">
            아직 후기가 없습니다.
          </div>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="rounded-2xl bg-white p-4 shadow-sm">
            {editingId === review.id ? (
              /* 수정 폼 */
              <div className="flex flex-col gap-2">
                <StarPicker value={editRating} onChange={setEditRating} />
                <input
                  className="w-full rounded-lg bg-gray-100 px-3 py-2 text-sm outline-none"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <textarea
                  className="w-full rounded-lg bg-gray-100 px-3 py-2 text-sm outline-none"
                  rows={3}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleEditSave}
                    disabled={saving}
                    className="flex-1 rounded-xl bg-blue py-2 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {saving ? '저장 중...' : '저장'}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 rounded-xl bg-gray-100 py-2 text-xs font-bold text-gray-500"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              /* 후기 카드 */
              <>
                <div className="mb-1 flex items-center justify-between">
                  <StarRating rating={review.rating} />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">
                      {review.author}
                    </span>
                    {currentUser?.displayName === review.author && (
                      <>
                        <button
                          onClick={() =>
                            handleEditStart(
                              review.id,
                              review.title,
                              review.content,
                              review.rating,
                            )
                          }
                          className="text-[10px] text-blue underline"
                        >
                          수정
                        </button>
                        <button
                          onClick={async () => {
                            await deleteReview(review.id);
                            navigate(0);
                          }}
                          className="text-[10px] text-red underline"
                        >
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-800">
                  {review.title}
                </p>
                <p className="mt-1 text-xs text-gray-500">{review.content}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">
                    {formatDate(review.createdAt)}
                  </span>
                  {review.updatedAt && (
                    <span className="text-[10px] text-gray-400">
                      · 수정됨 {formatDate(review.updatedAt)}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TravelReviewPage;
