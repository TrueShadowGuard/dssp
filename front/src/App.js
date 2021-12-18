import {useRef, useState} from "react";
import getDsspResults from "./getDsspResults";

const hintText = `You must:
select a file
enter its name
select at least one checkbox
`


function App() {

  const fileRef = useRef();

  const [checkBoxes, setCheckBoxes] = useState({our: false, their: false, diff: false});

  const isGetResultDisabled = (
    Object.values(checkBoxes).every(c => c === false) ||
    fileRef.current.files.length === 0
  );

  return (
    <div>
      <label>
        Pdb file:
        <input type="file" ref={fileRef}/>
      </label> <br/>
      <fieldset>
        <label>
          <input type="checkbox"
                 value={checkBoxes.our}
                 onChange={e => setCheckBoxes({...checkBoxes, our: e.target.checked})}
          />
          Our dssp
          <br/>
        </label>
        <label>
          <input type="checkbox"
                 value={checkBoxes.their}
                 onChange={e => setCheckBoxes({...checkBoxes, their: e.target.checked})}
          />
          Their dssp
          <br/>
        </label>
        <label>
          <input type="checkbox"
                 value={checkBoxes.diff}
                 onChange={e => setCheckBoxes({...checkBoxes, diff: e.target.checked})}
          />
          Our dssp with difference
          <br/>
        </label>
      </fieldset>
      <button
        onClick={() => getDsspResults(fileRef.current.files[0], checkBoxes)}
        disabled={isGetResultDisabled}
        title={isGetResultDisabled ? hintText : ""}
      >
        Get result
      </button>
    </div>
  );
}

export default App;
