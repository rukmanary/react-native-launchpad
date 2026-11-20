import { GiftedChat, type IMessage } from 'react-native-gifted-chat';

export function Chat({
  messages,
  onSend,
  userId,
}: {
  messages: IMessage[];
  onSend: (messages: IMessage[]) => void;
  userId: string;
}) {
  return <GiftedChat messages={messages} onSend={onSend} user={{ _id: userId }} />;
}
