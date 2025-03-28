export type ReserveTitleProp = {
  text: string;
};

export type SeatCheckButtonProps = {
  text: string;
  bgColor: string;
  textColor: string;
  onClick: () => void;
};

export type SeatProps = {
  bgColor: string;
  borderColor: string;
  onClick?: () => void;
};
