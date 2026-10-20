/**
 * @role: features — 자유게시판 글 작성 상태·핸들러
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당, UI 로직 포함 금지
 */
import { useEffect, useRef, useState } from 'react';
import { useCreateBoard } from './useCreateBoard';
import { useUpdatePost } from './useUpdatePost';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';
import {
  uploadBoardImageApi,
  deleteUploadedImageApi,
} from '@/features/Board/api/uploadImageApi';
import { toBackendImageUrl } from '@/shared/api/backendClient';
import { BoardDetail } from '@/entities/Board/types/boardType';

const PENDING_KEY = 'pendingBoardImage';

export const useBaordHandler = (options?: {
  onAfterCreate?: (
    posterUid: string,
    posterName: string,
    postDocId: string,
  ) => void;
  navigateTo?: string;
}) => {
  const location = useLocation();
  const editPost = location.state?.editPost as BoardDetail | undefined;
  const isEditMode = !!editPost;

  const originalImageUrl = editPost?.imageUrl ?? null;

  const { user } = useCurrentUser();
  const [author, setAuthor] = useState<string>(
    editPost?.author ?? user?.name ?? '',
  );
  const [title, setTitle] = useState<string>(editPost?.title ?? '');
  const [content, setContent] = useState<string>(editPost?.content ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(
    toBackendImageUrl(editPost?.imageUrl) ?? null,
  );
  const [uploadedImageUrl, setUploadedImageUrlState] = useState<string | null>(
    editPost?.imageUrl ?? null,
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(editPost?.tags ?? []);
  const [tagInput, setTagInput] = useState<string>('');

  // ref로 최신 uploadedImageUrl 추적 (unmount cleanup에서 stale closure 방지)
  const uploadedUrlRef = useRef<string | null>(editPost?.imageUrl ?? null);
  const submitDoneRef = useRef(false);

  const setUploadedImageUrl = (url: string | null) => {
    uploadedUrlRef.current = url;
    setUploadedImageUrlState(url);
  };

  // 새로고침으로 인한 고아파일 정리 (이전 세션에서 업로드만 하고 미제출)
  useEffect(() => {
    const prev = sessionStorage.getItem(PENDING_KEY);
    if (prev) {
      deleteUploadedImageApi(prev).catch(console.error);
      sessionStorage.removeItem(PENDING_KEY);
    }
  }, []);

  // 페이지 이탈 시 미제출 신규 업로드 파일 정리
  useEffect(() => {
    return () => {
      if (!submitDoneRef.current) {
        const url = uploadedUrlRef.current;
        if (url && url !== originalImageUrl) {
          deleteUploadedImageApi(url).catch(console.error);
          sessionStorage.removeItem(PENDING_KEY);
        }
      }
    };
  }, []);

  const navigate = useNavigate();
  const { createBoard } = useCreateBoard();
  const { updatePost } = useUpdatePost();

  const onAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthor(e.target.value);
  };

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const onContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const onTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const onAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (!trimmed || tags.includes(trimmed) || tags.length >= 5) return;
    setTags((prev) => [...prev, trimmed]);
    setTagInput('');
  };

  const onTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onAddTag();
    }
  };

  const onRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const onClearImage = () => {
    const current = uploadedUrlRef.current;
    if (current && current !== originalImageUrl) {
      deleteUploadedImageApi(current).catch(console.error);
      sessionStorage.removeItem(PENDING_KEY);
    }
    setFile(null);
    setPreviewImg(null);
    setUploadedImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // 이미 업로드된 새 파일이 있으면 교체 전 삭제
    const current = uploadedUrlRef.current;
    if (current && current !== originalImageUrl) {
      deleteUploadedImageApi(current).catch(console.error);
      sessionStorage.removeItem(PENDING_KEY);
    }

    setFile(selected);
    setUploadedImageUrl(null);

    const reader = new FileReader();
    reader.readAsDataURL(selected);
    reader.onloadend = () => setPreviewImg(reader.result as string);

    setUploading(true);
    try {
      const url = await uploadBoardImageApi(selected);
      setUploadedImageUrl(url);
      // 새로고침 대비: 업로드된 URL을 sessionStorage에 저장
      sessionStorage.setItem(PENDING_KEY, url);
    } catch {
      setUploadedImageUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode && editPost) {
        await updatePost(editPost.id, {
          type: 'free',
          title,
          content,
          imageUrl: uploadedImageUrl,
        });
      } else {
        const result = await createBoard({
          type: 'free',
          title,
          content,
          tags,
          imageUrl: uploadedImageUrl ?? undefined,
        });
        if (user && result) {
          options?.onAfterCreate?.(user.userId, user.name, String(result.id));
        }
      }
      submitDoneRef.current = true;
      sessionStorage.removeItem(PENDING_KEY);
      navigate(options?.navigateTo ?? '/board');
    } catch (err) {
      console.error('오류:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    onAuthorChange,
    onTitleChange,
    onContentChange,
    onFileChange,
    onClearImage,
    onSubmit,
    setFile,
    setPreviewImg,
    file,
    fileInputRef,
    author,
    title,
    content,
    previewImg,
    loading,
    uploading,
    tags,
    tagInput,
    onTagInputChange,
    onTagInputKeyDown,
    onAddTag,
    onRemoveTag,
    isEditMode,
  };
};
