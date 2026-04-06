'use client';

import PropTypes from 'prop-types';
import { AuthProvider } from '../context/AuthContext';
import { LocaleProvider } from '../context/LocaleContext';
import Navbar from './Navbar';
import ChatLauncher from './ChatLauncher';

export default function Providers({ children }) {
  return (
    <LocaleProvider>
      <AuthProvider>
        <Navbar />
        {children}
        <ChatLauncher />
      </AuthProvider>
    </LocaleProvider>
  );
}

Providers.propTypes = {
  children: PropTypes.node.isRequired,
};
