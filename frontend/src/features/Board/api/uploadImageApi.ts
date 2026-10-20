/**
 * @role: features/api — 게시판 이미지 업로드
 * @rule: backendClient 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';

export const uploadBoardImageApi = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await backendClient.post<{ imageUrl: string }>(
    '/api/upload/board',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.imageUrl;
};

export const deleteUploadedImageApi = async (imageUrl: string): Promise<void> => {
  await backendClient.delete('/api/upload/board', { data: { imageUrl } });
};
