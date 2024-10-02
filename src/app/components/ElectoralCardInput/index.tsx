import { useState } from "react";

const ElectoralCardInput = ({ id, name, electoralCard, required, setElectoralCard }) => {
  const [value, setValue] = useState(electoralCard);

  const handleChange = (e) => {
   const inputValue = e.target.value
      .replace(/\D/g, "") 
      .replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3'); 
    setValue(inputValue);
    setElectoralCard(inputValue);
  };  

  return (
    <>
      <label htmlFor={id}>Número do Título:</label>
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        required={required}
        maxLength={14} 
      />
    </>
  );
};

export default ElectoralCardInput;