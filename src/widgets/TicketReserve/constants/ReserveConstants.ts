import square from '@/assets/icons/square.png';
import group from '@/assets/icons/group.png';
import calendar from '@/assets/icons/calendar.png';
import person from '@/assets/icons/person.png';
import check from '@/assets/icons/check.png';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';

export const reserveConstants = () => {
  const { startStation, endStation, startDay, kid, adult } = trainDataStore();

  const recommendStationArray = [
    {
      text: '서울',
    },
    {
      text: '대전',
    },
    {
      text: '부산',
    },
    {
      text: '대구',
    },
    {
      text: '울산',
    },
    {
      text: '부전',
    },
    {
      text: '천안아산',
    },
    {
      text: '광명',
    },
    {
      text: '동대구',
    },
    {
      text: '오송',
    },
  ];
  const trainArray = [
    {
      train: 'KTX',
      icon: check,
    },
    {
      train: 'KTX-산천',
      icon: check,
    },
    {
      train: 'ITX-새마을호',
      icon: check,
    },
    {
      train: '무궁화호',
      icon: check,
    },
  ];
  const timeArray = [
    {
      time: '05:00',
    },
    {
      time: '06:00',
    },
    {
      time: '07:00',
    },
    {
      time: '08:00',
    },
    {
      time: '09:00',
    },
    {
      time: '10:00',
    },
    {
      time: '11:00',
    },
    {
      time: '12:00',
    },
    {
      time: '13:00',
    },
    {
      time: '14:00',
    },
    {
      time: '15:00',
    },
    {
      time: '16:00',
    },
    {
      time: '17:00',
    },
    {
      time: '18:00',
    },
    {
      time: '19:00',
    },
    {
      time: '20:00',
    },
    {
      time: '21:00',
    },
    {
      time: '22:00',
    },
    {
      time: '23:00',
    },
    {
      time: '24:00',
    },
  ];
  const trainNumberArray = [
    {
      trainNumber: '1호차 잔여 23석/60석',
      icon: check,
    },
    {
      trainNumber: '2호차 잔여 23석/60석',
      icon: check,
    },
    {
      trainNumber: '3호차 잔여 23석/60석',
      icon: check,
    },
    {
      trainNumber: '4호차 잔여 23석/60석',
      icon: check,
    },
  ];
  const reserveWayArray = [
    {
      icon: square,
      text: startStation === '' ? '출발지를 선택하세요' : startStation,
      attribute: '출발',
      buttonText: '변경',
      modalType: 'StartPlaceModal',
    },
    {
      icon: group,
      text: endStation === '' ? '도착지를 선택하세요' : endStation,
      attribute: '도착',
      buttonText: '변경',
      modalType: 'EndPlaceModal',
    },
    {
      icon: calendar,
      text: startDay === '' ? '날짜를 선택하세요' : startDay,
      attribute: '가는날',
      buttonText: '변경',
      modalType: 'DayModal',
    },
    {
      icon: person,
      text: kid === 0 && adult === 0 ? '인원을 선택하세요' : adult + kid + '명',
      attribute: '인원',
      buttonText: '변경',
      modalType: 'CountModal',
    },
  ] as const;
  const trainListArray = [
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
  return {
    recommendStationArray,
    trainArray,
    timeArray,
    trainNumberArray,
    reserveWayArray,
    trainListArray,
  };
};
