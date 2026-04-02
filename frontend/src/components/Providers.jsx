'use client';

import PropTypes from 'prop-types';
import { AuthProvider } from '../context/AuthContext';
import Navbar from './Navbar';
import ChatLauncher from './ChatLauncher';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <Navbar />
      {children}
      <ChatLauncher />
    </AuthProvider>
  );
}

Providers.propTypes = {
  children: PropTypes.node.isRequired,
};
