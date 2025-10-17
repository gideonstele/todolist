import { useState } from 'react';
import { Box, HStack, IconButton, Group, Button } from '@chakra-ui/react';
import { LuGripVertical, LuTrash2, LuCheck } from 'react-icons/lu';

import { useMemoizedFn } from 'ahooks';

import { useRemoveTodoItem, useUpdateTodoItem } from '@/query/mutations';
import { EditableText } from './components/EditableText';
import { toaster } from '@/components/ui/toaster';

export interface TodoItemProps {
  id: string;
  value: string;
  isCompleted: boolean;
}

export const TodoItem = ({ id, value, isCompleted }: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { mutate: removeTodoItem, isPending: isRemovingTodoItem } = useRemoveTodoItem();
  const { mutate: updateTodoItem, isPending: isUpdatingTodoItem } = useUpdateTodoItem();

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

  return (
    <Group
      attached
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      transition="all 0.2s"
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
        {/* Drag Handle */}
        <Box
          cursor="grab"
          _active={{ cursor: 'grabbing' }}
          px={3}
          py={3}
          color={isHovered ? 'fg.muted' : 'transparent'}
          transition="color 0.2s"
          flexShrink={0}
          borderRightWidth="1px"
          borderColor={isHovered ? 'border' : 'transparent'}
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
            opacity={isEditing || isHovered ? 1 : 0}
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
