<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="所属酒店" prop="hotelId">
        <el-select v-model="queryParams.hotelId" placeholder="请选择酒店" clearable>
          <el-option v-for="h in hotelOptions" :key="h.id" :label="h.name" :value="h.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="房型名称" prop="roomType">
        <el-input v-model="queryParams.roomType" placeholder="请输入房型名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="上架" value="0" />
          <el-option label="下架" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增房型</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Warning" @click="showLowStock">库存预警</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="roomList">
      <el-table-column label="ID" align="center" prop="id" width="60" />
      <el-table-column label="房型图片" align="center" prop="imgUrl" width="100">
        <template #default="scope">
          <el-image v-if="scope.row.imgUrl" :src="scope.row.imgUrl" style="width: 60px; height: 45px; border-radius: 4px" fit="cover" :preview-src-list="[scope.row.imgUrl]" preview-teleported />
          <span v-else style="color: #ccc">无图片</span>
        </template>
      </el-table-column>
      <el-table-column label="所属酒店" align="center" prop="hotelName" :show-overflow-tooltip="true" min-width="140" />
      <el-table-column label="房型名称" align="center" prop="roomType" :show-overflow-tooltip="true" min-width="120" />
      <el-table-column label="面积" align="center" prop="area" width="80" />
      <el-table-column label="床型" align="center" prop="bedType" width="90" />
      <el-table-column label="价格" align="center" prop="price" width="110">
        <template #default="scope">
          <span class="price-text">¥{{ scope.row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column label="库存" align="center" prop="stock" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.stock <= 5 ? 'danger' : scope.row.stock <= 10 ? 'warning' : 'success'">
            {{ scope.row.stock }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'">
            {{ scope.row.status === '0' ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="280" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button link type="warning" icon="Money" @click="handlePrice(scope.row)">调价</el-button>
          <el-button link type="primary" icon="Box" @click="handleStock(scope.row)">库存</el-button>
          <el-button v-if="scope.row.status === '0'" link type="warning" icon="VideoPause" @click="handleStatusChange(scope.row, '1')">下架</el-button>
          <el-button v-if="scope.row.status === '1'" link type="success" icon="VideoPlay" @click="handleStatusChange(scope.row, '0')">上架</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="title" v-model="open" width="650px" append-to-body>
      <el-form ref="roomRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属酒店" prop="hotelId">
              <el-select v-model="form.hotelId" placeholder="请选择酒店" @change="onHotelChange">
                <el-option v-for="h in hotelOptions" :key="h.id" :label="h.name" :value="h.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房型名称" prop="roomType">
              <el-input v-model="form.roomType" placeholder="如：豪华大床房" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="床型" prop="bedType">
              <el-select v-model="form.bedType" placeholder="请选择床型" clearable>
                <el-option label="大床" value="大床" />
                <el-option label="双床" value="双床" />
                <el-option label="单人床" value="单人床" />
                <el-option label="圆床" value="圆床" />
                <el-option label="上下铺" value="上下铺" />
                <el-option label="榻榻米" value="榻榻米" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="面积" prop="area">
              <el-input v-model="form.area" placeholder="如：30m²" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" :step="10" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input-number v-model="form.stock" :min="0" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="图片URL" prop="imgUrl">
              <el-input v-model="form.imgUrl" placeholder="请输入房型图片URL" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 价格调整对话框 -->
    <el-dialog title="调整价格" v-model="priceOpen" width="380px" append-to-body>
      <el-form ref="priceRef" :model="priceForm" :rules="{ price: [{ required: true, message: '价格不能为空', trigger: 'blur' }] }" label-width="80px">
        <el-form-item label="当前价格"><span class="price-text">¥{{ currentRoom.price }}</span></el-form-item>
        <el-form-item label="新价格" prop="price">
          <el-input-number v-model="priceForm.price" :min="0" :precision="2" :step="10" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="priceOpen = false">取 消</el-button>
        <el-button type="primary" @click="submitPrice">确认调整</el-button>
      </template>
    </el-dialog>

    <!-- 库存调整对话框 -->
    <el-dialog title="调整库存" v-model="stockOpen" width="380px" append-to-body>
      <el-form ref="stockRef" :model="stockForm" :rules="{ stock: [{ required: true, message: '库存不能为空', trigger: 'blur' }] }" label-width="80px">
        <el-form-item label="当前库存">
          <el-tag :type="currentRoom.stock <= 5 ? 'danger' : 'success'">{{ currentRoom.stock }}</el-tag>
        </el-form-item>
        <el-form-item label="新库存" prop="stock">
          <el-input-number v-model="stockForm.stock" :min="0" :step="1" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockOpen = false">取 消</el-button>
        <el-button type="primary" @click="submitStock">确认调整</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="AdminRoomManage">
import { ref, getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()

const roomList = ref([])
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const open = ref(false)
const priceOpen = ref(false)
const stockOpen = ref(false)
const title = ref('')
const currentRoom = ref({})

const hotelOptions = ref([
  { id: 1, name: '北京国际大酒店' },
  { id: 2, name: '上海外滩精品酒店' },
  { id: 3, name: '广州白云温泉度假村' },
  { id: 5, name: '杭州西湖畔民宿' },
  { id: 8, name: '三亚海景度假酒店' },
  { id: 9, name: '厦门鼓浪屿别墅酒店' },
  { id: 11, name: '苏州园林精品客栈' },
  { id: 12, name: '哈尔滨冰雪主题酒店' }
])

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  hotelId: undefined,
  roomType: undefined,
  status: undefined
})

const form = ref({
  id: undefined,
  hotelId: undefined,
  hotelName: '',
  roomType: '',
  area: '',
  bedType: '',
  price: 0,
  stock: 0,
  imgUrl: ''
})

const priceForm = ref({ price: 0 })
const stockForm = ref({ stock: 0 })

const rules = {
  hotelId: [{ required: true, message: '请选择所属酒店', trigger: 'change' }],
  roomType: [{ required: true, message: '房型名称不能为空', trigger: 'blur' }],
  price: [{ required: true, message: '价格不能为空', trigger: 'blur' }],
  stock: [{ required: true, message: '库存不能为空', trigger: 'blur' }]
}

// ========== Mock 数据 ==========
const mockRooms = [
  { id: 101, hotelId: 1, hotelName: '北京国际大酒店', roomType: '豪华大床房', area: '45m²', bedType: '大床', price: 888, stock: 20, status: '0', imgUrl: 'https://picsum.photos/seed/room1/400/300', createTime: '2026-01-15 10:30:00' },
  { id: 102, hotelId: 1, hotelName: '北京国际大酒店', roomType: '标准双床房', area: '35m²', bedType: '双床', price: 588, stock: 35, status: '0', imgUrl: 'https://picsum.photos/seed/room2/400/300', createTime: '2026-01-15 10:30:00' },
  { id: 103, hotelId: 1, hotelName: '北京国际大酒店', roomType: '总统套房', area: '120m²', bedType: '大床', price: 2888, stock: 3, status: '0', imgUrl: 'https://picsum.photos/seed/room3/400/300', createTime: '2026-01-15 10:30:00' },
  { id: 201, hotelId: 2, hotelName: '上海外滩精品酒店', roomType: '外滩景观房', area: '40m²', bedType: '大床', price: 1280, stock: 15, status: '0', imgUrl: 'https://picsum.photos/seed/room4/400/300', createTime: '2026-02-20 14:00:00' },
  { id: 202, hotelId: 2, hotelName: '上海外滩精品酒店', roomType: '城景标准房', area: '30m²', bedType: '双床', price: 680, stock: 25, status: '0', imgUrl: 'https://picsum.photos/seed/room5/400/300', createTime: '2026-02-20 14:00:00' },
  { id: 301, hotelId: 3, hotelName: '广州白云温泉度假村', roomType: '温泉亲子房', area: '55m²', bedType: '大床', price: 1580, stock: 8, status: '0', imgUrl: 'https://picsum.photos/seed/room6/400/300', createTime: '2026-03-05 09:15:00' },
  { id: 302, hotelId: 3, hotelName: '广州白云温泉度假村', roomType: '山景标准房', area: '38m²', bedType: '双床', price: 780, stock: 2, status: '0', imgUrl: 'https://picsum.photos/seed/room7/400/300', createTime: '2026-03-05 09:15:00' },
  { id: 501, hotelId: 5, hotelName: '杭州西湖畔民宿', roomType: '湖景大床房', area: '32m²', bedType: '大床', price: 960, stock: 6, status: '0', imgUrl: 'https://picsum.photos/seed/room8/400/300', createTime: '2026-04-02 11:20:00' },
  { id: 502, hotelId: 5, hotelName: '杭州西湖畔民宿', roomType: '庭院双床房', area: '28m²', bedType: '双床', price: 680, stock: 4, status: '1', imgUrl: 'https://picsum.photos/seed/room9/400/300', createTime: '2026-04-02 11:20:00' },
  { id: 801, hotelId: 8, hotelName: '三亚海景度假酒店', roomType: '海景豪华套房', area: '80m²', bedType: '大床', price: 2680, stock: 12, status: '0', imgUrl: 'https://picsum.photos/seed/room10/400/300', createTime: '2026-05-01 10:00:00' },
  { id: 802, hotelId: 8, hotelName: '三亚海景度假酒店', roomType: '园景标准房', area: '35m²', bedType: '双床', price: 880, stock: 30, status: '0', imgUrl: 'https://picsum.photos/seed/room11/400/300', createTime: '2026-05-01 10:00:00' },
  { id: 803, hotelId: 8, hotelName: '三亚海景度假酒店', roomType: '总统别墅', area: '200m²', bedType: '大床', price: 8888, stock: 1, status: '0', imgUrl: 'https://picsum.photos/seed/room12/400/300', createTime: '2026-05-01 10:00:00' },
  { id: 901, hotelId: 9, hotelName: '厦门鼓浪屿别墅酒店', roomType: '海景阳台房', area: '42m²', bedType: '大床', price: 1180, stock: 5, status: '0', imgUrl: 'https://picsum.photos/seed/room13/400/300', createTime: '2026-05-12 15:30:00' },
  { id: 1101, hotelId: 11, hotelName: '苏州园林精品客栈', roomType: '园林雅居', area: '36m²', bedType: '大床', price: 860, stock: 8, status: '0', imgUrl: 'https://picsum.photos/seed/room14/400/300', createTime: '2026-05-28 14:15:00' },
  { id: 1201, hotelId: 12, hotelName: '哈尔滨冰雪主题酒店', roomType: '冰雪主题房', area: '30m²', bedType: '双床', price: 520, stock: 15, status: '0', imgUrl: 'https://picsum.photos/seed/room15/400/300', createTime: '2026-06-05 11:45:00' }
]

function getList() {
  loading.value = true
  setTimeout(() => {
    let data = [...mockRooms]
    if (queryParams.value.hotelId) {
      data = data.filter(r => r.hotelId === queryParams.value.hotelId)
    }
    if (queryParams.value.roomType) {
      data = data.filter(r => r.roomType.includes(queryParams.value.roomType))
    }
    if (queryParams.value.status !== undefined && queryParams.value.status !== '') {
      data = data.filter(r => r.status === queryParams.value.status)
    }
    total.value = data.length
    const start = (queryParams.value.pageNum - 1) * queryParams.value.pageSize
    roomList.value = data.slice(start, start + queryParams.value.pageSize)
    loading.value = false
  }, 300)
}

function onHotelChange(hotelId) {
  const hotel = hotelOptions.value.find(h => h.id === hotelId)
  form.value.hotelName = hotel ? hotel.name : ''
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

function reset() {
  form.value = {
    id: undefined,
    hotelId: undefined,
    hotelName: '',
    roomType: '',
    area: '',
    bedType: '',
    price: 0,
    stock: 0,
    imgUrl: ''
  }
  proxy.resetForm('roomRef')
}

function cancel() {
  open.value = false
  reset()
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '新增房型'
}

function handleUpdate(row) {
  reset()
  form.value = { ...row }
  open.value = true
  title.value = '编辑房型'
}

function submitForm() {
  proxy.$refs['roomRef'].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        const idx = mockRooms.findIndex(r => r.id === form.value.id)
        if (idx !== -1) {
          const hotel = hotelOptions.value.find(h => h.id === form.value.hotelId)
          form.value.hotelName = hotel ? hotel.name : ''
          Object.assign(mockRooms[idx], form.value)
        }
        proxy.$modal.msgSuccess('修改成功')
      } else {
        const newId = Math.max(...mockRooms.map(r => r.id)) + 1
        const hotel = hotelOptions.value.find(h => h.id === form.value.hotelId)
        mockRooms.push({
          ...form.value,
          id: newId,
          hotelName: hotel ? hotel.name : '',
          status: '0',
          createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
        })
        proxy.$modal.msgSuccess('新增成功')
      }
      open.value = false
      getList()
    }
  })
}

function handlePrice(row) {
  currentRoom.value = row
  priceForm.value.price = row.price
  priceOpen.value = true
}

function submitPrice() {
  proxy.$refs['priceRef'].validate(valid => {
    if (valid) {
      currentRoom.value.price = priceForm.value.price
      proxy.$modal.msgSuccess('价格调整成功')
      priceOpen.value = false
      getList()
    }
  })
}

function handleStock(row) {
  currentRoom.value = row
  stockForm.value.stock = row.stock
  stockOpen.value = true
}

function submitStock() {
  proxy.$refs['stockRef'].validate(valid => {
    if (valid) {
      currentRoom.value.stock = stockForm.value.stock
      proxy.$modal.msgSuccess('库存调整成功')
      stockOpen.value = false
      getList()
    }
  })
}

function handleStatusChange(row, status) {
  const label = status === '0' ? '上架' : '下架'
  proxy.$modal.confirm(`确认${label}房型"${row.roomType}"？`).then(() => {
    row.status = status
    proxy.$modal.msgSuccess(`${label}成功`)
    getList()
  }).catch(() => {})
}

function handleDelete(row) {
  proxy.$modal.confirm(`确认删除房型"${row.roomType}"？删除后不可恢复。`).then(() => {
    const idx = mockRooms.findIndex(r => r.id === row.id)
    if (idx !== -1) mockRooms.splice(idx, 1)
    proxy.$modal.msgSuccess('删除成功')
    getList()
  }).catch(() => {})
}

function showLowStock() {
  const threshold = 5
  const lowStockRooms = mockRooms.filter(r => r.stock <= threshold && r.status === '0')
  if (lowStockRooms.length === 0) {
    proxy.$modal.alert('暂无低库存房型', '库存状态', { type: 'success' })
  } else {
    const names = lowStockRooms.map(r => `"${r.hotelName} - ${r.roomType}"（库存: ${r.stock}）`).join('<br/>')
    proxy.$modal.alert(`以下房型库存不足（≤${threshold}）：<br/>${names}`, '库存预警', {
      dangerouslyUseHTMLString: true,
      type: 'warning'
    })
  }
}

getList()
</script>

<style scoped lang="scss">
.price-text {
  color: #e6a23c;
  font-weight: 600;
  font-size: 16px;
}
</style>
