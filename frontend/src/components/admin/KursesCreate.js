// src/components/admin/KursesCreate.js
import React from 'react';
import { Create, SimpleForm, TextInput, NumberInput, ReferenceInput, SelectInput, required } from 'react-admin';

export const KursesCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <ReferenceInput source="user_id" reference="users" label="User">
        <SelectInput
          optionText="username"
          optionValue="id"
          validate={required()}
          emptyText="No users available"
        />
      </ReferenceInput>
      <TextInput source="name_kurs" validate={required()} />
      <NumberInput source="number_of_kurs" validate={required()} />
      <NumberInput source="p_s" defaultValue={0} />
      <NumberInput source="n_l" defaultValue={0} />
      <NumberInput source="b" defaultValue={0} />
      <NumberInput source="n" defaultValue={0} />
      <NumberInput source="y" defaultValue={0} />
      <NumberInput source="k" defaultValue={0} />
      <NumberInput source="o" defaultValue={0} />
    </SimpleForm>
  </Create>
);