import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listMessages, sendMessage } from './api';

export const useMessages = () => useQuery({ queryKey: ['messages'], queryFn: listMessages });

export const useSendMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });
};
