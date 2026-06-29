/**
 * @role: widgets — PC 글 작성 폼 카드
 * @rule: 렌더링·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useNavigate } from 'react-router-dom';
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import cross from '@/assets/icons/cross.png';
import { PCWriteFormProps } from '../types/boardWidgetType';

const PCWriteForm = ({
  categoryLabel,
  backLabel,
  author,
  onAuthorChange,
  title,
  onTitleChange,
  content,
  onContentChange,
  previewImg,
  onFileChange,
  fileInputRef,
  setFile,
  setPreviewImg,
  onSubmit,
}: PCWriteFormProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <PCTopNav hasNotification={false} />

      <div className="flex w-full flex-1 gap-0">
        <PCSidebar />

        <main
          className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
          style={{ height: 'calc(100vh - 3.5rem)' }}
        >
          <div className="px-64 pb-16 pt-10">
            {/* 뒤로가기 */}
            <button
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {backLabel}
            </button>

            {/* 대제목 */}
            <h1 className="mb-6 text-2xl font-black text-gray-900">글쓰기</h1>

            {/* 글 작성 카드 */}
            <form
              onSubmit={onSubmit}
              className="flex flex-col gap-6 rounded-xl bg-white p-8 shadow-sm"
            >
              {/* 분류 + 작성자 수평 정렬 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-gray-400">분류</span>
                  <div className="rounded-sm border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400">
                    {categoryLabel}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-gray-400">
                    작성자
                  </span>
                  <input
                    value={author}
                    onChange={onAuthorChange}
                    required
                    placeholder="작성자를 입력하세요"
                    className="rounded-sm border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-300 focus:border-blue"
                  />
                </div>
              </div>

              {/* 제목 */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-gray-400">제목</span>
                <input
                  value={title}
                  onChange={onTitleChange}
                  required
                  placeholder="제목을 입력하세요"
                  className="rounded-sm border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-300 focus:border-blue"
                />
              </div>

              {/* 내용 */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-gray-400">내용</span>
                <textarea
                  value={content}
                  onChange={onContentChange}
                  required
                  rows={11}
                  placeholder="내용을 입력하세요"
                  className="resize-none rounded-sm border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-300 focus:border-blue"
                />
              </div>

              {/* 사진 첨부 */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-gray-400">
                  사진 첨부
                </span>

                {/* 미리보기 */}
                {previewImg ? (
                  <div className="relative w-fit">
                    <img
                      src={previewImg}
                      alt="미리보기"
                      className="h-[120px] w-[120px] rounded-sm border border-gray-200 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setPreviewImg(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = '';
                      }}
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow"
                    >
                      <img src={cross} width={10} height={10} />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="pc-file"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed border-gray-200 py-6 transition-colors hover:border-gray-400"
                    style={{ backgroundColor: '#f8fbff' }}
                  >
                    <span className="text-3xl">📷</span>
                    <span className="text-sm font-semibold text-gray-400">
                      클릭하여 사진을 첨부하세요
                    </span>
                    <span className="text-xs text-gray-300">JPG, PNG</span>
                  </label>
                )}
                <input
                  onChange={onFileChange}
                  ref={fileInputRef}
                  id="pc-file"
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                />
              </div>

              {/* 버튼 오른쪽 정렬 */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="rounded-sm border border-gray-200 px-6 py-2.5 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-sm bg-blue px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue/90"
                >
                  작성 완료
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PCWriteForm;
