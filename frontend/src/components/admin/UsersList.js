// src/components/admin/UsersList.js
import React from 'react';
import { List, Datagrid, TextField, BooleanField } from 'react-admin';

export const UsersList = props => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="username" label="Никнейм" />
      <TextField source="list_password" label="Список паролей" />
      <BooleanField source="is_active" label="Активен" />
      <BooleanField source="is_superuser" label="Суперпользователь" />
      <BooleanField source="is_staff" label="Персонал" />
    </Datagrid>
  </List>
);

