import React, { CSSProperties, FC, useCallback } from 'react';
import { CloseModalButton, CreateModal } from './styles';

interface TProps {
  show: boolean;
  onCloseModal: () => void;
}
const Modal: FC<TProps> = ({ children, show, onCloseModal }) => {
  const stopPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  if (!show) return null;

  return (
    <CreateModal onClick={onCloseModal}>
      <div onClick={stopPropagation}>
        <CloseModalButton onClick={onCloseModal}></CloseModalButton>
        {children}
      </div>
    </CreateModal>
  );
};

export default Modal;
