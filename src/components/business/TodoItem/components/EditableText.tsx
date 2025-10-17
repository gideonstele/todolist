import { Box, Editable, HStack, IconButton, Spinner } from '@chakra-ui/react';
import { useState } from 'react';
import { LuCheck, LuX } from 'react-icons/lu';
import { useMemoizedFn } from 'ahooks';

export interface EditableTextProps {
  isPending?: boolean;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  value: string;
  onChange?: (value: string) => void;
}

export const EditableText = ({ isPending, isEditing, setIsEditing, value, onChange }: EditableTextProps) => {
  const [localValue, setLocalValue] = useState(value);

  const handleValueCommit = useMemoizedFn((details: { value: string }) => {
    if (value === localValue) {
      return;
    }
    onChange?.(details.value);
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
    <Editable.Root
      value={localValue}
      onValueChange={(details) => setLocalValue(details.value)}
      onValueCommit={() => handleValueCommit({ value: localValue })}
      onEditChange={(details) => setIsEditing(details.edit)}
      placeholder="输入待办事项..."
      selectOnFocus
    >
      <Box
        flex={1}
        px={3}
        py={2}
      >
        <Editable.Preview
          py={1}
          px={2}
          borderRadius="md"
          cursor="text"
          minH="32px"
          display="flex"
          alignItems="center"
          _hover={{
            bg: 'bg.subtle',
          }}
          fontSize="md"
          color="fg"
          fontWeight="medium"
        />
        <Editable.Input
          py={1}
          px={2}
          borderRadius="md"
          fontSize="md"
          fontWeight="medium"
          _focus={{
            outline: '2px solid',
            outlineColor: 'colorPalette.500',
            outlineOffset: '-2px',
          }}
        />
      </Box>
      {isEditing && (
        <HStack
          gap={1}
          px={2}
          flexShrink={0}
          opacity={1}
          transition="opacity 0.2s"
        >
          <Editable.CancelTrigger asChild>
            <IconButton
              aria-label="取消"
              size="sm"
              variant="ghost"
              colorPalette="gray"
            >
              <LuX size={16} />
            </IconButton>
          </Editable.CancelTrigger>
          <Editable.SubmitTrigger asChild>
            <IconButton
              aria-label="确认"
              size="sm"
              variant="ghost"
              colorPalette="green"
            >
              <LuCheck size={16} />
            </IconButton>
          </Editable.SubmitTrigger>
        </HStack>
      )}
    </Editable.Root>
  );
};
