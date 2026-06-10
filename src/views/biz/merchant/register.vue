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
