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
            <el-form-item label="图片URL" prop="imgUrl">
              <el-input v-model="form.imgUrl" placeholder="请输入酒店图片URL" />
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

// ========== Mock 数据 ==========
const mockHotels = [
  { id: 1, name: '北京国际大酒店', address: '北京市朝阳区建国路88号', star: 5, score: 4.8, imgUrl: 'https://picsum.photos/seed/hotel1/400/300', facility: '免费WiFi, 停车场, 游泳池, 健身中心, 行李寄存', businessId: 101, merchantName: '华住集团', roomCount: 120, status: '0', createTime: '2026-01-15 10:30:00' },
  { id: 2, name: '上海外滩精品酒店', address: '上海市黄浦区中山东一路20号', star: 4, score: 4.5, imgUrl: 'https://picsum.photos/seed/hotel2/400/300', facility: '免费WiFi, 餐厅, 酒吧, 会议室', businessId: 102, merchantName: '锦江酒店', roomCount: 86, status: '0', createTime: '2026-02-20 14:00:00' },
  { id: 3, name: '广州白云温泉度假村', address: '广州市白云区温泉大道168号', star: 5, score: 4.9, imgUrl: 'https://picsum.photos/seed/hotel3/400/300', facility: '温泉, 免费WiFi, 停车场, SPA, 儿童乐园', businessId: 103, merchantName: '岭南集团', roomCount: 200, status: '0', createTime: '2026-03-05 09:15:00' },
  { id: 4, name: '深圳科技主题酒店', address: '深圳市南山区科技园南路10号', star: 3, score: 4.2, imgUrl: 'https://picsum.photos/seed/hotel4/400/300', facility: '免费WiFi, 智能客房, 充电桩', businessId: 104, merchantName: '如家酒店', roomCount: 65, status: '1', createTime: '2026-03-18 16:45:00' },
  { id: 5, name: '杭州西湖畔民宿', address: '杭州市西湖区北山路58号', star: 4, score: 4.7, imgUrl: 'https://picsum.photos/seed/hotel5/400/300', facility: '免费WiFi, 茶室, 自行车租赁, 观景台', businessId: 105, merchantName: '绿城集团', roomCount: 32, status: '0', createTime: '2026-04-02 11:20:00' },
  { id: 6, name: '成都熊猫主题客栈', address: '成都市武侯区锦里古街15号', star: 3, score: 4.3, imgUrl: 'https://picsum.photos/seed/hotel6/400/300', facility: '免费WiFi, 餐厅, 熊猫主题房', businessId: 106, merchantName: '蜀汉文旅', roomCount: 45, status: '2', createTime: '2026-04-10 08:30:00' },
  { id: 7, name: '西安古城墙酒店', address: '西安市碑林区南门内大街100号', star: 4, score: 4.4, imgUrl: 'https://picsum.photos/seed/hotel7/400/300', facility: '免费WiFi, 停车场, 餐厅, 古风体验', businessId: 107, merchantName: '陕旅集团', roomCount: 78, status: '3', createTime: '2026-04-25 13:00:00' },
  { id: 8, name: '三亚海景度假酒店', address: '三亚市亚龙湾国家旅游度假区', star: 5, score: 4.9, imgUrl: 'https://picsum.photos/seed/hotel8/400/300', facility: '私人沙滩, 免费WiFi, 无边泳池, SPA, 潜水中心', businessId: 108, merchantName: '海航酒店', roomCount: 300, status: '0', createTime: '2026-05-01 10:00:00' },
  { id: 9, name: '厦门鼓浪屿别墅酒店', address: '厦门市思明区鼓浪屿安海路35号', star: 4, score: 4.6, imgUrl: 'https://picsum.photos/seed/hotel9/400/300', facility: '免费WiFi, 花园, 图书馆, 海景阳台', businessId: 109, merchantName: '建发旅游', roomCount: 28, status: '0', createTime: '2026-05-12 15:30:00' },
  { id: 10, name: '重庆洪崖洞江景酒店', address: '重庆市渝中区嘉陵江滨江路88号', star: 3, score: 4.1, imgUrl: 'https://picsum.photos/seed/hotel10/400/300', facility: '免费WiFi, 江景房, 餐厅, 行李寄存', businessId: 110, merchantName: '渝中文旅', roomCount: 55, status: '4', createTime: '2026-05-20 09:00:00' },
  { id: 11, name: '苏州园林精品客栈', address: '苏州市姑苏区平江路120号', star: 4, score: 4.5, imgUrl: 'https://picsum.photos/seed/hotel11/400/300', facility: '免费WiFi, 园林庭院, 茶艺表演, 汉服体验', businessId: 111, merchantName: '苏旅集团', roomCount: 22, status: '0', createTime: '2026-05-28 14:15:00' },
  { id: 12, name: '哈尔滨冰雪主题酒店', address: '哈尔滨市道里区中央大街50号', star: 3, score: 4.0, imgUrl: 'https://picsum.photos/seed/hotel12/400/300', facility: '免费WiFi, 暖气, 冰雕展览, 滑雪场接驳', businessId: 112, merchantName: '龙江旅投', roomCount: 48, status: '0', createTime: '2026-06-05 11:45:00' }
]

