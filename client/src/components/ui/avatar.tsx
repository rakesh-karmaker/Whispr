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
        className="w-[51px] h-[51px] rounded-full object-cover object-center"
        referrerPolicy="no-referrer"
      />
      {isActive && (
        <div className="absolute bottom-0.5 right-2.5 w-2 h-2 bg-teal border-[1.5px] border-white rounded-full"></div>
      )}
    </div>
  );
}
