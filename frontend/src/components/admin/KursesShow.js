// src/components/admin/KursesShow.js
import React from 'react';
import { Show, SimpleShowLayout, TextField, NumberField, ReferenceField } from 'react-admin';

export const KursesShow = function (props) {
  return React.createElement(Show, props,
    React.createElement(SimpleShowLayout, null,
      React.createElement(TextField, { source: 'id' }),
      React.createElement(ReferenceField, { source: 'user', reference: 'users' },
        React.createElement(TextField, { source: 'username' })
      ),
      React.createElement(TextField, { source: 'name_kurs' }),
      React.createElement(NumberField, { source: 'number_of_kurs' }),
      React.createElement(NumberField, { source: 'p_s' }),
      React.createElement(NumberField, { source: 'n_l' }),
      React.createElement(NumberField, { source: 'b' }),
      React.createElement(NumberField, { source: 'n' }),
      React.createElement(NumberField, { source: 'y' }),
      React.createElement(NumberField, { source: 'k' }),
      React.createElement(NumberField, { source: 'o' })
    )
  );
};