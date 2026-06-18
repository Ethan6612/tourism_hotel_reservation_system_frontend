<template>
  <div class="pending-container">
    <div class="pending-card">
      <div class="pending-icon">⏳</div>
      <h2>商户资料审核中</h2>
      <p class="pending-desc">您的商户信息已提交，正在等待管理员审核</p>

      <div class="info-box" v-if="merchantInfo.merchantName">
        <div class="info-row">
          <span class="info-label">商户名称</span>
          <span class="info-value">{{ merchantInfo.merchantName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">营业执照号</span>
          <span class="info-value">{{ merchantInfo.licenseNo }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">提交时间</span>
          <span class="info-value">{{ parseTime(merchantInfo.submitTime || merchantInfo.createTime) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">审核状态</span>
          <span class="info-value"><el-tag type="warning">审核中</el-tag></span>
        </div>
      </div>

      <el-divider />

      <div class="tips-box">
        <h4>📋 审核说明</h4>
        <ul>
          <li>审核通常需要 1-3 个工作日，请耐心等待</li>
          <li>审核通过后您将可以正常使用商户管理功能</li>
          <li>如需修改商户信息，请等待审核完成后再进行操作</li>
          <li>如有疑问，请联系平台管理员</li>
        </ul>
      </div>

      <div class="actions">
        <el-button type="primary" @click="refreshStatus" :loading="refreshing">刷新状态</el-button>
        <el-button @click="goToDashboard">返回首页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup name="MerchantPending">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyMerchant } from '@/api/biz/merchant'
import { ElMessage } from 'element-plus'

const router = useRouter()
const refreshing = ref(false)
const merchantInfo = ref({})

async function loadMerchantInfo() {
  try {
    const res = await getMyMerchant()
    if (res.data) {
      merchantInfo.value = res.data

      // 如果审核状态已变更，跳转到对应页面
      const status = res.data.auditStatus
      if (status === '1' || status === 1) {
        // 审核通过 → 进入商户管理
        ElMessage.success('您的商户资料已审核通过！')
        router.replace('/biz/hotel')
      } else if (status === '2' || status === 2) {
        // 审核驳回 → 重新提交
        ElMessage.warning(`您的商户资料审核未通过\n驳回原因：${res.data.rejectReason || '未知'}`)
        router.replace('/merchant/register')
      }
    } else {
      // 未注册 → 去注册
      ElMessage.warning('您还未完成商户信息登记')
      router.replace('/merchant/register')
    }
  } catch (err) {
    console.error('获取商户信息失败:', err)
  }
}

async function refreshStatus() {
  refreshing.value = true
  await loadMerchantInfo()
  refreshing.value = false
}

function goToDashboard() {
  router.push('/dashboard')
}

onMounted(() => {
  loadMerchantInfo()
})
</script>

<style scoped lang="scss">
.pending-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  background: #f5f7fa;
  padding: 40px 20px;
}

.pending-card {
  background: #fff;
  border-radius: 16px;
  padding: 48px 40px;
  max-width: 560px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.pending-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
}

h2 {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px;
}

.pending-desc {
  font-size: 14px;
  color: #999;
  margin: 0 0 28px;
}

.info-box {
  background: #f8f9fb;
  border-radius: 10px;
  padding: 20px 24px;
  text-align: left;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed #e8e8e8;

  &:last-child { border-bottom: none; }
}

.info-label {
  font-size: 13px;
  color: #999;
}

.info-value {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.tips-box {
  text-align: left;
  margin-top: 8px;

  h4 {
    font-size: 14px;
    color: #666;
    margin: 0 0 12px;
  }

  ul {
    margin: 0;
    padding-left: 20px;

    li {
      font-size: 13px;
      color: #999;
      line-height: 2;
    }
  }
}

.actions {
  margin-top: 28px;
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
