import { useEffect, useRef, useState } from "react";
import "./App.css";
import useContactSearch from "./hooks/useContactSearch";
import MultiSelectDropdown from "./components/ui/multiSelectDropdown";

type Option = {
  id: string;
  name: string;
};

function App() {
  const [query, setQuery] = useState<string>("");
  const { contacts } = useContactSearch(query, 1);
  // console.log(contacts);
  const [selected, setSelected] = useState<Option[]>([]);
  const lastElementRef = useRef<HTMLLabelElement>(null);

  return (
    <>
      <input
        type="text"
        name="hello"
        id="hello"
        onChange={(e) => setQuery(e.target.value)}
      />
      <MultiSelectDropdown
        data={contacts.filter(
          (contact) => !selected.some((s) => s.id === contact._id)
        )}
        setSelected={setSelected}
        lastRef={lastElementRef}
      />
    </>
  );
}

export default App;
