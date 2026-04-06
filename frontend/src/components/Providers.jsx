'use client';

import PropTypes from 'prop-types';
import { AuthProvider } from '../context/AuthContext';
import { AuthModalProvider } from '../context/AuthModalContext';
import { LocaleProvider } from '../context/LocaleContext';
import AuthModal from './AuthModal';
import AuthRouteWatcher from './AuthRouteWatcher';
import Navbar from './Navbar';
import ChatLauncher from './ChatLauncher';

export default function Providers({ children }) {
  return (
    <LocaleProvider>
      <AuthProvider>
        <AuthModalProvider>
          <Navbar />
          {children}
          <AuthModal />
          <AuthRouteWatcher />
          <ChatLauncher />
        </AuthModalProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}

Providers.propTypes = {
  children: PropTypes.node.isRequired,
};
