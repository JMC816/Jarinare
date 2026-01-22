import { useRef, useState } from 'react';
import { useCreateEvent } from './useCreateEvent';
import { useNavigate } from 'react-router-dom';
import supabase from '@/shared/supabase/supabase';

export const useEventHandler = () => {
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { createEvent } = useCreateEvent();

  const onAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthor(e.target.value);
  };

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const onContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const eventId = await createEvent(author, title, content);
      if (file) {
        const filePath = `eoard/${eventId}/${file.name}`;
        const { error } = await supabase.storage
          .from('jarinare-images')
          .upload(filePath, file);
        if (error) {
          console.error('업로드 오류:', error);
          alert('이미지 업로드 실패. 콘솔을 확인하세요.');
          return;
        }
      }
      navigate('/board');
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
