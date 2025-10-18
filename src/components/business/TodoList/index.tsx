import { Button, Spinner, VStack } from '@chakra-ui/react';

import type { TodoRecordItem } from '@/db/schema';
import { TodoItem } from '../TodoItem';
import { isEmpty } from 'lodash-es';
import { useAddDefaultData } from '@/query/addDefaultData';
import { useReorderTodoItems } from '@/query/mutations';
import { useState, useEffect, useRef, useCallback } from 'react';

export interface TodoListProps {
  dataSource?: TodoRecordItem[];
  isLoading?: boolean;
}

interface DragState {
  isDragging: boolean;
  draggedIndex: number | null;
  draggedId: string | null;
  currentY: number;
  startY: number;
  offsetY: number;
  hoveredIndex: number | null;
}

export const TodoList = ({ dataSource, isLoading }: TodoListProps) => {
  const { mutate: addDefaultData, isPending: isAddingDefaultData } = useAddDefaultData();
  const { mutate: reorderItems } = useReorderTodoItems();
  const [items, setItems] = useState<TodoRecordItem[]>([]);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedIndex: null,
    draggedId: null,
    currentY: 0,
    startY: 0,
    offsetY: 0,
    hoveredIndex: null,
  });

  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dataSource) {
      setItems(dataSource);
    }
  }, [dataSource]);

  const handleDragStart = useCallback((id: string, index: number, startY: number, offsetY: number) => {
    setDragState({
      isDragging: true,
      draggedIndex: index,
      draggedId: id,
      currentY: startY,
      startY,
      offsetY,
      hoveredIndex: null,
    });
  }, []);

  const handleDragMove = useCallback(
    (currentY: number) => {
      setDragState((prev) => {
        if (!prev.isDragging || prev.draggedIndex === null || prev.draggedId === null) return prev;

        // 找到鼠标当前位置应该对应的索引
        let newHoveredIndex = prev.draggedIndex;
        let closestDistance = Infinity;

        items.forEach((item, idx) => {
          if (item.id === prev.draggedId) return;

          const element = itemRefs.current.get(item.id);
          if (!element) return;

          const rect = element.getBoundingClientRect();
          const elementCenterY = rect.top + rect.height / 2;
          const distance = Math.abs(currentY - elementCenterY);

          // 如果鼠标位置接近某个元素的中心，则考虑交换
          if (distance < closestDistance && distance < rect.height / 2) {
            closestDistance = distance;
            // 根据鼠标相对于元素中心的位置决定插入位置
            if (currentY > elementCenterY) {
              newHoveredIndex = idx;
            } else {
              newHoveredIndex = idx;
            }
          }
        });

        // 实时更新排序
        if (newHoveredIndex !== prev.draggedIndex && prev.draggedIndex !== null) {
          const newItems = [...items];
          const [removed] = newItems.splice(prev.draggedIndex, 1);
          newItems.splice(newHoveredIndex, 0, removed);
          setItems(newItems);

          return {
            ...prev,
            currentY,
            draggedIndex: newHoveredIndex,
            hoveredIndex: newHoveredIndex,
          };
        }

        return {
          ...prev,
          currentY,
        };
      });
    },
    [items],
  );

  const handleDragEnd = useCallback(() => {
    setDragState((prev) => {
      if (!prev.isDragging) {
        return {
          isDragging: false,
          draggedIndex: null,
          draggedId: null,
          currentY: 0,
          startY: 0,
          offsetY: 0,
          hoveredIndex: null,
        };
      }

      // 更新数据库（items 已经在 handleDragMove 中更新了）
      const reorderPayload = items.map((item, index) => ({
        id: item.id,
        order: index,
      }));
      reorderItems(reorderPayload);

      return {
        isDragging: false,
        draggedIndex: null,
        draggedId: null,
        currentY: 0,
        startY: 0,
        offsetY: 0,
        hoveredIndex: null,
      };
    });
  }, [items, reorderItems]);

  const registerItemRef = useCallback((id: string, element: HTMLDivElement | null) => {
    if (element) {
      itemRefs.current.set(id, element);
    } else {
      itemRefs.current.delete(id);
    }
  }, []);

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
    <VStack
      ref={listRef}
      gap={3}
      align="stretch"
    >
      {items.map((todo, index) => (
        <TodoItem
          key={todo.id}
          id={todo.id}
          index={index}
          value={todo.value}
          isCompleted={todo.isCompleted}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          registerRef={registerItemRef}
          isDragging={dragState.isDragging && dragState.draggedId === todo.id}
          isBeingDragged={dragState.draggedId === todo.id}
          dragOffset={
            dragState.isDragging && dragState.draggedId === todo.id ? dragState.currentY - dragState.startY : 0
          }
        />
      ))}
    </VStack>
  );
};
