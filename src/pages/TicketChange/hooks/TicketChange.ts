import { useNavigate } from 'react-router-dom';

export const navigate = () => {
  const moveSeatChangePage = useNavigate();
  return { moveSeatChangePage };
};
