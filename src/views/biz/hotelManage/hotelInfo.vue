<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="酒店名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入酒店名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="酒店地址" prop="address">
        <el-input v-model="queryParams.address" placeholder="请输入酒店地址" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="酒店星级" prop="star">
        <el-select v-model="queryParams.star" placeholder="请选择星级" clearable>
          <el-option label="一星" :value="1" />
          <el-option label="二星" :value="2" />
          <el-option label="三星" :value="3" />
          <el-option label="四星" :value="4" />
          <el-option label="五星" :value="5" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="营业中" value="0" />
          <el-option label="草稿" value="1" />
          <el-option label="待审核" value="2" />
          <el-option label="已下架" value="3" />
          <el-option label="已冻结" value="4" />
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
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增酒店</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="!ids.length" @click="handleBatchDelete">批量删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="hotelList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="60" />
      <el-table-column label="酒店图片" align="center" prop="imgUrl" width="100">
        <template #default="scope">
          <el-image v-if="scope.row.imgUrl" :src="scope.row.imgUrl" style="width: 60px; height: 45px; border-radius: 4px" fit="cover" :preview-src-list="[scope.row.imgUrl]" preview-teleported />
          <span v-else style="color: #ccc">无图片</span>
        </template>
      </el-table-column>
      <el-table-column label="酒店名称" align="center" prop="name" :show-overflow-tooltip="true" min-width="140" />
      <el-table-column label="地址" align="center" prop="address" :show-overflow-tooltip="true" min-width="160" />
      <el-table-column label="商户" align="center" prop="merchantName" width="100" />
      <el-table-column label="房间数" align="center" prop="roomCount" width="80" />
      <el-table-column label="星级" align="center" prop="star" width="120">
        <template #default="scope">
          <el-rate :model-value="scope.row.star || 0" disabled size="small" />
        </template>
      </el-table-column>
      <el-table-column label="评分" align="center" prop="score" width="80">
        <template #default="scope">
          <span v-if="scope.row.score" class="score-text">{{ scope.row.score }}</span>
          <span v-else style="color: #ccc">暂无</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="90">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">{{ getStatusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160" />
      <el-table-column label="操作" align="center" width="220" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleDetail(scope.row)">详情</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button v-if="scope.row.status !== '0'" link type="success" icon="VideoPlay" @click="handleStatusChange(scope.row, '0')">上架</el-button>
          <el-button v-if="scope.row.status === '0'" link type="warning" icon="VideoPause" @click="handleStatusChange(scope.row, '3')">下架</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="title" v-model="open" width="650px" append-to-body>
      <el-form ref="hotelRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="14">
            <el-form-item label="酒店名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入酒店名称" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="酒店星级" prop="star">
              <el-rate v-model="form.star" :max="5" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="酒店地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入酒店地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商户ID" prop="businessId">
              <el-input v-model="form.businessId" placeholder="请输入商户ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="评分" prop="score">
              <el-input-number v-model="form.score" :min="0" :max="5" :precision="1" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="酒店图片" prop="imgUrl">
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
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="酒店设施" prop="facility">
              <el-input v-model="form.facility" type="textarea" :rows="3" placeholder="请输入酒店设施，如：免费WiFi、停车场、游泳池等" />
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

    <!-- 详情对话框 -->
    <el-dialog title="酒店详情" v-model="detailOpen" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="酒店ID">{{ detailForm.id }}</el-descriptions-item>
        <el-descriptions-item label="酒店名称">{{ detailForm.name }}</el-descriptions-item>
        <el-descriptions-item label="星级">
          <el-rate :model-value="detailForm.star || 0" disabled size="small" />
        </el-descriptions-item>
        <el-descriptions-item label="评分">{{ detailForm.score || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="商户名称">{{ detailForm.merchantName || '未知' }}</el-descriptions-item>
        <el-descriptions-item label="房间数">{{ detailForm.roomCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="酒店地址" :span="2">{{ detailForm.address }}</el-descriptions-item>
        <el-descriptions-item label="设施" :span="2">{{ detailForm.facility || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="图片" :span="2">
          <el-image v-if="detailForm.imgUrl" :src="detailForm.imgUrl" style="width: 200px; height: 120px; border-radius: 6px" fit="cover" :preview-src-list="[detailForm.imgUrl]" preview-teleported />
          <span v-else>无图片</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(detailForm.status)">{{ getStatusLabel(detailForm.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailForm.createTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup name="AdminHotelInfo">
import { ref, getCurrentInstance } from 'vue'
import { listHotel, getHotel, addHotel, updateHotel, delHotel, updateHotelStatus } from '@/api/biz/adminHotel'

const { proxy } = getCurrentInstance()

const hotelList = ref([])
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const open = ref(false)
const detailOpen = ref(false)
const title = ref('')
const ids = ref([])

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  address: undefined,
  star: undefined,
  status: undefined
})

const imageUploadRef = ref(null)

const form = ref({
  id: undefined,
  name: '',
  address: '',
  star: 3,
  score: 0,
  imgUrl: '',
  facility: '',
  businessId: undefined
})

const detailForm = ref({})

const rules = {
  name: [{ required: true, message: '酒店名称不能为空', trigger: 'blur' }],
  address: [{ required: true, message: '酒店地址不能为空', trigger: 'blur' }]
}

/** 查询酒店列表 */
function getList() {
  loading.value = true
  listHotel(queryParams.value).then(res => {
    const page = res.data || {}
    hotelList.value = page.rows || []
    total.value = page.total || 0
  }).finally(() => {
    loading.value = false
  })
}

function getStatusType(status) {
  const map = { '0': 'success', '1': 'info', '2': 'warning', '3': 'danger', '4': '' }
  return map[status] || 'info'
}

function getStatusLabel(status) {
  const map = { '0': '营业中', '1': '草稿', '2': '待审核', '3': '已下架', '4': '已冻结' }
  return map[status] || '未知'
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
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
    name: '',
    address: '',
    star: 3,
    score: 0,
    imgUrl: '',
    facility: '',
    businessId: undefined
  }
  proxy.resetForm('hotelRef')
}

function cancel() {
  open.value = false
  reset()
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '新增酒店'
}

function handleDetail(row) {
  getHotel(row.id).then(res => {
    detailForm.value = res.data || row
    detailOpen.value = true
  })
}

function handleUpdate(row) {
  reset()
  getHotel(row.id).then(res => {
    form.value = res.data || { ...row }
    open.value = true
    title.value = '编辑酒店'
  })
}

async function submitForm() {
  try {
    await proxy.$refs['hotelRef'].validate()
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
    await updateHotel(form.value)
    proxy.$modal.msgSuccess('修改成功')
  } else {
    await addHotel(form.value)
    proxy.$modal.msgSuccess('新增成功')
  }
  open.value = false
  getList()
}

function handleStatusChange(row, status) {
  const label = status === '0' ? '上架' : '下架'
  proxy.$modal.confirm(`确认${label}酒店"${row.name}"？`).then(() => {
    updateHotelStatus(row.id, status).then(() => {
      proxy.$modal.msgSuccess(`${label}成功`)
      getList()
    })
  }).catch(() => {})
}

function handleDelete(row) {
  proxy.$modal.confirm(`确认删除酒店"${row.name}"？删除后不可恢复。`).then(() => {
    delHotel(row.id).then(() => {
      proxy.$modal.msgSuccess('删除成功')
      getList()
    })
  }).catch(() => {})
}

function handleBatchDelete() {
  proxy.$modal.confirm(`确认批量删除选中的 ${ids.value.length} 个酒店？`).then(() => {
    // 逐个删除
    Promise.all(ids.value.map(id => delHotel(id))).then(() => {
      proxy.$modal.msgSuccess('批量删除成功')
      ids.value = []
      getList()
    })
  }).catch(() => {})
}

getList()
</script>

<style scoped lang="scss">
.score-text {
  color: #e6a23c;
  font-weight: 600;
}
</style>
