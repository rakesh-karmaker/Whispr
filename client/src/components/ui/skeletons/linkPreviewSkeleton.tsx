export default function LinkPreviewSkeleton() {
  return (
    <div className="flex gap-2.5 items-center">
      <div className="min-w-15 aspect-square rounded-md skeleton" />
      <div className="w-full flex flex-col gap-2">
        <span className="skeleton w-[80%] h-4 rounded-2xl" />
        <span className="skeleton w-[60%] h-3 rounded-2xl" />
      </div>
    </div>
  );
}
