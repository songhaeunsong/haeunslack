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
  setShowInviteChannelModal: (flag: boolean) => void;
  onCloseModal: () => void;
}

const InviteChannelModal: VFC<TProps> = ({ show, setShowInviteChannelModal, onCloseModal }) => {
  const [newMember, onChangeNewMember, setNewMember] = useInput('');

  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const { data: userData } = useSWR<IUser | false>(`http://localhost:3095/api/users`, fetcher);
  const { mutate: mutateMember } = useSWR<IChannel[]>(
    userData ? `http://localhost:3095/api/workspaces/${workspace}/channels/${channel}/members` : null,
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
          mutateMember(res.data, false);
          setShowInviteChannelModal(false);
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
          <span>채널 멤버 초대</span>
          <Input id="member" type="email" value={newMember} onChange={onChangeNewMember} />
        </Label>
        <Button type="submit">초대하기</Button>
      </form>
    </Modal>
  );
};

export default InviteChannelModal;
