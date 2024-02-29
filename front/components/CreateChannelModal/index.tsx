import React, { CSSProperties, VFC, useCallback } from 'react';
//import {} from './styles';
import Modal from '@components/Modal';
import { Button, Input, Label } from '@pages/SignUp/styles';
import useInput from '@hooks/useInput';
import { CloseModalButton } from '@components/Menu/styles';

interface TProps {
  show: boolean;
  onCloseModal: () => void;
}

const CreateChannelModal: VFC<TProps> = ({ show, onCloseModal }) => {
  const [newChannel, onChangeNewChannel, setNewChannel] = useInput('');
  const stopPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const onCreateChannel = useCallback(() => {}, []);

  if (!show) return null;
  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>
      <form onSubmit={onCreateChannel}>
        <Label id="workspace-label">
          <span>채널 만들기</span>
          <Input id="workspace" value={newChannel} onChange={onChangeNewChannel} />
        </Label>
        <Button type="submit">생성하기</Button>
      </form>
    </Modal>
  );
};

export default CreateChannelModal;
