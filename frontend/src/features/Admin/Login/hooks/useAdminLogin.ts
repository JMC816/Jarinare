/**
 * @role: features/hooks — 어드민 로그인 처리
 * @rule: 로그인 후 /admin/dashboard 로 이동, role 분기는 AdminGuard 에서 처리
 */
import { useState } from 'react';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { backendClient, ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';

export const useAdminLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const { data: tokens } = await backendClient.post<{ accessToken: string }>(
        '/oauth/login',
        { email, password },
      );
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      // SPA 이동(navigate)은 in-memory 캐시에 즉시 반영되므로 stale 캐시 문제 없음
      queryClient.removeQueries({ queryKey: ['currentUser'] });
      navigate('/admin/dashboard');
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        const status = e.response?.status;
        const code = e.response?.data?.code;
        if (status === 403 && code === 'ACCOUNT_SUSPENDED')
          setErrorMsg('정지된 계정입니다. 고객센터에 문의해 주세요.');
        else if (status === 401)
          setErrorMsg('이메일 또는 비밀번호가 올바르지 않습니다.');
        else {
          console.error('[AdminLogin] 오류:', e);
          setErrorMsg('로그인 중 오류가 발생했습니다.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, errorMsg, isLoading, handleSubmit };
};
