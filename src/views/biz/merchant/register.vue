<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <h2>商户入驻申请</h2>
      </template>
      <el-form :model="form" ref="formRef" :rules="rules" label-width="100px" size="default">
        <el-form-item label="商户名称" prop="merchantName">
          <el-input v-model="form.merchantName" placeholder="请输入商户名称" />
        </el-form-item>
        <el-form-item label="营业执照号" prop="licenseNo">
          <el-input v-model="form.licenseNo" placeholder="请输入营业执照号" />
        </el-form-item>
        <el-form-item label="法人姓名" prop="legalPerson">
          <el-input v-model="form.legalPerson" placeholder="请输入法人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="商户地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入商户地址" />
        </el-form-item>
        <el-form-item label="经营范围" prop="businessScope">
          <el-input v-model="form.businessScope" type="textarea" :rows="3" placeholder="请输入经营范围" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">提交申请</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'

const { proxy } = getCurrentInstance()
const router = useRouter()

const loading = ref(false)
const formRef = ref(null)

const form = reactive({
  merchantName: '',
  licenseNo: '',
  legalPerson: '',
  phone: '',
  email: '',
  address: '',
  businessScope: ''
})

const rules = {
  merchantName: [{ required: true, message: '请输入商户名称', trigger: 'blur' }],
  licenseNo: [{ required: true, message: '请输入营业执照号', trigger: 'blur' }],
  legalPerson: [{ required: true, message: '请输入法人姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请输入商户地址', trigger: 'blur' }]
}

function handleSubmit() {
  formRef.value.validate(valid => {
    if (valid) {
      loading.value = true
      // TODO: 对接商户注册API
      proxy.$modal.msgSuccess('申请已提交，请等待审核')
      loading.value = false
      router.push('/index')
    }
  })
}

function handleReset() {
  formRef.value.resetFields()
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  min-height: 100vh;
  background: #f5f7fa;
}
.register-card {
  width: 600px;
}
.register-card h2 {
  margin: 0;
  text-align: center;
}
</style>

