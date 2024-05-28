import {Pressable, View} from 'react-native';
import styled from 'styled-components';

export const ViewSendComment = styled(View)`
  flex-direction: row;
  dispay:flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  padding: 8px 24px;
  border-color: black;
  color: white;
`;


export const SendComment = styled(Pressable)`
  border-radius: 8px;
  padding: 8px 24px;
  border-color: black;
  color: white;
`;

