# 旅游酒店预订系统 URL 路径说明文档

## 文档信息

- **项目名称**: 旅游酒店预订系统 (Travel Hotel System)
- **版本**: V1.0
- **更新日期**: 2026-05-19
- **作者**: ZSC Team

---

## 目录

1. [前端路由路径](#1-前端路由路径)
2. [后端 API 接口路径](#2-后端-api-接口路径)
3. [前后端路径映射关系](#3-前后端路径映射关系)
4. [权限标识说明](#4-权限标识说明)

---

## 1. 前端路由路径

### 1.1 公共路由（无需登录）

| 路由路径 | 组件路径 | 页面名称 | 说明 |
|---------|---------|---------|------|
| `/login` | `@/views/login` | 登录页 | 用户登录入口 |
| `/register` | `@/views/register` | 注册页 | 用户注册入口 |
| `/401` | `@/views/error/401` | 401错误页 | 未授权访问提示 |
| `/404` | `@/views/error/404` | 404错误页 | 页面不存在提示 |
| `/redirect/:path` | `@/views/redirect/index` | 重定向页 | 路由重定向处理 |

### 1.2 主框架路由（需要登录）

| 路由路径 | 组件路径 | 页面名称 | 图标 | 说明 |
|---------|---------|---------|------|------|
| `/index` | `@/views/index` | 首页 | dashboard | 系统主页，默认首页 |
| `/user/profile` | `@/views/system/user/profile/index` | 个人中心 | user | 用户个人信息管理 |

### 1.3 业务管理模块路由

**父级菜单**: `/biz` - 业务管理 (icon: shopping)

#### 1.3.1 酒店管理

| 路由路径 | 组件路径 | 页面名称 | 图标 | 功能说明 |
|---------|---------|---------|------|---------|
| `/biz/hotel` | `@/views/biz/hotel/index` | 酒店管理 | home-filled | 酒店信息的增删改查 |

**页面功能**:
- 酒店列表查询（支持按名称、星级、状态筛选）
- 新增酒店
- 修改酒店信息
- 删除酒店
- 查看酒店详情

#### 1.3.2 房源管理

| 路由路径 | 组件路径 | 页面名称 | 图标 | 功能说明 |
|---------|---------|---------|------|---------|
| `/biz/room` | `@/views/biz/room/index` | 房源管理 | office-building | 房型信息的增删改查 |

**页面功能**:
- 房源列表查询（支持按酒店ID、状态筛选）
- 新增房源
- 修改房源信息
- 删除房源
- 查看房源详情

#### 1.3.3 订单管理

| 路由路径 | 组件路径 | 页面名称 | 图标 | 功能说明 |
|---------|---------|---------|------|---------|
| `/biz/order` | `@/views/biz/order/index` | 订单管理 | list | 订单查询与状态管理 |

**页面功能**:
- 订单列表查询（支持按用户ID、订单状态筛选）
- 查看订单详情
- 确认支付（待支付 → 已支付）
- 取消订单（待支付 → 已取消）

#### 1.3.4 评价管理

| 路由路径 | 组件路径 | 页面名称 | 图标 | 功能说明 |
|---------|---------|---------|------|---------|
| `/biz/comment` | `@/views/biz/comment/index` | 评价管理 | chat-dot-round | 评价查看与回复 |

**页面功能**:
- 评价列表查询（支持按酒店ID、房型ID筛选）
- 查看评价详情
- 回复评价

#### 1.3.5 支付管理

| 路由路径 | 组件路径 | 页面名称 | 图标 | 功能说明 |
|---------|---------|---------|------|---------|
| `/biz/payment` | `@/views/biz/payment/index` | 支付管理 | money | 支付记录查询与状态管理 |

**页面功能**:
- 支付列表查询（支持按订单ID、支付状态筛选）
- 查看支付详情
- 确认支付（待支付 → 已支付）
- 标记支付失败（待支付 → 支付失败）

---

## 2. 后端 API 接口路径

**Base URL**: `http://localhost:8080`

### 2.1 酒店管理接口

| 请求方法 | 接口路径 | 权限标识 | 功能说明 |
|---------|---------|---------|---------|
| GET | `/api/hotel/list` | - | 查询酒店列表（分页） |
| GET | `/api/hotel/{id}` | - | 获取酒店详情 |
| POST | `/api/hotel` | `hotel:add` | 新增酒店 |
| PUT | `/api/hotel` | `hotel:edit` | 修改酒店 |
| DELETE | `/api/hotel/{id}` | `hotel:remove` | 删除酒店 |

**查询参数** (`/api/hotel/list`):
- `pageNum`: 页码（默认1）
- `pageSize`: 每页数量（默认10）
- `name`: 酒店名称（模糊查询，可选）
- `star`: 酒店星级（可选）
- `status`: 状态（0正常 1停用，可选）

### 2.2 房源管理接口

| 请求方法 | 接口路径 | 权限标识 | 功能说明 |
|---------|---------|---------|---------|
| GET | `/api/room/list` | - | 查询房源列表（分页） |
| GET | `/api/room/{id}` | - | 获取房源详情 |
| POST | `/api/room` | `room:add` | 新增房源 |
| PUT | `/api/room` | `room:edit` | 修改房源 |
| DELETE | `/api/room/{id}` | `room:remove` | 删除房源 |

**查询参数** (`/api/room/list`):
- `pageNum`: 页码（默认1）
- `pageSize`: 每页数量（默认10）
- `hotelId`: 酒店ID（可选）
- `status`: 状态（0正常 1停用，可选）

### 2.3 订单管理接口

| 请求方法 | 接口路径 | 权限标识 | 功能说明 |
|---------|---------|---------|---------|
| GET | `/api/order/list` | - | 查询订单列表（分页） |
| GET | `/api/order/{id}` | - | 获取订单详情 |
| POST | `/api/order` | - | 创建订单 |
| PUT | `/api/order/{id}/status` | `order:edit` | 更新订单状态 |

**查询参数** (`/api/order/list`):
- `pageNum`: 页码（默认1）
- `pageSize`: 每页数量（默认10）
- `userId`: 用户ID（可选）
- `status`: 订单状态（可选）

**订单状态值**:
- `0`: 待支付
- `1`: 已支付
- `2`: 已取消
- `3`: 已完成
- `4`: 退款中
- `5`: 已退款

**更新状态参数** (`/api/order/{id}/status`):
- `status`: 订单状态（必填）

### 2.4 评价管理接口

| 请求方法 | 接口路径 | 权限标识 | 功能说明 |
|---------|---------|---------|---------|
| GET | `/api/comment/list` | - | 查询评价列表（分页） |
| GET | `/api/comment/{id}` | - | 获取评价详情 |
| POST | `/api/comment` | - | 添加评价 |
| PUT | `/api/comment/{id}/reply` | `comment:reply` | 回复评价 |

**查询参数** (`/api/comment/list`):
- `pageNum`: 页码（默认1）
- `pageSize`: 每页数量（默认10）
- `hotelId`: 酒店ID（可选）
- `roomId`: 房型ID（可选）

**回复参数** (`/api/comment/{id}/reply`):
- `replyContent`: 回复内容（必填）

### 2.5 支付管理接口

| 请求方法 | 接口路径 | 权限标识 | 功能说明 |
|---------|---------|---------|---------|
| GET | `/api/payment/list` | - | 查询支付列表（分页） |
| GET | `/api/payment/{id}` | - | 获取支付详情 |
| POST | `/api/payment` | - | 创建支付记录 |
| PUT | `/api/payment/{id}/status` | `payment:edit` | 更新支付状态 |

**查询参数** (`/api/payment/list`):
- `pageNum`: 页码（默认1）
- `pageSize`: 每页数量（默认10）
- `orderId`: 订单ID（可选）
- `payStatus`: 支付状态（可选）

**支付状态值**:
- `0`: 待支付
- `1`: 已支付
- `2`: 支付失败
- `3`: 退款中
- `4`: 已退款

**支付类型值**:
- `1`: 微信支付
- `2`: 支付宝
- `3`: 银行卡

**更新状态参数** (`/api/payment/{id}/status`):
- `status`: 支付状态（必填）
- `transactionId`: 交易号（可选）

---

## 3. 前后端路径映射关系

### 3.1 酒店管理模块

| 前端页面 | 前端API文件 | 后端Controller | 接口路径 |
|---------|-----------|---------------|---------|
| `/biz/hotel` | `src/api/biz/hotel.js` | `HotelController.java` | `/api/hotel/*` |

**API调用映射**:
```javascript
// 前端调用                    // 后端接口
listHotel(query)       →      GET  /api/hotel/list
getHotel(id)           →      GET  /api/hotel/{id}
addHotel(data)         →      POST /api/hotel
updateHotel(data)      →      PUT  /api/hotel
delHotel(id)           →      DELETE /api/hotel/{id}
```

### 3.2 房源管理模块

| 前端页面 | 前端API文件 | 后端Controller | 接口路径 |
|---------|-----------|---------------|---------|
| `/biz/room` | `src/api/biz/room.js` | `RoomController.java` | `/api/room/*` |

**API调用映射**:
```javascript
// 前端调用                    // 后端接口
listRoom(query)        →      GET  /api/room/list
getRoom(id)            →      GET  /api/room/{id}
addRoom(data)          →      POST /api/room
updateRoom(data)       →      PUT  /api/room
delRoom(id)            →      DELETE /api/room/{id}
```

### 3.3 订单管理模块

| 前端页面 | 前端API文件 | 后端Controller | 接口路径 |
|---------|-----------|---------------|---------|
| `/biz/order` | `src/api/biz/order.js` | `OrderController.java` | `/api/order/*` |

**API调用映射**:
```javascript
// 前端调用                    // 后端接口
listOrder(query)       →      GET  /api/order/list
getOrder(id)           →      GET  /api/order/{id}
createOrder(data)      →      POST /api/order
updateOrderStatus(id, status) → PUT /api/order/{id}/status?status={status}
```

### 3.4 评价管理模块

| 前端页面 | 前端API文件 | 后端Controller | 接口路径 |
|---------|-----------|---------------|---------|
| `/biz/comment` | `src/api/biz/comment.js` | `CommentController.java` | `/api/comment/*` |

**API调用映射**:
```javascript
// 前端调用                    // 后端接口
listComment(query)     →      GET  /api/comment/list
getComment(id)         →      GET  /api/comment/{id}
addComment(data)       →      POST /api/comment
replyComment(id, replyContent) → PUT /api/comment/{id}/reply?replyContent={content}
```

### 3.5 支付管理模块

| 前端页面 | 前端API文件 | 后端Controller | 接口路径 |
|---------|-----------|---------------|---------|
| `/biz/payment` | `src/api/biz/payment.js` | `PaymentController.java` | `/api/payment/*` |

**API调用映射**:
```javascript
// 前端调用                    // 后端接口
listPayment(query)     →      GET  /api/payment/list
getPayment(id)         →      GET  /api/payment/{id}
createPayment(data)    →      POST /api/payment
updatePaymentStatus(id, status, transactionId) 
                         →      PUT /api/payment/{id}/status?status={status}&transactionId={id}
```

---

## 4. 权限标识说明

### 4.1 权限格式

权限标识采用 `模块:操作` 的格式，例如：`hotel:add`

### 4.2 权限清单

#### 酒店管理权限
| 权限标识 | 说明 | 对应操作 |
|---------|------|---------|
| `hotel:add` | 酒店新增权限 | 新增酒店按钮 |
| `hotel:edit` | 酒店编辑权限 | 修改酒店按钮 |
| `hotel:remove` | 酒店删除权限 | 删除酒店按钮 |
| `hotel:query` | 酒店查询权限 | 查看详情按钮 |

#### 房源管理权限
| 权限标识 | 说明 | 对应操作 |
|---------|------|---------|
| `room:add` | 房源新增权限 | 新增房源按钮 |
| `room:edit` | 房源编辑权限 | 修改房源按钮 |
| `room:remove` | 房源删除权限 | 删除房源按钮 |
| `room:query` | 房源查询权限 | 查看详情按钮 |

#### 订单管理权限
| 权限标识 | 说明 | 对应操作 |
|---------|------|---------|
| `order:edit` | 订单编辑权限 | 确认支付、取消订单按钮 |
| `order:query` | 订单查询权限 | 查看详情按钮 |

#### 评价管理权限
| 权限标识 | 说明 | 对应操作 |
|---------|------|---------|
| `comment:reply` | 评价回复权限 | 回复评价按钮 |
| `comment:query` | 评价查询权限 | 查看详情按钮 |

#### 支付管理权限
| 权限标识 | 说明 | 对应操作 |
|---------|------|---------|
| `payment:edit` | 支付编辑权限 | 确认支付、标记失败按钮 |
| `payment:query` | 支付查询权限 | 查看详情按钮 |

### 4.3 前端权限使用示例

```vue
<!-- 按钮级权限控制 -->
<el-button 
  v-hasPermi="['hotel:add']" 
  @click="handleAdd"
>
  新增
</el-button>

<el-button 
  v-hasPermi="['hotel:edit']" 
  @click="handleUpdate(row)"
>
  修改
</el-button>

<el-button 
  v-hasPermi="['hotel:remove']" 
  @click="handleDelete(row)"
>
  删除
</el-button>
```

---

## 5. 通用响应格式

### 5.1 成功响应

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {}
}
```

### 5.2 分页响应

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "total": 100,
    "rows": [
      {
        "id": 1,
        "name": "北京大酒店",
        ...
      }
    ]
  }
}
```

### 5.3 错误响应

```json
{
  "code": 500,
  "msg": "服务器内部错误",
  "data": null
}
```

### 5.4 响应码说明

| 响应码 | 说明 |
|-------|------|
| 200 | 成功 |
| 401 | 未授权（需要登录） |
| 403 | 禁止访问（无权限） |
| 500 | 服务器内部错误 |

---

## 6. 认证方式

### 6.1 JWT Token 认证

所有需要权限的接口都需要在请求头中携带有效的 JWT Token。

**请求头格式**:
```
Authorization: Bearer {token}
```

### 6.2 Token 获取

通过登录接口获取 Token：
- 登录成功后，Token 会自动存储在本地（localStorage/cookie）
- 后续请求会自动在请求头中添加 Token

---

## 7. 数据字典

### 7.1 酒店/房源状态

| 值 | 说明 |
|---|------|
| 0 | 正常 |
| 1 | 停用 |

### 7.2 订单状态

| 值 | 说明 |
|---|------|
| 0 | 待支付 |
| 1 | 已支付 |
| 2 | 已取消 |
| 3 | 已完成 |
| 4 | 退款中 |
| 5 | 已退款 |

### 7.3 支付状态

| 值 | 说明 |
|---|------|
| 0 | 待支付 |
| 1 | 已支付 |
| 2 | 支付失败 |
| 3 | 退款中 |
| 4 | 已退款 |

### 7.4 支付类型

| 值 | 说明 |
|---|------|
| 1 | 微信支付 |
| 2 | 支付宝 |
| 3 | 银行卡 |

### 7.5 酒店星级

| 值 | 说明 |
|---|------|
| 1 | 一星 |
| 2 | 二星 |
| 3 | 三星 |
| 4 | 四星 |
| 5 | 五星 |

---

## 8. 注意事项

1. **日期格式**: 统一使用 `yyyy-MM-dd` 或 `yyyy-MM-dd HH:mm:ss` 格式
2. **金额单位**: 单位为元，保留两位小数
3. **分页参数**: 统一使用 `pageNum` 和 `pageSize`
4. **权限控制**: 前端使用 `v-hasPermi` 指令，后端使用 `@PreAuthorize` 注解
5. **跨域配置**: 开发环境需配置代理，生产环境需配置 CORS
6. **图片URL**: 支持相对路径和绝对路径，建议使用完整的 URL
7. **超时时间**: 建议设置请求超时时间为 30 秒

---

## 9. 开发环境配置

### 9.1 前端开发服务器

```bash
# 启动开发服务器
npm run dev

# 默认访问地址
http://localhost:5173
```

### 9.2 后端服务

```bash
# 启动后端服务
# 默认端口: 8080
http://localhost:8080
```

### 9.3 代理配置

前端开发环境通过 Vite 代理转发请求到后端：

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '/api')
    }
  }
}
```

---

## 10. 附录

### 10.1 相关文档

- [API接口文档.md](./API接口文档.md)
- [旅游酒店预订系统需求规格说明书.md](./旅游酒店预订系统需求规格说明书.md)
- [旅游酒店预订系统面向对象设计报告.md](./旅游酒店预订系统面向对象设计报告.md)

### 10.2 技术栈

**前端**:
- Vue 3.5.26
- Element Plus 2.13.1
- Vue Router 4.6.4
- Pinia 3.0.4
- Axios 1.13.2
- Vite 5.x

**后端**:
- Spring Boot
- MyBatis Plus
- Spring Security + JWT
- MySQL 8.0+
- Redis 6.0+

---

**文档结束**

如有问题，请联系开发团队。
