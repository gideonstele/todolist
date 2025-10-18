import { todoListService } from '@/db';
import type { AddTodoItemPayload, UpdateTodoItemPayload } from '@/db/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useRemoveTodoItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => todoListService.deleteItem({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db/todolist/all'] });
    },
  });
};

export const useUpdateTodoItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTodoItemPayload) => todoListService.updateItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db/todolist/all'] });
    },
  });
};

export const useAddTodoItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddTodoItemPayload) => todoListService.addItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db/todolist/all'] });
    },
  });
};

export const useReorderTodoItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: { id: string; order: number }[]) => todoListService.reorderItems(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db/todolist/all'] });
    },
  });
};
