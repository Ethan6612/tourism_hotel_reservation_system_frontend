<template>
  <div class="app-container">
    <!-- 顶部导航 -->
    <div class="page-top mb8">
      <el-button icon="ArrowLeft" @click="goBack">返回酒店管理</el-button>
      <span class="hotel-title" v-if="hotelName">🏨 {{ hotelName }} - 房型管理</span>
    </div>

    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增房型</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Warning" @click="showLowStock">库存预警</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="roomList">
      <el-table-column label="ID" align="center" prop="id" width="60" />
      <el-table-column label="房型图片" align="center" prop="imgUrl" width="100">
        <template #default="scope">
          <el-image v-if="scope.row.imgUrl" :src="scope.row.imgUrl" style="width: 60px; height: 45px; border-radius: 4px" fit="cover" :preview-src-list="[scope.row.imgUrl]" />
          <span v-else style="color: #ccc">无图片</span>
        </template>
      </el-table-column>
      <el-table-column label="房型名称" align="center" prop="roomType" :show-overflow-tooltip="true" min-width="120" />
      <el-table-column label="面积" align="center" prop="area" width="80" />
      <el-table-column label="床型" align="center" prop="bedType" width="100" />
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
      <el-table-column label="操作" align="center" width="300" fixed="right">
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
            <el-form-item label="房型名称" prop="roomType">
              <el-input v-model="form.roomType" placeholder="如：豪华大床房、标准双床房" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="床型" prop="bedType">
              <el-select v-model="form.bedType" placeholder="请选择床型" clearable>
                <el-option label="大床" value="大床" />
                <el-option label="双床" value="双床" />
                <el-option label="单人床" value="单人床" />
                <el-option label="圆床" value="圆床" />
                <el-option label="上下铺" value="上下铺" />
                <el-option label="榻榻米" value="榻榻米" />
                <el-option label="沙发床" value="沙发床" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="面积" prop="area">
              <el-input v-model="form.area" placeholder="如：30m²" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" :step="10" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input-number v-model="form.stock" :min="0" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
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

<script setup name="BizRoom">
import { listRoom, getRoom, addRoom, updateRoom, delRoom, updateRoomStatus, updateRoomPrice, updateRoomStock, getLowStockRooms, getRoomsByHotelId } from '@/api/biz/room'
import { useRouter, useRoute } from 'vue-router'

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const roomList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const open = ref(false)
const priceOpen = ref(false)
const stockOpen = ref(false)
const title = ref('')

const hotelId = ref(route.query.hotelId ? Number(route.query.hotelId) : undefined)
const hotelName = ref(route.query.hotelName || '全部酒店')

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  roomType: undefined,
  status: undefined,
  hotelId: hotelId.value
})

const form = ref({
  id: undefined,
  hotelId: hotelId.value,
  roomType: '',
  area: '',
  bedType: '',
  price: 0,
  stock: 0,
  imgUrl: ''
})

const currentRoom = ref({})
const priceForm = ref({ price: 0 })
const stockForm = ref({ stock: 0 })

const rules = {
  roomType: [{ required: true, message: '房型名称不能为空', trigger: 'blur' }],
  price: [{ required: true, message: '价格不能为空', trigger: 'blur' }],
  stock: [{ required: true, message: '库存不能为空', trigger: 'blur' }]
}

function goBack() {
  router.push('/biz/hotel')
}

function reset() {
  form.value = {
    id: undefined,
    hotelId: hotelId.value,
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

function getList(paginationParams) {
  if (paginationParams) {
    queryParams.value.pageNum = paginationParams.page
    queryParams.value.pageSize = paginationParams.limit
  }
  loading.value = true

  const requestPromise = hotelId.value
    ? getRoomsByHotelId(hotelId.value).then(res => {
        const allList = res.data || res || []
        let list = [...allList]
        if (queryParams.value.roomType) {
          list = list.filter(r => r.roomType && r.roomType.includes(queryParams.value.roomType))
        }
        if (queryParams.value.status !== undefined && queryParams.value.status !== '') {
          list = list.filter(r => r.status === queryParams.value.status)
        }
        const start = (queryParams.value.pageNum - 1) * queryParams.value.pageSize
        return { list: list.slice(start, start + queryParams.value.pageSize), total: list.length }
      })
    : listRoom(queryParams.value).then(res => ({
        list: res.data?.list || res.data?.rows || res.rows || [],
        total: res.data?.total || res.total || 0
      }))

  requestPromise.then(({ list, total: t }) => {
    roomList.value = list
    total.value = t
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '新增房型'
}

function handleUpdate(row) {
  reset()
  getRoom(row.id).then(response => {
    form.value = response.data || response
    open.value = true
    title.value = '编辑房型'
  })
}

function submitForm() {
  proxy.$refs['roomRef'].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateRoom(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addRoom(form.value).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
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
      updateRoomPrice(currentRoom.value.id, priceForm.value.price).then(() => {
        proxy.$modal.msgSuccess('价格调整成功')
        priceOpen.value = false
        getList()
      })
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
      updateRoomStock(currentRoom.value.id, stockForm.value.stock).then(() => {
        proxy.$modal.msgSuccess('库存调整成功')
        stockOpen.value = false
        getList()
      })
    }
  })
}

function handleStatusChange(row, status) {
  const label = status === '0' ? '上架' : '下架'
  proxy.$modal.confirm(`确认${label}房型"${row.roomType}"？`).then(() => {
    return updateRoomStatus(row.id, status)
  }).then(() => {
    proxy.$modal.msgSuccess(`${label}成功`)
    getList()
  }).catch(() => {})
}

function handleDelete(row) {
  proxy.$modal.confirm(`确认删除房型"${row.roomType}"？删除后不可恢复。`).then(() => {
    return delRoom(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess('删除成功')
    getList()
  }).catch(() => {})
}

function showLowStock() {
  const threshold = 5
  getLowStockRooms(threshold, hotelId.value).then(response => {
    const list = response.data || response || []
    if (list.length === 0) {
      proxy.$modal.alert('暂无低库存房型', '库存状态', { type: 'success' })
    } else {
      const names = list.map(r => `"${r.roomType}"（库存: ${r.stock}）`).join('、')
      proxy.$modal.alert(`以下房型库存不足（低于${threshold}）：<br/>${names}`, '库存预警', {
        dangerouslyUseHTMLString: true,
        type: 'warning'
      })
    }
  })
}

getList()
</script>

<style scoped lang="scss">
.page-top {
  display: flex;
  align-items: center;
  gap: 16px;
}
.hotel-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}
.price-text {
  color: #e6a23c;
  font-weight: 600;
  font-size: 16px;
}
</style>
