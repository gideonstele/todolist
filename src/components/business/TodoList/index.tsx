import { Button, Spinner, VStack } from '@chakra-ui/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type { TodoRecordItem } from '@/db/schema';
import { TodoItem } from '../TodoItem';
import { isEmpty } from 'lodash-es';
import { useAddDefaultData } from '@/query/addDefaultData';
import { useReorderTodoItems } from '@/query/mutations';
import { useState, useEffect } from 'react';

export interface TodoListProps {
  dataSource?: TodoRecordItem[];
  isLoading?: boolean;
}

export const TodoList = ({ dataSource, isLoading }: TodoListProps) => {
  const { mutate: addDefaultData, isPending: isAddingDefaultData } = useAddDefaultData();
  const { mutate: reorderItems } = useReorderTodoItems();
  const [items, setItems] = useState<TodoRecordItem[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (dataSource) {
      setItems(dataSource);
    }
  }, [dataSource]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Update the order in the database
      const reorderPayload = newItems.map((item, index) => ({
        id: item.id,
        order: index,
      }));
      reorderItems(reorderPayload);
    }
  };

  if (isEmpty(dataSource) && !isLoading) {
    return (
      <VStack
        gap={3}
        align="center"
      >
        <Button
          loading={isAddingDefaultData}
          onClick={() => addDefaultData()}
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <VStack
          gap={3}
          align="stretch"
        >
          {items.map((todo) => (
            <TodoItem
              key={todo.id}
              id={todo.id}
              value={todo.value}
              isCompleted={todo.isCompleted}
            />
          ))}
        </VStack>
      </SortableContext>
    </DndContext>
  );
};
