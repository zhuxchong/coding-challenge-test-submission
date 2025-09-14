import React, { FunctionComponent } from "react";

import $ from "./Radio.module.css";

interface RadioProps {
  id: string;
  name: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children: React.ReactNode;
  checked: boolean;
}

const Radio: FunctionComponent<RadioProps> = ({
  children,
  id,
  name,
  onChange,
  checked,
}) => {
  const handleDivClick = () => {
    const input = document.getElementById(id) as HTMLInputElement;
    if (input && !checked) {
      input.click();
    }
  };

  return (
    <div className={$.radio} onClick={handleDivClick}>
      <input
        type="radio"
        id={id}
        name={name}
        onChange={onChange}
        value={id}
        checked={checked}
        onClick={(e) => e.stopPropagation()}
      />
      <label htmlFor={id} className="text1" onClick={(e) => e.stopPropagation()}>
        {children}
      </label>
    </div>
  );
};

export default Radio;
