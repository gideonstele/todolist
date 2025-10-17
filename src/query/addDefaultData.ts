import { todoListService } from '@/db';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const defaultData = [{ value: '完成项目设计文档' }, { value: '实现TodoList功能' }, { value: '代码审查和测试' }];

export const useAddDefaultData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => todoListService.addBulkItems(defaultData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db/todolist/all'] });
    },
  });
};
