import { AgeType, GenderType } from '@/shared/types/AuthType';
import { SelectedAgeStore, SelectedGenderStore } from '../model/SignUpStore';

const ages: AgeType[][] = [
  ['10대', '20대', '30대'],
  ['40대', '50대', '60대+'],
];

const genderConfig: { value: GenderType; symbol: string }[] = [
  { value: '남자', symbol: '♂' },
  { value: '여자', symbol: '♀' },
];

const SectionTitle = ({ label }: { label: string }) => (
  <div className="mb-[10px] flex items-baseline gap-1">
    <span className="text-sm font-bold text-black">{label}</span>
    <span className="text-xs text-gray-300">선택</span>
  </div>
);

const SelectAge = () => {
  const { selectedAge, setSelectedAge } = SelectedAgeStore();
  const { selectedGender, setSelectedGender } = SelectedGenderStore();

  return (
    <div className="flex h-full w-[300px] flex-col">
      {/* 성별 */}
      <div className="mt-[20px]">
        <SectionTitle label="성별" />
        <div className="flex w-full gap-[10px]">
          {genderConfig.map(({ value, symbol }) => {
            const isSelected = selectedGender === value;

            return (
              <button
                key={value}
                onClick={() => setSelectedGender(value)}
                className={`flex h-[100px] flex-1 flex-col items-center justify-center gap-1 rounded-xl border text-sm font-bold transition-all ${
                  isSelected
                    ? 'border-blue bg-blue text-white shadow-md'
                    : 'border-lightGray bg-gray-200 text-gray-600 hover:border-mediumGray hover:shadow-sm'
                }`}
              >
                <span className="text-2xl leading-none">{symbol}</span>
                <span>{value}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 나이대 */}
      <div className="mt-[20px]">
        <SectionTitle label="나이대" />
        {ages.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`flex w-full gap-[10px] ${rowIndex > 0 ? 'mt-[10px]' : ''}`}
          >
            {row.map((age) => {
              const isSelected = selectedAge === age;

              return (
                <button
                  key={age}
                  onClick={() => setSelectedAge(age)}
                  className={`flex h-10 flex-1 items-center justify-center rounded-full border text-sm font-bold transition-all ${
                    isSelected
                      ? 'border-blue bg-blue text-white shadow-md'
                      : 'border-lightGray bg-white text-black hover:border-mediumGray hover:shadow-sm'
                  }`}
                >
                  {age}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectAge;
