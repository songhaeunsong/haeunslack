import React, { useState, useCallback } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Header, Form, Label, Input, Error, Button, LinkContainer } from '@pages/SignUp/styles';
import useInput from '@hooks/useInput';
import axios from 'axios';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';

const LogIn = () => {
  const { data, error, mutate } = useSWR('http://localhost:3095/api/users', fetcher);
  const [email, onChangeEmail] = useInput('');
  const [password, , setPassword] = useInput('');
  const [logInError, setLogInError] = useState(false);

  const onChangePassword = useCallback((e) => {
    setPassword(e.target.value);
  }, []);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setLogInError(false);
      axios
        .post(
          'http://localhost:3095/api/users/login',
          {
            email,
            password,
          },
          { withCredentials: true },
        )
        .then(() => {
          mutate();
        })
        .catch((error) => {
          console.dir(error);
          setLogInError(error.response?.data?.statusCode === 401);
        });
    },
    [email, password, mutate],
  );
  if (data === undefined) return <div>로딩 중...</div>;

  if (!error && data) {
    return <Redirect to="/workspace/channel" />;
  }

  return (
    <div>
      <Header>Slack</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input type="email" id="email" name="email" value={email} onChange={onChangeEmail} />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
          </div>
        </Label>
        {logInError && <Error>정확한 정보를 입력해주세요.</Error>}
        <Button type="submit">로그인</Button>
      </Form>
      <LinkContainer>
        아직 회원이 아니신가요?&nbsp;
        <Link to="/signup">회원가입 하러가기</Link>
      </LinkContainer>
    </div>
  );
};

export default LogIn;
