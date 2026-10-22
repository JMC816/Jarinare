import { useHideRoute } from '../hooks/useHideRoute';
import { memo } from 'react';

const Modal = memo(() => {
  const { hideRoute } = useHideRoute();
  if (hideRoute) return null;
  return null;
});

Modal.displayName = 'Modal';

export default Modal;
