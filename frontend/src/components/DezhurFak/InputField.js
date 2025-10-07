// InputField.js
import React, { forwardRef } from 'react';

const InputField = forwardRef((
  { name, value, onChange, type = 'text', placeholder, required = false, options = [] },
  ref
) => (
  type === 'select' ? (
    <select
      ref={ref}
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      className="border border-gray-300 rounded-lg px-2 py-1 w-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all input-field"
    >
      <option value="" disabled>Причина</option>
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  ) : (
    <input
      ref={ref}
      name={name}
      type={type}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="border border-gray-300 rounded-lg px-2 py-1 w-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all input-field"
    />
  )
));

export default InputField;
