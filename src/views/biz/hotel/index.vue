<template>
  <div class="app-container">
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增酒店</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="hotelList" @row-click="onRowClick" style="cursor: pointer">
      <el-table-column label="ID" align="center" prop="id" width="60" />
      <el-table-column label="酒店图片" align="center" prop="imgUrl" width="100">
        <template #default="scope">
          <span @click.stop>
            <el-image v-if="scope.row.imgUrl" :src="scope.row.imgUrl" style="width: 60px; height: 45px; border-radius: 4px" fit="cover" :preview-src-list="[scope.row.imgUrl]" preview-teleported />
            <span v-else style="color: #ccc">无图片</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="酒店名称" align="center" prop="name" :show-overflow-tooltip="true" min-width="140" />
      <el-table-column label="地址" align="center" prop="address" :show-overflow-tooltip="true" min-width="160" />
      <el-table-column label="设施" align="center" prop="facility" :show-overflow-tooltip="true" min-width="140" />
      <el-table-column label="星级" align="center" prop="star" width="100">
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
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="150">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="280" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click.stop="handleDetail(scope.row)">详情</el-button>
          <el-button link type="primary" icon="Edit" @click.stop="handleUpdate(scope.row)">编辑</el-button>
          <el-button link type="success" icon="OfficeBuilding" @click.stop="handleRoomManage(scope.row)">房型</el-button>
          <el-button v-if="scope.row.status === '0' || scope.row.status === '3'" link type="primary" icon="Upload" @click.stop="handleSubmitAudit(scope.row)">上架</el-button>
          <el-button v-if="scope.row.status === '0'" link type="warning" icon="VideoPause" @click.stop="handleStatusChange(scope.row, '3')">下架</el-button>
          <el-button link type="danger" icon="Delete" @click.stop="handleDelete(scope.row)">删除</el-button>
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
    <el-dialog title="酒店详情" v-model="detailOpen" width="650px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="酒店ID">{{ detailForm.id }}</el-descriptions-item>
        <el-descriptions-item label="酒店名称">{{ detailForm.name }}</el-descriptions-item>
        <el-descriptions-item label="星级">
          <el-rate :model-value="detailForm.star || 0" disabled size="small" />
        </el-descriptions-item>
        <el-descriptions-item label="评分">{{ detailForm.score || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="酒店地址" :span="2">{{ detailForm.address }}</el-descriptions-item>
        <el-descriptions-item label="设施" :span="2">{{ detailForm.facility || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="图片" :span="2">
          <el-image v-if="detailForm.imgUrl" :src="detailForm.imgUrl" style="width: 200px; height: 120px; border-radius: 6px" fit="cover" :preview-src-list="[detailForm.imgUrl]" preview-teleported />
          <span v-else>无图片</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(detailForm.status)">{{ getStatusLabel(detailForm.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(detailForm.createTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup name="BizHotel">
import { listHotel, getHotel, addHotel, updateHotel, delHotel, updateHotelStatus, submitHotelAudit } from '@/api/biz/hotel'
import { useRouter } from 'vue-router'

const { proxy } = getCurrentInstance()
const router = useRouter()

const hotelList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const open = ref(false)
const detailOpen = ref(false)
const title = ref('')
const imageUploadRef = ref(null)

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  address: undefined,
  star: undefined,
  status: undefined
})

const form = ref({
  id: undefined,
  name: '',
  address: '',
  star: 3,
  imgUrl: '',
  facility: ''
})

const detailForm = ref({})

const rules = {
  name: [{ required: true, message: '酒店名称不能为空', trigger: 'blur' }],
  address: [{ required: true, message: '酒店地址不能为空', trigger: 'blur' }]
}

function getStatusType(status) {
  const map = { '0': 'success', '1': 'info', '2': 'warning', '3': 'danger', '4': '' }
  return map[status] || 'info'
}

function getStatusLabel(status) {
  const map = { '0': '营业中', '1': '草稿', '2': '待审核', '3': '已下架', '4': '已冻结' }
  return map[status] || '未知'
}

function onRowClick(row) {
  handleDetail(row)
}

function reset() {
  form.value = {
    id: undefined,
    name: '',
    address: '',
    star: 3,
    imgUrl: '',
    facility: ''
  }
  proxy.resetForm('hotelRef')
}

function cancel() {
  open.value = false
  reset()
}

/** 查询酒店列表（后端自动过滤，只返回商户自己的酒店） */
function getList(paginationParams) {
  if (paginationParams) {
    queryParams.value.pageNum = paginationParams.page
    queryParams.value.pageSize = paginationParams.limit
  }
  loading.value = true
  listHotel(queryParams.value).then(response => {
    const list = response.data?.list || response.data?.rows || response.rows || []
    hotelList.value = list
    total.value = response.data?.total || response.total || list.length
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
  title.value = '新增酒店'
}

function handleDetail(row) {
  getHotel(row.id).then(response => {
    detailForm.value = response.data || response
    detailOpen.value = true
  })
}

function handleUpdate(row) {
  reset()
  getHotel(row.id).then(response => {
    form.value = response.data || response
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

function handleSubmitAudit(row) {
  proxy.$modal.confirm(`确认提交酒店"${row.name}"的上架申请？`).then(() => {
    return submitHotelAudit(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess('上架申请已提交')
    getList()
  }).catch(() => {})
}

function handleStatusChange(row, status) {
  const label = status === '0' ? '上架' : '下架'
  proxy.$modal.confirm(`确认${label}酒店"${row.name}"？`).then(() => {
    return updateHotelStatus(row.id, status)
  }).then(() => {
    proxy.$modal.msgSuccess(`${label}成功`)
    getList()
  }).catch(() => {})
}

function handleDelete(row) {
  proxy.$modal.confirm(`确认删除酒店"${row.name}"？删除后不可恢复。`).then(() => {
    return delHotel(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess('删除成功')
    getList()
  }).catch(() => {})
}

function handleRoomManage(row) {
  router.push({ path: '/biz/room', query: { hotelId: row.id, hotelName: row.name } })
}

getList()
</script>

<style scoped lang="scss">
.score-text {
  color: #e6a23c;
  font-weight: 600;
}
</style>
