import 'dexie-observable';
import Dexie, { Entity, type EntityTable } from 'dexie';
import {
  todoTableLiteral,
  todoSchemaName,
  type AddTodoItemPayload,
  type DeleteTodoItemPayload,
  type TodoRecordItem,
  type UpdateTodoItemPayload,
} from './schema';
import dayjs from 'dayjs';

class TodoModel extends Entity<TodoListService> implements TodoRecordItem {
  id!: string;
  value!: string;
  createdAt!: string;
  updatedAt!: string;
  isCompleted!: boolean;
  order!: number;
}

export class TodoListService extends Dexie {
  private static instance: TodoListService;

  static getInstance(): TodoListService {
    if (!TodoListService.instance) {
      TodoListService.instance = new TodoListService();
    }
    return TodoListService.instance;
  }

  constructor() {
    super(todoSchemaName);
    this.version(1).stores({
      todoTable: todoTableLiteral,
    });
    this.version(2)
      .stores({
        todoTable: todoTableLiteral,
      })
      .upgrade(async (tx) => {
        // Add order field to existing records
        const todos = await tx.table('todoTable').toArray();
        for (let i = 0; i < todos.length; i++) {
          await tx.table('todoTable').update(todos[i].id, { order: i });
        }
      });
    this.todoTable.mapToClass(TodoModel);
  }

  private todoTable!: EntityTable<TodoModel, 'id'>;

  async all(): Promise<TodoRecordItem[]> {
    return await this.todoTable.orderBy('order').toArray();
  }

  async addItem(payload: AddTodoItemPayload): Promise<TodoRecordItem> {
    const now = dayjs().format();

    // Get the max order value
    const maxOrder = await this.todoTable.orderBy('order').last();
    const order = maxOrder ? maxOrder.order + 1 : 0;

    const record = {
      value: payload.value,
      createdAt: now,
      updatedAt: now,
      isCompleted: false,
      order,
    };

    const id = await this.todoTable.add(record);

    return {
      id,
      ...record,
    } as TodoRecordItem;
  }

  async updateItem(payload: UpdateTodoItemPayload): Promise<number> {
    const now = dayjs().format();

    const record = await this.todoTable.get(payload.id);

    if (!record) {
      throw new Error('Todo item not found');
    }

    return await this.todoTable.update(payload.id, {
      ...record,
      value: payload.value ?? record.value,
      isCompleted: payload.isCompleted ?? record.isCompleted,
      updatedAt: now,
    });
  }

  async deleteItem(payload: DeleteTodoItemPayload): Promise<void> {
    return await this.todoTable.delete(payload.id);
  }

  async addBulkItems(payload: AddTodoItemPayload[]): Promise<void> {
    const now = dayjs().format();

    // Get the max order value
    const maxOrder = await this.todoTable.orderBy('order').last();
    const startOrder = maxOrder ? maxOrder.order + 1 : 0;

    const records = payload.map((item, index) => ({
      value: item.value,
      createdAt: now,
      updatedAt: now,
      isCompleted: false,
      order: startOrder + index,
    }));

    await this.todoTable.bulkAdd(records);
  }

  async reorderItems(items: { id: string; order: number }[]): Promise<void> {
    await this.todoTable.bulkUpdate(
      items.map((item) => ({
        key: item.id,
        changes: { order: item.order },
      })),
    );
  }
}

export const todoListService = TodoListService.getInstance();
