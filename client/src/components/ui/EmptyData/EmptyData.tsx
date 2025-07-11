import "./EmptyData.css";
import { TbMoodSad } from "react-icons/tb";

const EmptyData = ({ className }: { className?: string }) => {
  return (
    <div
      className={"empty-data col-center" + (className ? " " + className : "")}
    >
      <TbMoodSad />
      <p>
        No <span className="highlighted-text">results</span> found
      </p>
    </div>
  );
};

export default EmptyData;
