<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="所属酒店" prop="hotelId">
        <el-select v-model="queryParams.hotelId" placeholder="请输入酒店名称搜索" clearable filterable>
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
      <el-table-column label="可住人数" align="center" prop="guestNum" width="90">
        <template #default="scope">
          {{ scope.row.guestNum || '-' }}人
        </template>
      </el-table-column>
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
              <el-select v-model="form.hotelId" placeholder="请输入酒店名称搜索" filterable>
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
            <el-form-item label="可住人数" prop="guestNum">
              <el-input-number v-model="form.guestNum" :min="1" :max="20" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
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
            <el-form-item label="房型图片" prop="imgUrl">
              <ImageUpload
                ref="imageUploadRef"
                v-model="form.imgUrl"
                action="/common/upload/oss"
                :limit="1"
                :file-size="2"
                :file-type="['png', 'jpg', 'jpeg']"
                :auto-upload="false"
              />
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

    <!-- 库存预警对话框 -->
    <el-dialog title="库存预警" v-model="lowStockOpen" width="700px" append-to-body>
      <div v-if="lowStockList.length === 0" class="empty-stock">
        <el-icon :size="48" color="#67c23a"><CircleCheck /></el-icon>
        <p>暂无低库存房型，库存充足！</p>
      </div>
      <template v-else>
        <div class="stock-summary">
          <el-alert :title="`共有 ${lowStockList.length} 个房型库存不足`" type="warning" show-icon :closable="false" />
        </div>
        <el-table :data="lowStockList" border style="margin-top: 15px">
          <el-table-column label="酒店名称" prop="hotelName" :show-overflow-tooltip="true" min-width="150" />
          <el-table-column label="房型" prop="roomType" width="120" />
          <el-table-column label="当前库存" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.stock === 0 ? 'danger' : 'warning'" effect="dark">
                {{ scope.row.stock }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="scope">
              <el-button link type="primary" icon="Box" @click="handleStockFromAlert(scope.row)">补货</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="AdminRoomManage">
import { ref, getCurrentInstance } from 'vue'
import { CircleCheck } from '@element-plus/icons-vue'
import { listRoom, addRoom, updateRoom, delRoom, updateRoomStatus, updateRoomPrice, updateRoomStock, getLowStockRooms } from '@/api/biz/adminRoom'
import { listHotel } from '@/api/biz/adminHotel'

const { proxy } = getCurrentInstance()

const roomList = ref([])
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const open = ref(false)
const priceOpen = ref(false)
const stockOpen = ref(false)
const lowStockOpen = ref(false)
const lowStockList = ref([])
const title = ref('')
const currentRoom = ref({})

const hotelOptions = ref([])

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  hotelId: undefined,
  roomType: undefined,
  status: undefined
})

const imageUploadRef = ref(null)

const form = ref({
  id: undefined,
  hotelId: undefined,
  roomType: '',
  area: '',
  bedType: '',
  guestNum: 2,
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

/** 加载酒店下拉选项 */
function loadHotelOptions() {
  listHotel({ pageNum: 1, pageSize: 100 }).then(res => {
    const page = res.data || {}
    hotelOptions.value = (page.rows || []).map(h => ({ id: h.id, name: h.name }))
  })
}

/** 查询房型列表 */
function getList() {
  loading.value = true
  listRoom(queryParams.value).then(res => {
    const page = res.data || {}
    roomList.value = page.rows || []
    total.value = page.total || 0
  }).finally(() => {
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

function reset() {
  form.value = {
    id: undefined,
    hotelId: undefined,
    roomType: '',
    area: '',
    bedType: '',
    guestNum: 2,
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

async function submitForm() {
  try {
    await proxy.$refs['roomRef'].validate()
  } catch {
    return
  }
  // 先上传图片到OSS
  if (imageUploadRef.value) {
    const imgUrl = await imageUploadRef.value.submitUpload()
    if (imgUrl !== null) {
      form.value.imgUrl = imgUrl
    }
  }
  if (form.value.id != undefined) {
    await updateRoom(form.value)
    proxy.$modal.msgSuccess('修改成功')
  } else {
    await addRoom(form.value)
    proxy.$modal.msgSuccess('新增成功')
  }
  open.value = false
  getList()
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
    updateRoomStatus(row.id, status).then(() => {
      proxy.$modal.msgSuccess(`${label}成功`)
      getList()
    })
  }).catch(() => {})
}

function handleDelete(row) {
  proxy.$modal.confirm(`确认删除房型"${row.roomType}"？删除后不可恢复。`).then(() => {
    delRoom(row.id).then(() => {
      proxy.$modal.msgSuccess('删除成功')
      getList()
    })
  }).catch(() => {})
}

function showLowStock() {
  getLowStockRooms(5).then(res => {
    lowStockList.value = res.data || []
    lowStockOpen.value = true
  })
}

function handleStockFromAlert(row) {
  lowStockOpen.value = false
  handleStock(row)
}

loadHotelOptions()
getList()
</script>

<style scoped lang="scss">
.price-text {
  color: #e6a23c;
  font-weight: 600;
  font-size: 16px;
}

.empty-stock {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;

  p {
    margin-top: 12px;
    color: #67c23a;
    font-size: 16px;
  }
}

.stock-summary {
  margin-bottom: 10px;
}
</style>