<template>
  <div class="merchant-register-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>商户信息登记</h2>
          <p class="subtitle">请完善您的商户信息，提交后将进行审核</p>
        </div>
      </template>

      <!-- 步骤条 -->
      <el-steps :active="currentStep" finish-status="success" align-center style="margin-bottom: 40px;">
        <el-step title="基本信息" description="填写商户基本资料" />
        <el-step title="资质证件" description="上传营业执照等信息" />
        <el-step title="联系方式" description="填写联系信息" />
        <el-step title="确认提交" description="核对信息并提交" />
      </el-steps>

      <!-- 表单区域 -->
      <el-form 
        ref="merchantFormRef" 
        :model="merchantForm" 
        :rules="rules" 
        label-width="120px"
        class="register-form"
      >
        <!-- 步骤1：基本信息 -->
        <div v-show="currentStep === 0" class="step-content">
          <h3 class="step-title">基本信息</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="商户名称" prop="merchantName">
                <el-input 
                  v-model="merchantForm.merchantName" 
                  placeholder="请输入商户/店铺名称"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商户地址" prop="address">
                <el-input 
                  v-model="merchantForm.address" 
                  placeholder="请输入商户地址"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="经营范围" prop="businessScope">
                <el-input 
                  v-model="merchantForm.businessScope" 
                  type="textarea" 
                  :rows="3"
                  placeholder="请输入经营范围，如：酒店管理、餐饮服务、旅游咨询等"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="商户简介" prop="description">
                <el-input 
                  v-model="merchantForm.description" 
                  type="textarea" 
                  :rows="4"
                  placeholder="请简要介绍您的商户信息（选填）"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="商户LOGO" prop="logoUrl">
                <el-input 
                  v-model="merchantForm.logoUrl" 
                  placeholder="请输入LOGO图片URL（选填）"
                  clearable
                />
                <div v-if="merchantForm.logoUrl" class="logo-preview">
                  <el-image 
                    :src="merchantForm.logoUrl" 
                    style="width: 80px; height: 80px"
                    fit="cover"
                  />
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 步骤2：资质证件 -->
        <div v-show="currentStep === 1" class="step-content">
          <h3 class="step-title">资质证件信息</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="营业执照号" prop="licenseNo">
                <el-input 
                  v-model="merchantForm.licenseNo" 
                  placeholder="请输入统一社会信用代码/营业执照号"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="法人姓名" prop="legalPerson">
                <el-input 
                  v-model="merchantForm.legalPerson" 
                  placeholder="请输入法定代表人姓名"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-alert
            title="提示：请确保填写的资质信息真实有效，后续将进行人工审核"
            type="info"
            :closable="false"
            style="margin-top: 20px;"
          />
        </div>

        <!-- 步骤3：联系方式 -->
        <div v-show="currentStep === 2" class="step-content">
          <h3 class="step-title">联系方式</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="联系电话" prop="phone">
                <el-input 
                  v-model="merchantForm.phone" 
                  placeholder="请输入联系人手机号"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input 
                  v-model="merchantForm.email" 
                  placeholder="请输入联系邮箱（选填）"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-alert
            title="提示：请填写有效的联系方式，便于我们与您取得联系"
            type="warning"
            :closable="false"
            style="margin-top: 20px;"
          />
        </div>

        <!-- 步骤4：确认提交 -->
        <div v-show="currentStep === 3" class="step-content">
          <h3 class="step-title">确认信息</h3>
          <p class="confirm-tip">请仔细核对以下信息，确认无误后点击提交按钮</p>
          
          <el-descriptions :column="2" border class="preview-descriptions">
            <el-descriptions-item label="商户名称">{{ merchantForm.merchantName }}</el-descriptions-item>
            <el-descriptions-item label="商户地址">{{ merchantForm.address }}</el-descriptions-item>
            <el-descriptions-item label="营业执照号">{{ merchantForm.licenseNo }}</el-descriptions-item>
            <el-descriptions-item label="法人姓名">{{ merchantForm.legalPerson }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ merchantForm.phone }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ merchantForm.email || '未填写' }}</el-descriptions-item>
            <el-descriptions-item label="经营范围" :span="2">{{ merchantForm.businessScope }}</el-descriptions-item>
            <el-descriptions-item label="商户简介" :span="2">{{ merchantForm.description || '未填写' }}</el-descriptions-item>
            <el-descriptions-item label="LOGO" :span="2">
              <el-image 
                v-if="merchantForm.logoUrl" 
                :src="merchantForm.logoUrl" 
                style="width: 60px; height: 60px"
                fit="cover"
              />
              <span v-else>未上传</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 操作按钮 -->
        <el-form-item class="form-actions">
          <el-button @click="handlePrevStep" v-if="currentStep > 0">上一步</el-button>
          <el-button type="primary" @click="handleNextStep" v-if="currentStep < 3">下一步</el-button>
          <el-button 
            type="success" 
            @click="submitForm" 
            v-if="currentStep === 3"
            :loading="submitting"
          >
            提交审核
          </el-button>
          <el-button @click="saveDraft">保存草稿</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup name="MerchantRegister">
import { addMerchant } from '@/api/biz/merchant'
import useUserStore from '@/store/modules/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const { proxy } = getCurrentInstance()

// 当前步骤
const currentStep = ref(0)

// 表单数据
const merchantForm = ref({
  merchantName: '',
  address: '',
  businessScope: '',
  description: '',
  logoUrl: '',
  licenseNo: '',
  legalPerson: '',
  phone: '',
  email: '',
  userId: null,
  status: '0' // 默认正常状态
})

