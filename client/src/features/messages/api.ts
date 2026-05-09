import { api } from '@/lib/api';
import type { Message } from '@/types';

export const listMessages = async () => (await api.get<Message[]>('/messages')).data;
export const sendMessage = async (p: Partial<Message>) => (await api.post<Message>('/messages', p)).data;
