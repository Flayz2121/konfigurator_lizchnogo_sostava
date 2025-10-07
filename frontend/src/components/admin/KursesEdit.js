// src/components/admin/KursesEdit.js
import React from 'react';
import { Edit, SimpleForm, TextInput, NumberInput, ReferenceInput, SelectInput } from 'react-admin';

export const KursesEdit = function (props) {
  return React.createElement(Edit, props,
    React.createElement(SimpleForm, null,
      React.createElement(ReferenceInput, { source: 'user_id', reference: 'users' },
        React.createElement(SelectInput, { optionText: 'username' })
      ),
      React.createElement(TextInput, { source: 'name_kurs' }),
      React.createElement(NumberInput, { source: 'number_of_kurs' }),
      React.createElement(NumberInput, { source: 'p_s' }),
      React.createElement(NumberInput, { source: 'n_l' }),
      React.createElement(NumberInput, { source: 'b' }),
      React.createElement(NumberInput, { source: 'n' }),
      React.createElement(NumberInput, { source: 'y' }),
      React.createElement(NumberInput, { source: 'k' }),
      React.createElement(NumberInput, { source: 'o' })
    )
  );
};