// 表单验证规则
const rules = {
  merchantName: [
    { required: true, message: '请输入商户名称', trigger: 'blur' },
    { min: 2, max: 50, message: '商户名称长度必须介于 2 和 50 之间', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入商户地址', trigger: 'blur' }
  ],
  businessScope: [
    { required: true, message: '请输入经营范围', trigger: 'blur' }
  ],
  licenseNo: [
    { required: true, message: '请输入营业执照号', trigger: 'blur' },
    { pattern: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/, message: '统一社会信用代码格式不正确', trigger: 'blur' }
  ],
  legalPerson: [
    { required: true, message: '请输入法人姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

const merchantFormRef = ref(null)
const submitting = ref(false)

// 上一步
function handlePrevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 下一步
function handleNextStep() {
  // 验证当前步骤的字段
  const fieldsToValidate = getFieldsForStep(currentStep.value)
  
  merchantFormRef.value.validateField(fieldsToValidate, (valid) => {
    if (valid && currentStep.value < 3) {
      currentStep.value++
    }
  })
}

// 获取当前步骤需要验证的字段
function getFieldsForStep(step) {
  switch(step) {
    case 0:
      return ['merchantName', 'address', 'businessScope']
    case 1:
      return ['licenseNo', 'legalPerson']
    case 2:
      return ['phone']
    default:
      return []
  }
}

// 保存草稿
function saveDraft() {
  localStorage.setItem('merchantDraft', JSON.stringify(merchantForm.value))
  proxy.$modal.msgSuccess('草稿已保存')
}

// 加载草稿
function loadDraft() {
  const draft = localStorage.getItem('merchantDraft')
  if (draft) {
    try {
      const draftData = JSON.parse(draft)
      merchantForm.value = { ...merchantForm.value, ...draftData }
    } catch (e) {
      console.error('加载草稿失败:', e)
    }
  }
}

// 提交表单
function submitForm() {
  merchantFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      
      try {
        // ✅ 移除前端设置userId的代码，由后端自动从SecurityContext获取
        
        // 调用API提交
        await addMerchant(merchantForm.value)
        
        proxy.$modal.msgSuccess('提交成功，请等待审核')
        
        // 清除草稿
        localStorage.removeItem('merchantDraft')
        
        // 跳转到首页
        setTimeout(() => {
          router.push('/index')
        }, 1500)
      } catch (error) {
        console.error('提交失败:', error)
        
        // 根据错误类型显示不同的提示
        if (error.response && error.response.status === 403) {
          proxy.$modal.alertError(
            '权限不足：请先登录并获取商户注册权限。<br/><br/>' +
            '请联系管理员为您分配商户角色和权限。'
          )
        } else {
          proxy.$modal.msgError(error.message || '提交失败，请稍后重试')
        }
      } finally {
        submitting.value = false
      }
    } else {
      proxy.$modal.msgError('请完善所有必填信息')
    }
  })
}

// 页面加载时检查是否有草稿
onMounted(() => {
  loadDraft()
})
</script>

<style lang="scss" scoped>
.merchant-register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 84px);
  padding: 20px;
  background-color: #f5f7fa;
}

.box-card {
  width: 100%;
  max-width: 1000px;
  
  .card-header {
    text-align: center;
    
    h2 {
      margin: 0 0 10px 0;
      color: #303133;
      font-size: 24px;
    }
    
    .subtitle {
      margin: 0;
      color: #909399;
      font-size: 14px;
    }
  }
}

.register-form {
  padding: 20px 40px;
}

.step-content {
  min-height: 400px;
  padding: 20px 0;
  
  .step-title {
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 2px solid #409EFF;
    color: #303133;
    font-size: 18px;
    font-weight: 600;
  }
  
  .logo-preview {
    margin-top: 10px;
  }
  
  .confirm-tip {
    margin-bottom: 20px;
    color: #E6A23C;
    font-size: 14px;
  }
}

.preview-descriptions {
  margin-top: 20px;
}

.form-actions {
  margin-top: 40px;
  text-align: center;
  
  .el-button {
    min-width: 120px;
    margin: 0 10px;
  }
}

:deep(.el-steps) {
  .el-step__title {
    font-size: 14px;
  }
  
  .el-step__description {
    font-size: 12px;
  }
}
</style>
