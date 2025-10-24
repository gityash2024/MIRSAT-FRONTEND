import React from 'react';
import { useTranslation } from 'react-i18next';
import UserList from './UserList';

const Users = () => {
  const { t } = useTranslation();
  return <UserList />;
};

export default Users;