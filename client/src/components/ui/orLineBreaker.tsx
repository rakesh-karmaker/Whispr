export default function OrLine(): React.ReactNode {
  return (
    <p className="w-full relative flex justify-center items-center">
      <span className="z-10 bg-pure-white px-3.5 text-light-dark-gray font-semibold">
        OR
      </span>
      <span className="w-full h-[1px] bg-gray absolute"></span>
    </p>
  );
}
