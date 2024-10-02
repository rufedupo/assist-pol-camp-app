import { useState } from "react";

const PhoneInput = ({ id, name, contact, required, setContact }) => {
  const [value, setValue] = useState(contact);

  const handleChange = (e) => {
    const inputValue = e.target.value
      .replace(/\D/g, "") // Remove todos os caracteres não numéricos
      .replace(/^(\d{2})(\d)/, "($1) $2 ") // Adiciona parênteses
      .replace(/(\d{4})(\d)/, "$1-$2"); // Adiciona o hífen
    setValue(inputValue);
    setContact(inputValue);
  };  

  return (
    <>
      <label htmlFor={id}>Contato:</label>
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        required={required}
        maxLength={16} 
      />
    </>
  );
};

export default PhoneInput;