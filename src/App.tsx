import { Container, VStack, Heading, Box } from '@chakra-ui/react';
import { useAllTodoItems } from './query/all';

import { TodoList } from './components/business/TodoList';
import { AddTodoItem } from './components/business/AddTodoItem';

function App() {
  const { data: todos, isLoading } = useAllTodoItems();

  return (
    <Container
      maxW="container.md"
      py={10}
    >
      <VStack
        gap={6}
        align="stretch"
      >
        <Heading
          size="2xl"
          textAlign="center"
        >
          Todo List
        </Heading>
        <Box>
          <AddTodoItem />
          <TodoList
            dataSource={todos}
            isLoading={isLoading}
          />
        </Box>
      </VStack>
    </Container>
  );
}

export default App;
