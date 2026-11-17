/**
 * @role: features/hooks — 프로필 드롭다운 열림/닫힘 상태
 * @rule: UI 상태 관리만 담당
 */
import { useState } from 'react';

export const useProfileDropdown = () => {
  const [profileOpen, setProfileOpen] = useState(false);

  const toggle = () => setProfileOpen(v => !v);
  const close = () => setProfileOpen(false);

  return { profileOpen, toggle, close };
};