// 客户端分页
let allFilteredData = []

function getList() {
  loading.value = true
  setTimeout(() => {
    let data = [...mockHotels]
    if (queryParams.value.name) {
      data = data.filter(h => h.name.includes(queryParams.value.name))
    }
    if (queryParams.value.address) {
      data = data.filter(h => h.address.includes(queryParams.value.address))
    }
    if (queryParams.value.star) {
      data = data.filter(h => h.star === queryParams.value.star)
    }
    if (queryParams.value.status !== undefined && queryParams.value.status !== '') {
      data = data.filter(h => h.status === queryParams.value.status)
    }
    allFilteredData = data
    total.value = data.length
    const start = (queryParams.value.pageNum - 1) * queryParams.value.pageSize
    hotelList.value = data.slice(start, start + queryParams.value.pageSize)
    loading.value = false
  }, 300)
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
  detailForm.value = { ...row }
  detailOpen.value = true
}

function handleUpdate(row) {
  reset()
  form.value = { ...row }
  open.value = true
  title.value = '编辑酒店'
}

function submitForm() {
  proxy.$refs['hotelRef'].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        // 编辑 - 更新本地数据
        const idx = mockHotels.findIndex(h => h.id === form.value.id)
        if (idx !== -1) {
          Object.assign(mockHotels[idx], form.value)
        }
        proxy.$modal.msgSuccess('修改成功')
      } else {
        // 新增 - 添加到本地数据
        const newId = Math.max(...mockHotels.map(h => h.id)) + 1
        mockHotels.push({
          ...form.value,
          id: newId,
          merchantName: '未分配',
          roomCount: 0,
          status: '1',
          createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
        })
        proxy.$modal.msgSuccess('新增成功')
      }
      open.value = false
      getList()
    }
  })
}

function handleStatusChange(row, status) {
  const label = status === '0' ? '上架' : '下架'
  proxy.$modal.confirm(`确认${label}酒店"${row.name}"？`).then(() => {
    row.status = status
    proxy.$modal.msgSuccess(`${label}成功`)
    getList()
  }).catch(() => {})
}

function handleDelete(row) {
  proxy.$modal.confirm(`确认删除酒店"${row.name}"？删除后不可恢复。`).then(() => {
    const idx = mockHotels.findIndex(h => h.id === row.id)
    if (idx !== -1) mockHotels.splice(idx, 1)
    proxy.$modal.msgSuccess('删除成功')
    getList()
  }).catch(() => {})
}

function handleBatchDelete() {
  proxy.$modal.confirm(`确认批量删除选中的 ${ids.value.length} 个酒店？`).then(() => {
    ids.value.forEach(id => {
      const idx = mockHotels.findIndex(h => h.id === id)
      if (idx !== -1) mockHotels.splice(idx, 1)
    })
    proxy.$modal.msgSuccess('批量删除成功')
    ids.value = []
    getList()
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
