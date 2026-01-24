export type BoardType = {
  onAuthorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  setPreviewImg: React.Dispatch<React.SetStateAction<string | null>>;
  file: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  author: string;
  title: string;
  content: string;
  previewImg: string | null;
};
