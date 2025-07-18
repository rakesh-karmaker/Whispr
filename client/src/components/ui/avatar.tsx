export default function Avatar({
  src,
  isActive,
  name,
}: {
  src: string;
  isActive: boolean;
  name: string;
}) {
  if (!src) return null;
  return (
    <div className="relative">
      <img
        src={src}
        alt={`Pic of ${name}`}
        className={
          "min-w-11 min-h-11 max-w-11 max-h-11 rounded-full object-cover object-center"
        }
        referrerPolicy="no-referrer"
      />
      {isActive && (
        <div className="absolute bottom-[0px] right-[5%] w-3 h-3 bg-teal border-[2px] border-white rounded-full"></div>
      )}
    </div>
  );
}
