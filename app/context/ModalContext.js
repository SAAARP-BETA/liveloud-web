'use client';

import React, { createContext, useState, useContext } from 'react';

const ModalContext = createContext({
  modals: {},
  showModal: () => {},
  hideModal: () => {},
  isAnyModalVisible: false
});

export const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState({
    reportModal: false,
    // Add other modals here as needed
    amplifyModal: false,
    commentModal: false,
    optionsModal: false,
  });

  const showModal = (modalName) => {
    setModals(prev => ({
      ...prev,
      [modalName]: true
    }));
  };

  const hideModal = (modalName) => {
    setModals(prev => ({
      ...prev,
      [modalName]: false
    }));
  };

  // Check if any modal is currently visible
  const isAnyModalVisible = Object.values(modals).some(visible => visible);

  return (
    <ModalContext.Provider value={{ 
      modals, 
      showModal, 
      hideModal,
      isAnyModalVisible
    }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);