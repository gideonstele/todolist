import { Button, Spinner, VStack } from '@chakra-ui/react';

import type { TodoRecordItem } from '@/db/schema';
import { TodoItem } from '../TodoItem';
import { isEmpty } from 'lodash-es';
import { useAddDefaultData } from '@/query/addDefaultData';
import { useReorderTodoItems } from '@/query/mutations';
import { useState, useEffect, useRef } from 'react';
import { useMemoizedFn } from 'ahooks';

export interface TodoListProps {
  dataSource?: TodoRecordItem[];
  isLoading?: boolean;
}

// 拖拽状态接口定义
interface DragState {
  isDragging: boolean; // 是否正在拖拽
  draggedIndex: number | null; // 被拖拽项目的索引
  draggedId: string | null; // 被拖拽项目的ID
  currentY: number; // 当前鼠标的Y坐标
  startY: number; // 开始拖拽时鼠标的Y坐标
  offsetY: number; // 鼠标相对于被拖拽元素顶部的偏移量
  hoveredIndex: number | null; // 当前悬停位置的索引
}

export const TodoList = ({ dataSource, isLoading }: TodoListProps) => {
  const { mutate: addDefaultData, isPending: isAddingDefaultData } = useAddDefaultData();
  const { mutate: reorderItems } = useReorderTodoItems();
  // 本地维护的待办事项列表，用于拖拽时的实时排序
  const [items, setItems] = useState<TodoRecordItem[]>([]);
  // 拖拽状态
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedIndex: null,
    draggedId: null,
    currentY: 0,
    startY: 0,
    offsetY: 0,
    hoveredIndex: null,
  });

  // 存储每个列表项的DOM引用，用于计算位置
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  // 列表容器的引用
  const listRef = useRef<HTMLDivElement>(null);

  // 当数据源变化时，更新本地列表
  useEffect(() => {
    if (dataSource) {
      setItems(dataSource);
    }
  }, [dataSource]);

  // 处理拖拽开始事件
  // @param id - 被拖拽项目的ID
  // @param index - 被拖拽项目在列表中的索引
  // @param startY - 鼠标起始Y坐标
  // @param offsetY - 鼠标相对于元素顶部的偏移量
  const handleDragStart = useMemoizedFn((id: string, index: number, startY: number, offsetY: number) => {
    setDragState({
      isDragging: true,
      draggedIndex: index,
      draggedId: id,
      currentY: startY,
      startY,
      offsetY,
      hoveredIndex: null,
    });
  });

  // 处理拖拽移动事件
  // @param currentY - 当前鼠标的Y坐标
  const handleDragMove = useMemoizedFn((currentY: number) => {
    if (!dragState.isDragging || dragState.draggedIndex === null || dragState.draggedId === null) {
      return;
    }

    // 找到鼠标当前位置应该对应的索引
    let newHoveredIndex = dragState.draggedIndex;
    let closestDistance = Infinity;

    // 遍历DOM元素，找到距离鼠标最近的项目
    itemRefs.current.forEach((element, id) => {
      // 跳过被拖拽的项目本身
      if (id === dragState.draggedId) return;

      // 获取元素的位置信息
      const rect = element.getBoundingClientRect();
      const elementCenterY = rect.top + rect.height / 2;
      const distance = Math.abs(currentY - elementCenterY);

      // 如果鼠标位置接近某个元素的中心（在元素高度的一半范围内），则考虑交换
      if (distance < closestDistance && distance < rect.height / 2) {
        closestDistance = distance;
        // 需要找到这个 DOM 元素对应的索引
        newHoveredIndex = items.findIndex((item) => item.id === id);
      }
    });

    // 如果目标位置发生变化，实时更新排序
    if (newHoveredIndex !== -1 && newHoveredIndex !== dragState.draggedIndex) {
      // 更新 items 数组
      const newItems = [...items];
      // 从原位置移除被拖拽的项目
      const [removed] = newItems.splice(dragState.draggedIndex, 1);
      // 插入到新位置
      newItems.splice(newHoveredIndex, 0, removed);
      setItems(newItems);

      // 更新拖拽状态，记录新的索引位置
      setDragState({
        ...dragState,
        currentY,
        draggedIndex: newHoveredIndex, // 更新被拖拽项目的当前索引
        hoveredIndex: newHoveredIndex,
      });
    } else {
      // 如果位置没有变化，只更新鼠标坐标
      setDragState({
        ...dragState,
        currentY,
      });
    }
  });

  // 处理拖拽结束事件
  const handleDragEnd = useMemoizedFn(() => {
    setDragState((prev) => {
      if (!prev.isDragging) {
        // 如果当前没有在拖拽，直接重置状态
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

      // 拖拽结束，将最终的排序结果保存到数据库
      // 注意：items 已经在 handleDragMove 中实时更新了
      const reorderPayload = items.map((item, index) => ({
        id: item.id,
        order: index, // 新的排序位置
      }));
      reorderItems(reorderPayload);

      // 重置所有拖拽状态
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
  });

  // 注册/注销列表项的DOM引用
  // 这个函数会传递给每个 TodoItem，用于收集所有列表项的DOM引用
  const registerItemRef = useMemoizedFn((id: string, element: HTMLDivElement | null) => {
    if (element) {
      // 元素挂载时，保存引用
      itemRefs.current.set(id, element);
    } else {
      // 元素卸载时，删除引用
      itemRefs.current.delete(id);
    }
  });

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
          // 拖拽相关的回调函数
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          // 注册DOM引用
          registerRef={registerItemRef}
          // 全局是否有拖拽操作正在进行
          isDragging={dragState.isDragging && dragState.draggedId === todo.id}
          // 当前项目是否正在被拖拽
          isBeingDragged={dragState.draggedId === todo.id}
          // 计算拖拽偏移量：当前鼠标位置 - 开始拖拽时的鼠标位置
          dragOffset={
            dragState.isDragging && dragState.draggedId === todo.id ? dragState.currentY - dragState.startY : 0
          }
        />
      ))}
    </VStack>
  );
};
