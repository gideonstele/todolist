import { useState, useRef, type KeyboardEvent } from 'react';
import { Box, Input, HStack, IconButton } from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';
import { useMemoizedFn } from 'ahooks';

import { useAddTodoItem } from '@/query/mutations';
import { Toaster, toaster } from '@/components/ui/toaster';

export const AddTodoItem = () => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: addTodoItem, isPending } = useAddTodoItem();

  const handleAdd = useMemoizedFn(() => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue) {
      toaster.create({
        title: '输入不能为空',
        type: 'warning',
        duration: 2000,
      });
      return;
    }

    addTodoItem(
      { value: trimmedValue },
      {
        onSuccess: () => {
          setInputValue('');
          inputRef.current?.focus();
          toaster.create({
            title: '添加成功',
            type: 'success',
            duration: 2000,
          });
        },
        onError: (error) => {
          toaster.create({
            title: '添加失败',
            description: error.message,
            type: 'error',
            duration: 3000,
          });
        },
      },
    );
  });

  const handleKeyDown = useMemoizedFn((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  });

  return (
    <>
      <Box mb={4}>
        <HStack
          gap={0}
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border"
          borderRadius="lg"
          transition="all 0.2s"
          _hover={{
            borderColor: 'border.emphasized',
            shadow: 'sm',
          }}
          _focusWithin={{
            borderColor: 'border.emphasized',
            shadow: 'sm',
          }}
        >
          <Box
            flex={1}
            px={3}
            py={3}
          >
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="添加新的待办事项..."
              variant="subtle"
              disabled={isPending}
              autoFocus
              fontSize="md"
              fontWeight="medium"
              _placeholder={{
                color: 'fg.muted',
              }}
            />
          </Box>
          <HStack
            gap={1}
            px={2}
            flexShrink={0}
          >
            <IconButton
              aria-label="添加待办事项"
              size="sm"
              colorPalette="blue"
              onClick={handleAdd}
              loading={isPending}
              disabled={!inputValue.trim()}
              variant="ghost"
              _hover={{
                bg: 'blue.subtle',
              }}
            >
              <LuPlus size={16} />
            </IconButton>
          </HStack>
        </HStack>
      </Box>
      <Toaster />
    </>
  );
};
