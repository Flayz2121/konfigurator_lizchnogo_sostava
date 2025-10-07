import React from 'react';
import { List, Datagrid, TextField, NumberField } from 'react-admin';

export const KursesList = props => (
  <List {...props}  perPage={100}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name_kurs" />
      <NumberField source="number_of_kurs" />
      <NumberField source="p_s" />
      <NumberField source="n_l" />
      <NumberField source="b" />
      <NumberField source="n" />
      <NumberField source="y" />
      <NumberField source="k" />
      <NumberField source="o" />
      <TextField source="user" />
    </Datagrid>
  </List>
);
