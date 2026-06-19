<template>
  <div class="app-container merchant-center">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Edit" @click="handleEdit" v-if="merchantInfo">编辑信息</el-button>
      </el-col>
    </el-row>

    <!-- 加载中 -->
    <el-skeleton v-if="loading" :rows="8" animated />

    <!-- 未找到商户信息 -->
    <el-empty v-else-if="!merchantInfo" description="未找到关联的商户信息">
      <el-button type="primary" @click="goToRegister">去注册商户</el-button>
    </el-empty>

    <!-- 商户详情卡片 -->
    <template v-else>
      <!-- 状态提示 -->
      <el-alert v-if="merchantInfo.auditStatus === '0'" title="您的商户信息正在审核中，审核通过后方可使用全部功能" type="warning" show-icon :closable="false" class="mb20" />
      <el-alert v-if="merchantInfo.auditStatus === '2'" :title="'您的商户信息审核未通过，驳回原因：' + (merchantInfo.rejectReason || '未知')" type="error" show-icon :closable="false" class="mb20">
        <template #default>
          <el-button type="warning" size="small" @click="handleEdit" style="margin-left: 16px">重新提交</el-button>
        </template>
      </el-alert>

      <el-descriptions :column="2" border size="large" title="商户信息">
        <el-descriptions-item label="商户ID">{{ merchantInfo.id }}</el-descriptions-item>
        <el-descriptions-item label="商户状态">
          <el-tag :type="getStatusType(merchantInfo.status)">
            {{ getStatusLabel(merchantInfo.status) }}
          </el-tag>
          <el-tag :type="getAuditStatusType(merchantInfo.auditStatus)" style="margin-left: 8px">
            {{ getAuditStatusLabel(merchantInfo.auditStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="商户名称">{{ merchantInfo.merchantName }}</el-descriptions-item>
        <el-descriptions-item label="营业执照号">{{ merchantInfo.licenseNo }}</el-descriptions-item>
        <el-descriptions-item label="法人姓名">{{ merchantInfo.legalPerson }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ merchantInfo.phone || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ merchantInfo.email || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="商户地址" :span="2">{{ merchantInfo.address || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="经营范围" :span="2">{{ merchantInfo.businessScope || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="商户简介" :span="2">{{ merchantInfo.description || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="LOGO" :span="2">
          <el-image
            v-if="merchantInfo.logoUrl"
            :src="merchantInfo.logoUrl"
            style="width: 100px; height: 100px"
            fit="cover"
            :preview-src-list="[merchantInfo.logoUrl]"
            preview-teleported
          />
          <span v-else style="color: #c0c4cc">未上传</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(merchantInfo.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{ parseTime(merchantInfo.updateTime) }}</el-descriptions-item>
      </el-descriptions>
    </template>

    <!-- 编辑商户信息对话框 -->
    <el-dialog :title="dialogTitle" v-model="editOpen" width="800px" append-to-body>
      <el-form ref="merchantRef" :model="editForm" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="商户名称" prop="merchantName">
              <el-input v-model="editForm.merchantName" placeholder="请输入商户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="营业执照号" prop="licenseNo">
              <el-input v-model="editForm.licenseNo" placeholder="请输入营业执照号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="法人姓名" prop="legalPerson">
              <el-input v-model="editForm.legalPerson" placeholder="请输入法人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="editForm.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商户地址" prop="address">
              <el-input v-model="editForm.address" placeholder="请输入商户地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="经营范围" prop="businessScope">
              <el-input v-model="editForm.businessScope" type="textarea" placeholder="请输入经营范围" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="LOGO图片" prop="logoUrl">
              <el-input v-model="editForm.logoUrl" placeholder="请输入LOGO图片URL" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="商户简介" prop="description">
              <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入商户简介" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitEdit" :loading="submitting">确 定</el-button>
          <el-button @click="editOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MerchantCenter">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyMerchant, updateMerchant } from '@/api/biz/merchant'

const { proxy } = getCurrentInstance()
const router = useRouter()

const loading = ref(true)
const editOpen = ref(false)
const submitting = ref(false)
const dialogTitle = ref('编辑商户信息')
const merchantInfo = ref(null)

const editForm = ref({
  id: undefined,
  merchantName: '',
  licenseNo: '',
  legalPerson: '',
  phone: '',
  email: '',
  address: '',
  businessScope: '',
  logoUrl: '',
  description: '',
  userId: undefined
})

const validatePhone = (rule, value, callback) => {
  if (value && !/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('手机号格式不正确'))
  } else {
    callback()
  }
}

const rules = {
  merchantName: [{ required: true, message: '商户名称不能为空', trigger: 'blur' }],
  licenseNo: [{ required: true, message: '营业执照号不能为空', trigger: 'blur' }],
  legalPerson: [{ required: true, message: '法人姓名不能为空', trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }]
}

function getStatusType(status) {
  if (status === '0') return 'success'
  if (status === '1') return 'warning'
  if (status === '2') return 'danger'
  return 'info'
}

function getStatusLabel(status) {
  if (status === '0') return '正常'
  if (status === '1') return '冻结'
  if (status === '2') return '注销'
  return '未知'
}

function getAuditStatusType(auditStatus) {
  if (auditStatus === '0') return 'warning'
  if (auditStatus === '1') return 'success'
  if (auditStatus === '2') return 'danger'
  return 'info'
}

function getAuditStatusLabel(auditStatus) {
  if (auditStatus === '0') return '待审核'
  if (auditStatus === '1') return '审核通过'
  if (auditStatus === '2') return '审核驳回'
  return '未知'
}

function goToRegister() {
  router.push('/merchant/register')
}

/** 加载当前商户信息 */
async function loadMerchantInfo() {
  loading.value = true
  try {
    const res = await getMyMerchant()
    if (res.code === 200 && res.data) {
      merchantInfo.value = res.data
    } else {
      merchantInfo.value = null
    }
  } catch {
    merchantInfo.value = null
  } finally {
    loading.value = false
  }
}

/** 打开编辑对话框 */
function handleEdit() {
  editForm.value = {
    id: merchantInfo.value.id,
    merchantName: merchantInfo.value.merchantName || '',
    licenseNo: merchantInfo.value.licenseNo || '',
    legalPerson: merchantInfo.value.legalPerson || '',
    phone: merchantInfo.value.phone || '',
    email: merchantInfo.value.email || '',
    address: merchantInfo.value.address || '',
    businessScope: merchantInfo.value.businessScope || '',
    logoUrl: merchantInfo.value.logoUrl || '',
    description: merchantInfo.value.description || '',
    userId: merchantInfo.value.userId
  }
  editOpen.value = true
}

/** 提交编辑 */
function submitEdit() {
  proxy.$refs['merchantRef'].validate(valid => {
    if (valid) {
      submitting.value = true
      updateMerchant(editForm.value).then(() => {
        proxy.$modal.msgSuccess('修改成功')
        editOpen.value = false
        loadMerchantInfo()
      }).finally(() => {
        submitting.value = false
      })
    }
  })
}

onMounted(() => {
  loadMerchantInfo()
})
</script>

<style scoped lang="scss">
.merchant-center {
  .mb20 {
    margin-bottom: 20px;
  }

  :deep(.el-descriptions__title) {
    font-size: 16px;
    font-weight: 600;
  }
}
</style>
