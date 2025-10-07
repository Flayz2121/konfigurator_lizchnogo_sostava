// src/components/admin/UsersEdit.js
import React from 'react';
import { Edit, SimpleForm, TextInput, BooleanInput } from 'react-admin';

export const UsersEdit = props => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="username" label="Никнейм"  />
      <TextInput source="list_password" label="Просмотр пароля" defaultValue={0} />
      <BooleanInput source="is_active" label="Активен" defaultValue={true} />
      <BooleanInput source="is_superuser" label="Суперпользователь" defaultValue={false} />
      <BooleanInput source="is_staff" label="Персонал" defaultValue={false} />
    </SimpleForm>
  </Edit>
);