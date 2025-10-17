import { Button, Spinner, VStack } from '@chakra-ui/react';

import type { TodoRecordItem } from '@/db/schema';
import { TodoItem } from '../TodoItem';
import { isEmpty } from 'lodash-es';
import { useAddDefaultData } from '@/query/addDefaultData';

export interface TodoListProps {
  dataSource?: TodoRecordItem[];
  isLoading?: boolean;
}

export const TodoList = ({ dataSource, isLoading }: TodoListProps) => {
  const { mutate: addDefaultData, isPending: isAddingDefaultData } = useAddDefaultData();

  if (isEmpty(dataSource) && !isLoading) {
    return (
      <VStack
        gap={3}
        align="center"
      >
        <Button
          onClick={() => addDefaultData()}
          loading={isAddingDefaultData}
        >
          添加若干个默认数据
        </Button>
      </VStack>
    );
  }

  if (isLoading) {
    return (
      <VStack
        gap={3}
        align="center"
      >
        <Spinner />
      </VStack>
    );
  }

  return (
    <VStack
      gap={3}
      align="stretch"
    >
      {dataSource?.map((todo) => (
        <TodoItem
          key={todo.id}
          id={todo.id}
          value={todo.value}
          isCompleted={todo.isCompleted}
        />
      ))}
    </VStack>
  );
};
