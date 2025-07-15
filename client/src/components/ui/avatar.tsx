export default function Avatar({
  src,
  isActive,
  name,
}: {
  src: string;
  isActive: boolean;
  name: string;
}) {
  return (
    <div className="relative">
      <img
        src={src}
        alt={`Pic of ${name}`}
        className="min-w-[51px] min-h-[51px] max-w-[51px] max-h-[51px] rounded-full object-cover object-center"
        referrerPolicy="no-referrer"
      />
      {isActive && (
        <div className="absolute bottom-[0px] right-[4px] w-3 h-3 bg-teal border-[2px] border-white rounded-full"></div>
      )}
    </div>
  );
}
