# TodoList Demo

一个功能完整的待办事项应用，支持拖拽排序、数据持久化等功能。

## 技术栈

- **UI 框架**: React 19 + TypeScript
- **UI 组件库**: Chakra UI v3
- **状态管理**: TanStack Query (React Query)
- **数据库**: IndexedDB + Dexie
- **构建工具**: Vite
- **样式**: CSS in JS (Emotion)
- **工具库**: ahooks, lodash-es, dayjs

## 项目结构

```
src/
├── components/
│   ├── business/            # 业务组件
│   │   ├── AddTodoItem.tsx  # 添加待办项组件
│   │   ├── TodoItem/        # 待办项组件
│   │   └── TodoList/        # 待办列表组件
│   │       └── index.tsx
│   ├── theme.ts             # 主题配置
│   └── ui/                  # UI 基础组件
├── db/                      # 数据库层
│   ├── index.ts             # Dexie 数据库实例
│   └── schema.ts            # 数据模型定义
├── query/                   # 数据查询层
│   ├── all.ts               # 查询 hooks
│   ├── mutations.ts         # 数据变更 hooks
│   ├── update.ts            # 更新逻辑
│   ├── client.ts            # Query Client 配置
│   └── addDefaultData.ts    # 默认数据
├── hooks/                   # 自定义 Hooks
│   └── useEnv.ts
├── App.tsx                 # 应用入口
└── main.tsx                # 主文件

```

## 核心实现

### 1. 数据持久化

使用 **IndexedDB** 作为本地数据存储方案：

- **Dexie** 作为 IndexedDB 的 ORM 封装层
- 支持完整的 CRUD 操作
- 使用 `order` 字段作为排序依据
- 支持数据库版本迁移

**数据模型：**

```typescript
interface TodoRecordItem {
  id: string;
  value: string;
  isCompleted: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}
```

### 2. 状态管理

使用 **TanStack Query** (React Query) 管理服务端/数据库状态：

- 自动缓存和同步数据
- 支持乐观更新
- 提供 loading、error 状态

### 3. 拖拽排序功能 🎯

**完全原生实现**，不依赖 `@dnd-kit` 等第三方拖拽库。

#### 实现原理

通过监听原生鼠标事件序列实现拖拽：

1. **`mousedown`** - 开始拖拽
   - 记录初始鼠标位置和元素位置
   - 在 `document` 上注册全局事件监听器

2. **`mousemove`** - 拖拽移动
   - 计算鼠标当前位置
   - 通过 `getBoundingClientRect()` 检测与其他元素的位置关系
   - 当鼠标越过元素中点时，触发位置交换
   - 实时更新数组顺序

3. **`mouseup`** - 结束拖拽
   - 移除全局事件监听器
   - 保存最终排序到数据库

#### 核心算法

**位置检测：**

```typescript
itemRefs.current.forEach((element, id) => {
  const rect = element.getBoundingClientRect();
  const elementCenterY = rect.top + rect.height / 2;
  const distance = Math.abs(currentY - elementCenterY);

  // 找到距离鼠标最近的元素
  if (distance < closestDistance && distance < rect.height / 2) {
    newHoveredIndex = items.findIndex((item) => item.id === id);
  }
});
```

**数组重排：**

```typescript
const newItems = [...items];
const [removed] = newItems.splice(oldIndex, 1);
newItems.splice(newIndex, 0, removed);
```

**拖拽偏移量计算：**

```typescript
dragOffset =
  dragState.currentY /* 当前鼠标的Y坐标（绝对位置） */ -
  dragState.offsetY /*  鼠标相对于元素顶部的偏移量（鼠标按下时记录） */ -
  dragState.initialElementY /* 元素开始拖拽时的初始Y坐标（绝对位置） */ -
  ((dragState.draggedIndex ?? 0) - dragState.startIndex) * 62 /* 62: 每个列表项+gap的高度 */;
```

### 4. 性能优化

- 使用 `useMemoizedFn` (ahooks) 避免不必要的函数重新创建
- 使用 `useRef` 存储 DOM 引用，避免频繁查询 DOM
- `willChange` 提示浏览器优化渲染

## 已知问题

- <ins>拖拽时，被拖拽的项无法跟随鼠标指针移动；拖拽排序发生变化时没有动画效果</ins>；
- 在TourBox沙盒内，UI无法实现hover效果，部分按钮点击不灵敏。
