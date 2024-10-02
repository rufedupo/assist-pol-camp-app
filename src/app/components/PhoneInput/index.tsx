import { useState } from "react";

const PhoneInput = ({ id, name, contact, required, setContact }) => {
  const [value, setValue] = useState(contact);

  const handleChange = (e) => {
    let inputValue = e.target.value.replace(/\D/g, ""); // Remove todos os caracteres não numéricos
  
    if (inputValue.length > 10) {
      inputValue = inputValue
        .replace(/^(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 $3-$4");
    } else if (inputValue.length <= 10) {
      inputValue = inputValue
        .replace(/^(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
  
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