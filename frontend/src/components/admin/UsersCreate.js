// src/components/admin/UsersCreate.js
import React from 'react';
import { Create, SimpleForm, TextInput, BooleanInput, required } from 'react-admin';


export const UsersCreate = props => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="username" label="Никнейм"  />
      <TextInput source="password" type="password" label="Пароль"  validate={required()} />
      <TextInput source="list_password" label="Просмотр пароля" defaultValue={0} />
      <BooleanInput source="is_active" label="Активен" defaultValue={true} />
      <BooleanInput source="is_superuser" label="Суперпользователь" defaultValue={false} />
      <BooleanInput source="is_staff" label="Персонал" defaultValue={false} />
    </SimpleForm>
  </Create>
);

