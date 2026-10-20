/**
 * @role: features — 이벤트 글 작성 상태·핸들러
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당, UI 로직 포함 금지
 */
import { useEffect, useRef, useState } from 'react';
import { useCreateEvent } from './useCreateEvent';
import { useUpdatePost } from './useUpdatePost';
import { useNavigate, useLocation } from 'react-router-dom';
import { uploadBoardImageApi, deleteUploadedImageApi } from '@/features/Board/api/uploadImageApi';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';
import { toBackendImageUrl } from '@/shared/api/backendClient';
import { BoardDetail } from '@/entities/Board/types/boardType';

const PENDING_KEY = 'pendingEventImage';

export const useEventHandler = (options?: { navigateTo?: string }) => {
  const location = useLocation();
  const editPost = location.state?.editPost as BoardDetail | undefined;
  const isEditMode = !!editPost;

  const originalImageUrl = editPost?.imageUrl ?? null;

  const { user } = useCurrentUser();
  const [author, setAuthor] = useState(editPost?.author ?? user?.name ?? '');
  const [title, setTitle] = useState(editPost?.title ?? '');
  const [content, setContent] = useState(editPost?.content ?? '');
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

  const uploadedUrlRef = useRef<string | null>(editPost?.imageUrl ?? null);
  const submitDoneRef = useRef(false);

  const setUploadedImageUrl = (url: string | null) => {
    uploadedUrlRef.current = url;
    setUploadedImageUrlState(url);
  };

  useEffect(() => {
    const prev = sessionStorage.getItem(PENDING_KEY);
    if (prev) {
      deleteUploadedImageApi(prev).catch(console.error);
      sessionStorage.removeItem(PENDING_KEY);
    }
  }, []);

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
  const { createEvent } = useCreateEvent();
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
        await updatePost(editPost.id, { type: 'event', title, content, imageUrl: uploadedImageUrl });
      } else {
        await createEvent(title, content, uploadedImageUrl ?? undefined);
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
    isEditMode,
  };
};
