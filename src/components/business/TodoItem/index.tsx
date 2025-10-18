import { useState, useRef, useEffect } from 'react';
import { Box, HStack, IconButton, Group, Button } from '@chakra-ui/react';
import { LuGripVertical, LuTrash2, LuCheck } from 'react-icons/lu';

import { useMemoizedFn } from 'ahooks';

import { useRemoveTodoItem, useUpdateTodoItem } from '@/query/mutations';
import { EditableText } from './components/EditableText';
import { toaster } from '@/components/ui/toaster';

export interface TodoItemProps {
  id: string;
  index: number;
  value: string;
  isCompleted: boolean;
  onDragStart: (id: string, index: number, startY: number, offsetY: number) => void;
  onDragMove: (currentY: number) => void;
  onDragEnd: () => void;
  registerRef: (id: string, element: HTMLDivElement | null) => void;
  isDragging: boolean;
  isBeingDragged: boolean;
  dragOffset: number;
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
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { mutate: removeTodoItem, isPending: isRemovingTodoItem } = useRemoveTodoItem();
  const { mutate: updateTodoItem, isPending: isUpdatingTodoItem } = useUpdateTodoItem();

  const itemRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

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

  const handleMouseDown = useMemoizedFn((e: React.MouseEvent) => {
    e.preventDefault();

    if (!itemRef.current) return;

    const rect = itemRef.current.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;

    onDragStart(id, index, e.clientY, offsetY);

    const handleMouseMove = (e: MouseEvent) => {
      onDragMove(e.clientY);
    };

    const handleMouseUp = () => {
      onDragEnd();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  });

  const style: React.CSSProperties = {
    transform: isBeingDragged && isDragging ? `translateY(${dragOffset}px)` : undefined,
    opacity: isBeingDragged && isDragging ? 0.8 : 1,
    zIndex: isBeingDragged && isDragging ? 1000 : 1,
    transition: isBeingDragged && isDragging ? 'none' : 'all 0.2s ease',
    pointerEvents: isDragging ? 'none' : 'auto',
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
        <Box
          ref={dragHandleRef}
          cursor="grab"
          _active={{ cursor: 'grabbing' }}
          px={3}
          py={3}
          color={'fg.muted'}
          transition="color 0.2s"
          flexShrink={0}
          borderRightWidth="1px"
          borderColor={isHovered ? 'border' : 'transparent'}
          onMouseDown={handleMouseDown}
          userSelect="none"
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
