// src/AdminPanel.js
import { Admin, Resource } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';
import { KursesList } from '../components/admin/KursesList';
import { KursesCreate } from '../components/admin/KursesCreate';
import { KursesEdit } from '../components/admin/KursesEdit';
import { KursesShow } from '../components/admin/KursesShow';
import { UsersList } from '../components/admin/UsersList';
import { UsersCreate } from '../components/admin/UsersCreate';
import { UsersEdit } from '../components/admin/UsersEdit';
import { UsersShow } from '../components/admin/UsersShow';
import CustomLayout from '../components/admin/CustomLayout';
import { fetchUtils } from 'react-admin';

const apiUrl = 'http://localhost:8000/api';

const httpClient = (url, options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }

  const token = localStorage.getItem('access_token');
  if (token) {
    options.headers.set('Authorization', `Bearer ${token}`);
  }

  // Принудительно добавляем слэш
  if (!url.endsWith('/')) {
    url += '/';
  }

  console.log('FINAL URL:', url);
  console.log('METHOD:', options.method);

  return fetchUtils.fetchJson(url, options)
    .then(response => {
      return response;
    })
    .catch(error => {
      console.error('API Error:', error.body);
      throw new Error(error.body?.detail || 'Ошибка запроса');
    });
};

/*const withTrailingSlash = url => {
  return url.endsWith('/') ? url : url + '/';
};   может быть понадобится, но это врядли) */

const rawProvider = simpleRestProvider(apiUrl, httpClient);

const dataProvider = {
  ...rawProvider,
  update: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}/`, {
      method: 'PATCH',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json })),
  create: (resource, params) => {
    console.log(`Creating ${resource} with data:`, params.data);
    return httpClient(`${apiUrl}/${resource}/`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: { ...params.data, id: json.id },
    }));
  },
  delete: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}/`, {
      method: 'DELETE',
    }).then(({ json }) => ({ data: json || { id: params.id } })),
  getList: async (...args) => {
    try {
      const res = await rawProvider.getList(...args);
      console.log('[getList]', res);
      return res;
    } catch (err) {
      console.error('[getList error]', err);
      throw err;
    }
  },
  getOne: async (...args) => {
    try {
      const res = await rawProvider.getOne(...args);
      console.log('[getOne]', res);
      return res;
    } catch (err) {
      console.error('[getOne error]', err);
      throw err;
    }
  },
};

const AdminPanel = () => (
  <Admin
    dataProvider={dataProvider}
    layout={CustomLayout}
    disableTelemetry
    basename="/admin"
  >
    <Resource
      name="kurses"
      list={KursesList}
      create={KursesCreate}
      edit={KursesEdit}
      show={KursesShow}
    />
    <Resource
      name="full_users"
      list={UsersList}
      create={UsersCreate}
      edit={UsersEdit}
      show={UsersShow}
    />
    <Resource name="users" />
  </Admin>
);

export default AdminPanel;