import { ReserveModalTypes } from '@/shared/types/ModalType';
import { ReactNode } from 'react';

export type Store = {
  modalType: ReserveModalTypes | null;
  isShow: boolean;
  openModal: (type: ReserveModalTypes) => void;
  closeModal: (type: ReserveModalTypes) => void;
};

export type ReserveProps = {
  text: string;
};

export type ReservePlaceholder = {
  placeholder: string;
};

type ValuePiece = Date | null;
export type Value = ValuePiece | [ValuePiece, ValuePiece];

export type CountProps = {
  count: number;
  setCount: (type: React.SetStateAction<number>) => void;
};

export type ChocieReusltListProps = {
  title: string;
  text: ReactNode;
};

export type ChocieResultButtonProps = {
  text: string;
  bgColor: string;
  textColor: string;
  onClick: () => void;
};

export type PlaceModalProp = {
  modalType: ReserveModalTypes | null;
};

export type ReserveTitleProp = {
  text: string;
};

export type SeatCheckButtonProps = {
  text: string;
  bgColor: string;
  textColor: string;
  onClick: (() => Promise<void>) | (() => void) | null;
};

export type SeatProps = {
  bgColor: string;
  borderColor: string;
  onClick?: () => void;
};
