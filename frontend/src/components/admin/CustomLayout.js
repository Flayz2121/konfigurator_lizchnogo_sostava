// src/components/admin/CustomLayout.js
import { Layout } from 'react-admin';
import CustomAppBar from './CustomAppBar';

const CustomLayout = (props) => (
  <Layout {...props} appBar={CustomAppBar} />
);

export default CustomLayout;