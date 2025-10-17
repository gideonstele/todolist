import { useQuery } from '@tanstack/react-query';
import { todoListService } from '@/db';

export const useAllTodoItems = () => {
  return useQuery({
    queryKey: ['db/todolist/all'],
    queryFn: () => todoListService.all(),
  });
};
