import React, { CSSProperties, VFC, useCallback, useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import Modal from '@components/Modal';
import { Button, Input, Label } from '@pages/SignUp/styles';
import useInput from '@hooks/useInput';
import axios from 'axios';
import useSWR from 'swr';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';

interface TProps {
  show: boolean;
  setShowInviteWorkspaceModal: (flag: boolean) => void;
  onCloseModal: () => void;
}

const InviteWorkspaceModal: VFC<TProps> = ({ show, setShowInviteWorkspaceModal, onCloseModal }) => {
  const [newMember, onChangeNewMember, setNewMember] = useInput('');

  const { workspace } = useParams<{ workspace: string; channel: string }>();
  const { data: userData } = useSWR<IUser | false>(`http://localhost:3095/api/users`, fetcher);
  const { mutate: mutateChannel } = useSWR<IChannel[]>(
    userData ? `http://localhost:3095/api/workspaces/${workspace}/channels` : null,
    fetcher,
  );
  const onInviteMember = useCallback(
    (e) => {
      e.preventDefault();
      if (!newMember || !newMember.trim()) return;

      axios
        .post(
          `http://localhost:3095/api/workspaces/${workspace}/members`,
          { email: newMember },
          { withCredentials: true },
        )
        .then((res) => {
          mutateChannel(res.data, false);
          setShowInviteWorkspaceModal(false);
          setNewMember('');
        })
        .catch((error) => {
          console.dir(error);
          toast.error(error.response?.data, { position: 'bottom-center' });
        });
    },
    [newMember],
  );

  if (!show) return null;
  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <Label id="member-label">
          <span>이메일</span>
          <Input id="member" type="email" value={newMember} onChange={onChangeNewMember} />
        </Label>
        <Button type="submit">초대하기</Button>
      </form>
    </Modal>
  );
};

export default InviteWorkspaceModal;
