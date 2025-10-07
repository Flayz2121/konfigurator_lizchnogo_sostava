// src/components/admin/UsersShow.js
import React from 'react';
import { Show, SimpleShowLayout, TextField, NumberField } from 'react-admin';

export const UsersShow = (props) => (
  React.createElement(Show, props,
    React.createElement(SimpleShowLayout, null,
      React.createElement(TextField, { source: 'username' }),
      React.createElement(NumberField, { source: 'is_active' }),
      React.createElement(NumberField, { source: 'is_superuser' }),
      React.createElement(NumberField, { source: 'is_staff' }),
      React.createElement(TextField, { source: 'list_password' })
    )
  )
);
