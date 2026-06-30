/**
 * @role: features — 공지사항 글 작성 상태·핸들러
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당, UI 로직 포함 금지
 */
import { useRef, useState } from 'react';
import { useCreateNotice } from './useCreateNotice';
import { useNavigate } from 'react-router-dom';
import supabase from '@/shared/supabase/supabase';
import { useDeleteNotice } from './useDeleteNotice';

export const useNoticeHandler = () => {
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [views, setViews] = useState<number>(0);
  const [likes, setLikes] = useState<number>(0);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { createNotice } = useCreateNotice();
  const { deleteNotice } = useDeleteNotice();

  const onAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthor(e.target.value);
  };

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const onContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const onViewsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setViews(Number(e.target.value));
  };

  const onLikesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLikes(Number(e.target.value));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onloadend = () => {
        setPreviewImg(reader.result as string);
      };
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const noticeId = await createNotice(author, title, content, views, likes);
      if (file) {
        const filePath = `notice/${noticeId}/${file.name}`;
        const { error } = await supabase.storage
          .from('jarinare-images')
          .upload(filePath, file);
        if (error) {
          if (noticeId) {
            await deleteNotice(noticeId);
          }
          console.error('업로드 오류:', error);
          alert('이미지 업로드 실패. 콘솔을 확인하세요.');
          return;
        }
      }
      navigate('/board/noticelist');
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
    onViewsChange,
    onLikesChange,
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
  };
};
