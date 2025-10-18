import { useState, useRef, useEffect } from 'react';
import { Box, HStack, IconButton, Group, Button } from '@chakra-ui/react';
import { LuGripVertical, LuTrash2, LuCheck } from 'react-icons/lu';

import { useMemoizedFn } from 'ahooks';

import { useRemoveTodoItem, useUpdateTodoItem } from '@/query/mutations';
import { EditableText } from './components/EditableText';
import { toaster } from '@/components/ui/toaster';

// TodoItem 组件的属性接口
export interface TodoItemProps {
  id: string; // 待办事项的唯一标识
  index: number; // 当前项目在列表中的索引
  value: string; // 待办事项的文本内容
  isCompleted: boolean; // 是否已完成
  onDragStart: (id: string, index: number, startY: number, offsetY: number) => void; // 拖拽开始回调
  onDragMove: (currentY: number) => void; // 拖拽移动回调
  onDragEnd: () => void; // 拖拽结束回调
  registerRef: (id: string, element: HTMLDivElement | null) => void; // 注册DOM引用的回调
  isDragging: boolean; // 当前是否有拖拽操作正在进行
  isBeingDragged: boolean; // 当前项目是否正在被拖拽
  dragOffset: number; // 拖拽时的Y轴偏移量（像素）
}

export const TodoItem = ({
  id,
  index,
  value,
  isCompleted,
  onDragStart,
  onDragMove,
  onDragEnd,
  registerRef,
  isDragging,
  isBeingDragged,
  dragOffset,
}: TodoItemProps) => {
  // 是否处于编辑状态
  const [isEditing, setIsEditing] = useState(false);
  // 鼠标是否悬停在该项目上
  const [isHovered, setIsHovered] = useState(false);

  // 删除待办事项的 mutation
  const { mutate: removeTodoItem, isPending: isRemovingTodoItem } = useRemoveTodoItem();
  // 更新待办事项的 mutation
  const { mutate: updateTodoItem, isPending: isUpdatingTodoItem } = useUpdateTodoItem();

  // 整个列表项的DOM引用
  const itemRef = useRef<HTMLDivElement>(null);
  // 拖拽手柄的DOM引用（左侧的抓取图标区域）
  const dragHandleRef = useRef<HTMLDivElement>(null);

  // 组件挂载/卸载时，向父组件注册/注销DOM引用
  useEffect(() => {
    registerRef(id, itemRef.current);
    return () => registerRef(id, null);
  }, [id, registerRef]);

  const handleValueCommit = useMemoizedFn((value: string) => {
    updateTodoItem(
      { id, value },
      {
        onSuccess: () => {
          toaster.create({
            title: '更新成功',
            type: 'success',
            duration: 2000,
          });
        },
      },
    );
  });

  const handleDelete = useMemoizedFn(() => {
    removeTodoItem(id, {
      onSuccess: () => {
        toaster.create({
          title: '删除成功',
          type: 'success',
          duration: 2000,
        });
      },
    });
  });

  const handleMarkAsComplete = useMemoizedFn(() => {
    updateTodoItem(
      { id, isCompleted: true },
      {
        onSuccess: () => {
          toaster.create({
            title: '已标记为完成',
            type: 'success',
            duration: 2000,
          });
        },
      },
    );
  });

  // 处理鼠标按下事件（开始拖拽）
  const handleMouseDown = useMemoizedFn((e: React.MouseEvent) => {
    e.preventDefault(); // 阻止默认行为，避免文本选择

    if (!itemRef.current) return;

    // 计算鼠标相对于元素顶部的偏移量
    const rect = itemRef.current.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;

    // 通知父组件开始拖拽
    onDragStart(id, index, e.clientY, offsetY);

    // 定义鼠标移动处理函数
    const handleMouseMove = (e: MouseEvent) => {
      // 将当前鼠标Y坐标传递给父组件
      onDragMove(e.clientY);
    };

    // 定义鼠标释放处理函数
    const handleMouseUp = () => {
      // 通知父组件拖拽结束
      onDragEnd();
      // 移除全局事件监听器
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    // 在 document 上添加全局事件监听器
    // 这样即使鼠标移出元素，也能继续追踪拖拽操作
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  });

  // 动态计算列表项的样式
  const style: React.CSSProperties = {
    // 如果正在被拖拽，应用Y轴平移
    transform: isBeingDragged && isDragging ? `translateY(${dragOffset}px)` : undefined,
    // 正在被拖拽时降低透明度，提供视觉反馈
    opacity: isBeingDragged && isDragging ? 0.8 : 1,
    // 正在被拖拽时提升层级，确保在其他元素上方
    zIndex: isBeingDragged && isDragging ? 1000 : 1,
    // 拖拽时禁用过渡动画，使移动更跟手；其他情况启用平滑过渡
    transition: isBeingDragged && isDragging ? 'none' : 'all 0.2s ease',
    // 拖拽过程中禁用指针事件，避免干扰
    pointerEvents: isDragging ? 'none' : 'auto',
    // 拖拽时显示抓取光标
    cursor: isBeingDragged && isDragging ? 'grabbing' : undefined,
  };

  return (
    <Group
      ref={itemRef}
      style={style}
      attached
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      _hover={{
        borderColor: 'border.emphasized',
        shadow: 'sm',
      }}
    >
      <HStack
        width="full"
        gap={0}
        position="relative"
      >
        {/* 拖拽手柄区域 */}
        <Box
          ref={dragHandleRef}
          cursor="grab" // 默认显示抓手光标
          _active={{ cursor: 'grabbing' }} // 按下时显示抓取中光标
          px={3}
          py={3}
          color={'fg.muted'}
          transition="color 0.2s"
          flexShrink={0}
          borderRightWidth="1px"
          borderColor={isHovered ? 'border' : 'transparent'} // 悬停时显示边框
          onMouseDown={handleMouseDown} // 监听鼠标按下事件，开始拖拽
          userSelect="none" // 禁止文本选择
        >
          <LuGripVertical size={20} />
        </Box>

        <EditableText
          isPending={isUpdatingTodoItem}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          value={value}
          onChange={handleValueCommit}
          disabled={isCompleted}
          isCompleted={isCompleted}
        />

        {!isEditing && (
          <HStack
            gap={1}
            px={2}
            flexShrink={0}
            transition="opacity 0.2s"
          >
            {!isCompleted && (
              <Button
                size="sm"
                variant="ghost"
                colorPalette="green"
                onClick={handleMarkAsComplete}
                _hover={{
                  bg: 'green.subtle',
                }}
              >
                <LuCheck size={16} />
                标记为完成
              </Button>
            )}
            <IconButton
              aria-label="删除"
              size="sm"
              variant="ghost"
              colorPalette="red"
              onClick={handleDelete}
              loading={isRemovingTodoItem}
              _hover={{
                bg: 'red.subtle',
              }}
            >
              <LuTrash2 size={16} />
            </IconButton>
          </HStack>
        )}
      </HStack>
    </Group>
  );
};
