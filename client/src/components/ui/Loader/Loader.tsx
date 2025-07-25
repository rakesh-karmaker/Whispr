import "./Loader.css";

const Loader = ({ className }: { className?: string }) => {
  return (
    <div className={"loader col-center" + (className ? " " + className : "")}>
      <svg viewBox="25 25 50 50">
        <circle r="20" cy="50" cx="50"></circle>
      </svg>
      <p>Loading...</p>
    </div>
  );
};

export default Loader;
