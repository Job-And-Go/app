import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Messages: undefined;
  Chat: { otherUserId: string };
  Login: undefined;
  Register: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

export interface RouteParams {
  applicationId?: string;
  userId?: string;
} 