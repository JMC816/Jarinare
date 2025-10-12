import { useHideRoute } from '../hooks/useHideRoute';
import { StartTimeNotificationModal } from './StartTimeNotificationModal';
import { useControlStartTime } from '../hooks/useControlStartTime';

const Modal = () => {
  const { hideRoute } = useHideRoute();
  const { timeDifferenceData } = useControlStartTime();

  return (
    <div className="absolute">
      {!hideRoute && timeDifferenceData[0].length > 0
        ? timeDifferenceData.map((item, idx) => (
            <StartTimeNotificationModal key={idx} timeDifferenceData={item} />
          ))
        : null}
    </div>
  );
};

export default Modal;
