<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="酒店名称" prop="hotelName">
        <el-input v-model="queryParams.hotelName" placeholder="请输入酒店名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="审核状态" prop="auditStatus">
        <el-select v-model="queryParams.auditStatus" placeholder="请选择审核状态" clearable>
          <el-option label="待审核" value="0" />
          <el-option label="审核通过" value="1" />
          <el-option label="审核驳回" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="申请类型" prop="auditType">
        <el-select v-model="queryParams.auditType" placeholder="请选择申请类型" clearable>
          <el-option label="上架申请" value="1" />
          <el-option label="信息变更" value="2" />
          <el-option label="恢复营业" value="3" />
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
        <el-button type="warning" plain icon="Warning" @click="showPendingCount">
          待审核提醒
          <el-badge v-if="pendingCount > 0" :value="pendingCount" class="audit-badge" />
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="auditList">
      <el-table-column label="审核ID" align="center" prop="id" width="80" />
      <el-table-column label="酒店ID" align="center" prop="hotelId" width="80" />
      <el-table-column label="酒店图片" align="center" prop="imgUrl" width="100">
        <template #default="scope">
          <el-image v-if="scope.row.imgUrl" :src="scope.row.imgUrl" style="width: 60px; height: 45px; border-radius: 4px" fit="cover" :preview-src-list="[scope.row.imgUrl]" preview-teleported />
          <span v-else style="color: #ccc">无图片</span>
        </template>
      </el-table-column>
      <el-table-column label="酒店名称" align="center" prop="hotelName" :show-overflow-tooltip="true" min-width="150" />
      <el-table-column label="商户名称" align="center" prop="merchantName" width="120" />
      <el-table-column label="申请类型" align="center" prop="auditType" width="100">
        <template #default="scope">
          <el-tag :type="getAuditTypeTag(scope.row.auditType)">
            {{ getAuditTypeLabel(scope.row.auditType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" prop="auditStatus" width="100">
        <template #default="scope">
          <el-tag :type="getAuditStatusType(scope.row.auditStatus)">
            {{ getAuditStatusLabel(scope.row.auditStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申请说明" align="center" prop="submitReason" :show-overflow-tooltip="true" min-width="160" />
      <el-table-column label="审核人" align="center" prop="auditorName" width="100" />
      <el-table-column label="提交时间" align="center" prop="submitTime" width="160" />
      <el-table-column label="审核时间" align="center" prop="auditTime" width="160" />
      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)">详情</el-button>
          <el-button v-if="scope.row.auditStatus === '0'" link type="success" icon="Check" @click="handleAudit(scope.row, '1')">通过</el-button>
          <el-button v-if="scope.row.auditStatus === '0'" link type="danger" icon="Close" @click="handleAudit(scope.row, '2')">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 详情对话框 -->
    <el-dialog title="审核详情" v-model="viewOpen" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="审核ID">{{ viewForm.id }}</el-descriptions-item>
        <el-descriptions-item label="酒店ID">{{ viewForm.hotelId }}</el-descriptions-item>
        <el-descriptions-item label="酒店名称">{{ viewForm.hotelName }}</el-descriptions-item>
        <el-descriptions-item label="商户名称">{{ viewForm.merchantName }}</el-descriptions-item>
        <el-descriptions-item label="申请类型">
          <el-tag :type="getAuditTypeTag(viewForm.auditType)">{{ getAuditTypeLabel(viewForm.auditType) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="getAuditStatusType(viewForm.auditStatus)">{{ getAuditStatusLabel(viewForm.auditStatus) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="酒店地址" :span="2">{{ viewForm.address }}</el-descriptions-item>
        <el-descriptions-item label="酒店星级">
          <el-rate :model-value="viewForm.star || 0" disabled size="small" />
        </el-descriptions-item>
        <el-descriptions-item label="酒店评分">{{ viewForm.score || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="设施" :span="2">{{ viewForm.facility || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="申请说明" :span="2">{{ viewForm.submitReason || '无' }}</el-descriptions-item>
        <el-descriptions-item label="审核意见" :span="2">{{ viewForm.auditOpinion || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="审核人">{{ viewForm.auditorName || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ viewForm.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ viewForm.auditTime || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="酒店图片" :span="2">
          <el-image v-if="viewForm.imgUrl" :src="viewForm.imgUrl" style="width: 200px; height: 120px; border-radius: 6px" fit="cover" :preview-src-list="[viewForm.imgUrl]" preview-teleported />
          <span v-else>无图片</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 审核操作对话框 -->
    <el-dialog :title="auditTitle" v-model="auditOpen" width="500px" append-to-body>
      <el-form ref="auditRef" :model="auditForm" :rules="auditRules" label-width="80px">
        <el-form-item label="酒店名称">
          <el-input :model-value="currentAudit.hotelName" disabled />
        </el-form-item>
        <el-form-item label="商户名称">
          <el-input :model-value="currentAudit.merchantName" disabled />
        </el-form-item>
        <el-form-item label="申请类型">
          <el-tag :type="getAuditTypeTag(currentAudit.auditType)">
            {{ getAuditTypeLabel(currentAudit.auditType) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="申请说明">
          <el-input :model-value="currentAudit.submitReason" disabled type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="审核意见" prop="auditOpinion">
          <el-input v-model="auditForm.auditOpinion" type="textarea" :rows="3" placeholder="请输入审核意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAudit">确 定</el-button>
          <el-button @click="auditOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="AdminHotelAudit">
import { ref, computed, getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()

const auditList = ref([])
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const viewOpen = ref(false)
const auditOpen = ref(false)
const auditTitle = ref('')
const viewForm = ref({})
const currentAudit = ref({})

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  hotelName: undefined,
  auditStatus: undefined,
  auditType: undefined
})

const auditForm = ref({
  id: undefined,
  hotelId: undefined,
  auditType: undefined,
  auditStatus: undefined,
  auditOpinion: ''
})

const auditRules = {
  auditOpinion: [{ required: true, message: '审核意见不能为空', trigger: 'blur' }]
}

// ========== Mock 数据 ==========
const mockAuditList = [
  { id: 1001, hotelId: 6, hotelName: '成都熊猫主题客栈', merchantName: '蜀汉文旅', auditType: '1', auditStatus: '0', submitReason: '酒店信息已完善，申请上架营业', auditOpinion: '', auditorName: '', submitTime: '2026-06-20 09:00:00', auditTime: '', address: '成都市武侯区锦里古街15号', star: 3, score: 4.3, imgUrl: 'https://picsum.photos/seed/hotel6/400/300', facility: '免费WiFi, 餐厅, 熊猫主题房' },
  { id: 1002, hotelId: 13, hotelName: '青岛海景花园酒店', merchantName: '青旅集团', auditType: '1', auditStatus: '0', submitReason: '新入驻商户，申请酒店上架', auditOpinion: '', auditorName: '', submitTime: '2026-06-21 14:30:00', auditTime: '', address: '青岛市市南区东海西路50号', star: 4, score: 0, imgUrl: 'https://picsum.photos/seed/hotel13/400/300', facility: '免费WiFi, 海景房, 停车场' },
  { id: 1003, hotelId: 14, hotelName: '大理古城精品客栈', merchantName: '滇西文旅', auditType: '1', auditStatus: '0', submitReason: '新店开业，申请上架大理古城特色客栈', auditOpinion: '', auditorName: '', submitTime: '2026-06-22 10:15:00', auditTime: '', address: '大理市古城区人民路120号', star: 3, score: 0, imgUrl: 'https://picsum.photos/seed/hotel14/400/300', facility: '免费WiFi, 花园, 观景台' },
  { id: 1004, hotelId: 2, hotelName: '上海外滩精品酒店', merchantName: '锦江酒店', auditType: '2', auditStatus: '0', submitReason: '酒店设施升级，新增SPA中心和行政酒廊，申请信息变更', auditOpinion: '', auditorName: '', submitTime: '2026-06-22 16:00:00', auditTime: '', address: '上海市黄浦区中山东一路20号', star: 4, score: 4.5, imgUrl: 'https://picsum.photos/seed/hotel2/400/300', facility: '免费WiFi, 餐厅, 酒吧, 会议室, SPA, 行政酒廊' },
  { id: 1005, hotelId: 7, hotelName: '西安古城墙酒店', merchantName: '陕旅集团', auditType: '3', auditStatus: '0', submitReason: '酒店已完成装修整改，申请恢复营业', auditOpinion: '', auditorName: '', submitTime: '2026-06-23 08:30:00', auditTime: '', address: '西安市碑林区南门内大街100号', star: 4, score: 4.4, imgUrl: 'https://picsum.photos/seed/hotel7/400/300', facility: '免费WiFi, 停车场, 餐厅, 古风体验' },
  { id: 1006, hotelId: 1, hotelName: '北京国际大酒店', merchantName: '华住集团', auditType: '1', auditStatus: '1', submitReason: '年度审核通过，继续上架营业', auditOpinion: '酒店各项指标达标，审核通过，准予继续营业。', auditorName: '管理员', submitTime: '2026-06-10 09:00:00', auditTime: '2026-06-11 10:30:00', address: '北京市朝阳区建国路88号', star: 5, score: 4.8, imgUrl: 'https://picsum.photos/seed/hotel1/400/300', facility: '免费WiFi, 停车场, 游泳池, 健身中心, 行李寄存' },
  { id: 1007, hotelId: 15, hotelName: '长沙网红民宿', merchantName: '湘旅文化', auditType: '1', auditStatus: '2', submitReason: '新店申请上架', auditOpinion: '消防验收材料不齐全，请补充后重新提交。', auditorName: '管理员', submitTime: '2026-06-08 11:00:00', auditTime: '2026-06-09 14:00:00', address: '长沙市天心区坡子街10号', star: 2, score: 0, imgUrl: 'https://picsum.photos/seed/hotel15/400/300', facility: '免费WiFi' },
  { id: 1008, hotelId: 5, hotelName: '杭州西湖畔民宿', merchantName: '绿城集团', auditType: '2', auditStatus: '1', submitReason: '新增庭院房型，更新酒店设施信息', auditOpinion: '信息变更合理，审核通过。', auditorName: '管理员', submitTime: '2026-06-05 15:00:00', auditTime: '2026-06-06 09:30:00', address: '杭州市西湖区北山路58号', star: 4, score: 4.7, imgUrl: 'https://picsum.photos/seed/hotel5/400/300', facility: '免费WiFi, 茶室, 自行车租赁, 观景台, 庭院' },
  { id: 1009, hotelId: 16, hotelName: '丽江古城花间堂', merchantName: '云上旅投', auditType: '1', auditStatus: '2', submitReason: '申请上架丽江古城特色客栈', auditOpinion: '客栈实际面积与申报不符，需现场核查后重新提交。', auditorName: '管理员', submitTime: '2026-06-01 10:00:00', auditTime: '2026-06-03 16:00:00', address: '丽江市古城区五一街王家庄巷7号', star: 4, score: 0, imgUrl: 'https://picsum.photos/seed/hotel16/400/300', facility: '免费WiFi, 纳西庭院, 茶室' },
  { id: 1010, hotelId: 10, hotelName: '重庆洪崖洞江景酒店', merchantName: '渝中文旅', auditType: '3', auditStatus: '1', submitReason: '酒店已通过消防安全复检，申请恢复营业', auditOpinion: '消防复检合格，准予恢复营业。', auditorName: '管理员', submitTime: '2026-05-28 09:00:00', auditTime: '2026-05-30 11:00:00', address: '重庆市渝中区嘉陵江滨江路88号', star: 3, score: 4.1, imgUrl: 'https://picsum.photos/seed/hotel10/400/300', facility: '免费WiFi, 江景房, 餐厅, 行李寄存' }
]

const pendingCount = computed(() => mockAuditList.filter(a => a.auditStatus === '0').length)

function getList() {
  loading.value = true
  setTimeout(() => {
    let data = [...mockAuditList]
    if (queryParams.value.hotelName) {
      data = data.filter(a => a.hotelName.includes(queryParams.value.hotelName))
    }
    if (queryParams.value.auditStatus !== undefined && queryParams.value.auditStatus !== '') {
      data = data.filter(a => a.auditStatus === queryParams.value.auditStatus)
    }
    if (queryParams.value.auditType !== undefined && queryParams.value.auditType !== '') {
      data = data.filter(a => a.auditType === queryParams.value.auditType)
    }
    total.value = data.length
    const start = (queryParams.value.pageNum - 1) * queryParams.value.pageSize
    auditList.value = data.slice(start, start + queryParams.value.pageSize)
    loading.value = false
  }, 300)
}

function getAuditTypeTag(type) {
  const map = { '1': 'primary', '2': 'warning', '3': 'info' }
  return map[type] || ''
}

function getAuditTypeLabel(type) {
  const map = { '1': '上架申请', '2': '信息变更', '3': '恢复营业' }
  return map[type] || '未知'
}

function getAuditStatusType(status) {
  const map = { '0': 'warning', '1': 'success', '2': 'danger' }
  return map[status] || 'info'
}

function getAuditStatusLabel(status) {
  const map = { '0': '待审核', '1': '审核通过', '2': '审核驳回' }
  return map[status] || '未知'
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

function handleView(row) {
  viewForm.value = { ...row }
  viewOpen.value = true
}

function handleAudit(row, status) {
  currentAudit.value = row
  auditForm.value = {
    id: row.id,
    hotelId: row.hotelId,
    auditType: row.auditType,
    auditStatus: status,
    auditOpinion: ''
  }
  auditTitle.value = status === '1' ? '审核通过' : '审核驳回'
  auditOpen.value = true
}

function submitAudit() {
  proxy.$refs['auditRef'].validate(valid => {
    if (valid) {
      const idx = mockAuditList.findIndex(a => a.id === auditForm.value.id)
      if (idx !== -1) {
        mockAuditList[idx].auditStatus = auditForm.value.auditStatus
        mockAuditList[idx].auditOpinion = auditForm.value.auditOpinion
        mockAuditList[idx].auditorName = '管理员'
        mockAuditList[idx].auditTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      }
      proxy.$modal.msgSuccess(auditForm.value.auditStatus === '1' ? '审核通过成功' : '审核驳回成功')
      auditOpen.value = false
      getList()
    }
  })
}

function showPendingCount() {
  if (pendingCount.value === 0) {
    proxy.$modal.alert('暂无待审核的酒店申请', '审核提醒', { type: 'success' })
  } else {
    const pendingList = mockAuditList.filter(a => a.auditStatus === '0')
    const names = pendingList.map(a => `"${a.hotelName}"（${getAuditTypeLabel(a.auditType)}）`).join('<br/>')
    proxy.$modal.alert(`当前有 <b>${pendingCount.value}</b> 条待审核申请：<br/>${names}`, '审核提醒', {
      dangerouslyUseHTMLString: true,
      type: 'warning'
    })
  }
}

getList()
</script>

<style scoped lang="scss">
.audit-badge {
  margin-left: 4px;
}
</style>
