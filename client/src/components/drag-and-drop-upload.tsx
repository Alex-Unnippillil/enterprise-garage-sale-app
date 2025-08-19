import { useState, DragEvent, ChangeEvent } from 'react';

interface Props {
  onFiles: (files: File[]) => void;
}

const DragAndDropUpload = ({ onFiles }: Props) => {
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFiles = (files: File[]) => {
    onFiles(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed p-4 text-center"
    >
      <p>Drag & drop files here or click to upload</p>
      <input
        id="file-input"
        type="file"
        multiple
        className="hidden"
        onChange={onChange}
      />
      <label htmlFor="file-input" className="underline cursor-pointer">
        Browse
      </label>
      <div className="flex flex-wrap mt-4">
        {previews.map((src, i) => (
          <img
            key={i}
            src={src}
            alt="preview"
            className="h-20 w-20 object-cover mr-2 mb-2"
          />
        ))}
      </div>
    </div>
  );
};

export default DragAndDropUpload;
