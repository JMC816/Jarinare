/**
 * @role: shared — 스타일드 QR코드 공용 컴포넌트
 * @rule: qr-code-styling 라이브러리 래퍼, UI 로직 없음
 */
import QRCodeStyling from 'qr-code-styling';
import { useEffect, useRef } from 'react';

interface StyledQRCodeProps {
  value: string;
  size?: number;
}

const StyledQRCode = ({ value, size = 200 }: StyledQRCodeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling({
        width: size,
        height: size,
        data: value,
        dotsOptions: {
          type: 'extra-rounded',
          color: '#000000',
        },
        cornersSquareOptions: {
          type: 'extra-rounded',
          color: '#000000',
        },
        cornersDotOptions: {
          type: 'dot',
          color: '#000000',
        },
        backgroundOptions: {
          color: 'rgba(0,0,0,0)',
        },
        qrOptions: {
          errorCorrectionLevel: 'M',
        },
      });
      qrRef.current.append(containerRef.current);
    } else {
      qrRef.current.update({ data: value, width: size, height: size });
    }
  }, [value, size]);

  return <div ref={containerRef} />;
};

export default StyledQRCode;
