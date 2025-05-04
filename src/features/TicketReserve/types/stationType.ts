export type StationProps = {
  nodeid: string;
  nodename: string;
}[];

export type QueryDataProps = {
  stations: StationProps;
  isLoading: boolean;
};
