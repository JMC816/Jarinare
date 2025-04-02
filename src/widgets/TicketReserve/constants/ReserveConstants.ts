import square from '@/assets/icons/square.png';
import group from '@/assets/icons/group.png';
import calendar from '@/assets/icons/calendar.png';
import person from '@/assets/icons/person.png';

export const ReserveWayArray = [
  {
    icon: square,
    text: '출발지를 선택하세요',
    attribute: '출발',
    buttonText: '변경',
    modal: 'StartPlaceModal',
  },
  {
    icon: group,
    text: '도착지를 선택하세요',
    attribute: '도착',
    buttonText: '변경',
    modal: 'EndPlaceModal',
  },
  {
    icon: calendar,
    text: '날짜를 선택하세요',
    attribute: '가는날',
    buttonText: '변경',
    modal: 'DayModal',
  },
  {
    icon: person,
    text: '인원을 선택하세요',
    attribute: '인원',
    buttonText: '변경',
    modal: 'CountModal',
  },
] as const;

export const TrainListArray = [
  {
    startTime: '오전 5:03',
    endTime: '오전 6:02',
    trainName: 'KTX-산천 201',
    takeTime: '59분',
  },
  {
    startTime: '오전 5:03',
    endTime: '오전 6:02',
    trainName: 'KTX-산천 201',
    takeTime: '59분',
  },
  {
    startTime: '오전 5:03',
    endTime: '오전 6:02',
    trainName: 'KTX-산천 201',
    takeTime: '59분',
  },
  {
    startTime: '오전 5:03',
    endTime: '오전 6:02',
    trainName: 'KTX-산천 201',
    takeTime: '59분',
  },
  {
    startTime: '오전 5:03',
    endTime: '오전 6:02',
    trainName: 'KTX-산천 201',
    takeTime: '59분',
  },
  {
    startTime: '오전 5:03',
    endTime: '오전 6:02',
    trainName: 'KTX-산천 201',
    takeTime: '59분',
  },
  {
    startTime: '오전 5:03',
    endTime: '오전 6:02',
    trainName: 'KTX-산천 201',
    takeTime: '59분',
  },
  {
    startTime: '오전 5:03',
    endTime: '오전 6:02',
    trainName: 'KTX-산천 201',
    takeTime: '59분',
  },
];
