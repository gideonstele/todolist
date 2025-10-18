import { Box, HStack, IconButton, Input, Spinner } from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { LuCheck, LuX } from 'react-icons/lu';
import { useMemoizedFn } from 'ahooks';

export interface EditableTextProps {
  isPending?: boolean;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  isCompleted?: boolean;
}

export const EditableText = ({
  isPending,
  isEditing,
  setIsEditing,
  value,
  onChange,
  disabled,
  isCompleted,
}: EditableTextProps) => {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local value with prop value when not editing
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value);
    }
  }, [value, isEditing]);

  // Focus and select input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleValueCommit = useMemoizedFn(() => {
    if (value === localValue) {
      setIsEditing(false);
      return;
    }
    onChange?.(localValue);
    setIsEditing(false);
  });

  const handleCancel = useMemoizedFn(() => {
    setLocalValue(value);
    setIsEditing(false);
  });

  const handleKeyDown = useMemoizedFn((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleValueCommit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  });

  const handlePreviewClick = useMemoizedFn(() => {
    if (!disabled) {
      setIsEditing(true);
    }
  });

  if (isPending) {
    return (
      <Box
        flex={1}
        px={3}
        py={2}
      >
        <Spinner />
      </Box>
    );
  }

  return (
    <>
      <Box
        flex={1}
        mx={3}
        py={2}
        maxW="calc(100% - 120px)"
        overflow="hidden"
      >
        {isEditing ? (
          <Input
            ref={inputRef}
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleValueCommit}
            placeholder="输入待办事项..."
            disabled={disabled}
            py={1}
            px={2}
            borderRadius="md"
            fontSize="md"
            fontWeight="medium"
            width="100%"
            border="none"
            bg="transparent"
            _focus={{
              outline: '2px solid',
              outlineColor: 'colorPalette.500',
              outlineOffset: '-2px',
            }}
          />
        ) : (
          <Box
            py={1}
            px={2}
            borderRadius="md"
            cursor={disabled ? 'not-allowed' : 'text'}
            minH="32px"
            display="flex"
            alignItems="center"
            fontSize="md"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            color={isCompleted ? 'fg.muted' : 'fg'}
            fontWeight="medium"
            textDecoration={isCompleted ? 'line-through' : 'none'}
            opacity={isCompleted ? 0.6 : 1}
            onClick={handlePreviewClick}
          >
            {localValue}
          </Box>
        )}
      </Box>
      {isEditing && (
        <HStack
          gap={1}
          px={2}
          flexShrink={0}
          opacity={1}
          transition="opacity 0.2s"
        >
          <IconButton
            aria-label="取消"
            size="sm"
            variant="ghost"
            colorPalette="gray"
            onClick={handleCancel}
            onMouseDown={(e) => e.preventDefault()}
          >
            <LuX size={16} />
          </IconButton>
          <IconButton
            aria-label="确认"
            size="sm"
            variant="ghost"
            colorPalette="green"
            onClick={handleValueCommit}
            onMouseDown={(e) => e.preventDefault()}
          >
            <LuCheck size={16} />
          </IconButton>
        </HStack>
      )}
    </>
  );
};
