import AuthContent from '@/shared/ui/AuthContent';
import { AgeType } from '@/shared/types/AuthType';
import { SelectedAgeStore } from '../model/SignUpStore';

const ages: AgeType[][] = [
  ['10대', '20대', '30대'],
  ['40대', '50대', '60대+'],
];

const SelectAge = () => {
  const { selectedAge, setSelectedAge } = SelectedAgeStore();
  return (
    <div className="flex h-full w-[300px] flex-col">
      <AuthContent type="age" title="회원가입" subtitle="나이대" />
      <div className="mt-[10px] w-full border border-lightGray pl-[10px] pr-[10px]" />
      {ages.map((row, rowIndex) => (
        <div key={rowIndex} className="mt-[20px] flex w-full justify-between">
          {row.map((age) => {
            const isSelected = selectedAge === age;

            // 숫자만 추출 (10, 20, ...)
            const ageNumber = age.replace('대', '');
            return (
              <button
                key={age}
                onClick={() => setSelectedAge(age)}
                className="flex flex-col items-center"
              >
                <div
                  className={`flex h-[80px] w-[80px] items-center justify-center rounded-full transition ${isSelected ? 'bg-blue text-white' : 'bg-lightGray'} `}
                >
                  <span className="text-lg font-semibold">{ageNumber}</span>
                </div>
                <span className="mt-[8px] text-sm">{age}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default SelectAge;
