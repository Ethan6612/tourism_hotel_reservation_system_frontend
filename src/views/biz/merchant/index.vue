<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="商户名称" prop="merchantName">
        <el-input
          v-model="queryParams.merchantName"
          placeholder="请输入商户名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="营业执照号" prop="licenseNo">
        <el-input
          v-model="queryParams.licenseNo"
          placeholder="请输入营业执照号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="法人姓名" prop="legalPerson">
        <el-input
          v-model="queryParams.legalPerson"
          placeholder="请输入法人姓名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="正常" value="0" />
          <el-option label="冻结" value="1" />
          <el-option label="注销" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="审核状态" prop="auditStatus">
        <el-select v-model="queryParams.auditStatus" placeholder="请选择审核状态" clearable>
          <el-option label="待审核" value="0" />
          <el-option label="审核通过" value="1" />
          <el-option label="审核驳回" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="HomeFilled"
          @click="goToFront"
        >返回主页</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['merchant:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="merchantList">
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="商户名称" align="center" prop="merchantName" :show-overflow-tooltip="true" />
      <el-table-column label="营业执照号" align="center" prop="licenseNo" :show-overflow-tooltip="true" />
      <el-table-column label="法人姓名" align="center" prop="legalPerson" />
      <el-table-column label="联系电话" align="center" prop="phone" width="120" />
      <el-table-column label="邮箱" align="center" prop="email" :show-overflow-tooltip="true" />
      <el-table-column label="地址" align="center" prop="address" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="280" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)" v-hasPermi="['merchant:query']">详情</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['merchant:edit']">修改</el-button>
          <el-button 
            v-if="scope.row.status === '0'" 
            link 
            type="warning" 
            icon="Lock" 
            @click="handleFreeze(scope.row)" 
            v-hasPermi="['merchant:edit']"
          >冻结</el-button>
          <el-button 
            v-if="scope.row.status === '1'" 
            link 
            type="success" 
            icon="Unlock" 
            @click="handleUnfreeze(scope.row)" 
            v-hasPermi="['merchant:edit']"
          >解冻</el-button>
          <el-button 
            v-if="scope.row.status !== '2'" 
            link 
            type="danger" 
            icon="CircleClose" 
            @click="handleDeregister(scope.row)" 
            v-hasPermi="['merchant:remove']"
          >注销</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['merchant:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改商户对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="merchantRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="商户名称" prop="merchantName">
              <el-input v-model="form.merchantName" placeholder="请输入商户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="营业执照号" prop="licenseNo">
              <el-input v-model="form.licenseNo" placeholder="请输入营业执照号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="法人姓名" prop="legalPerson">
              <el-input v-model="form.legalPerson" placeholder="请输入法人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商户地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入商户地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="经营范围" prop="businessScope">
              <el-input v-model="form.businessScope" type="textarea" placeholder="请输入经营范围" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="LOGO图片" prop="logoUrl">
              <el-input v-model="form.logoUrl" placeholder="请输入LOGO图片URL" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联用户ID" prop="userId">
              <el-input-number v-model="form.userId" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="商户简介" prop="description">
              <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入商户简介" />
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

    <!-- 查看详情对话框 -->
    <el-dialog title="商户详情" v-model="viewOpen" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="商户ID">{{ viewForm.id }}</el-descriptions-item>
        <el-descriptions-item label="商户名称">{{ viewForm.merchantName }}</el-descriptions-item>
        <el-descriptions-item label="营业执照号">{{ viewForm.licenseNo }}</el-descriptions-item>
        <el-descriptions-item label="法人姓名">{{ viewForm.legalPerson }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ viewForm.phone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ viewForm.email }}</el-descriptions-item>
        <el-descriptions-item label="商户地址" :span="2">{{ viewForm.address }}</el-descriptions-item>
        <el-descriptions-item label="经营范围" :span="2">{{ viewForm.businessScope }}</el-descriptions-item>
        <el-descriptions-item label="LOGO图片" :span="2">
          <el-image 
            v-if="viewForm.logoUrl" 
            :src="viewForm.logoUrl" 
            style="width: 100px; height: 100px"
            fit="cover"
            :preview-src-list="[viewForm.logoUrl]"
          />
          <span v-else>无LOGO</span>
        </el-descriptions-item>
        <el-descriptions-item label="商户简介" :span="2">{{ viewForm.description }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(viewForm.status)">
            {{ getStatusLabel(viewForm.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="关联用户ID">{{ viewForm.userId }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(viewForm.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ parseTime(viewForm.updateTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup name="Merchant">

import { listMerchant, getMerchant, delMerchant, addMerchant, updateMerchant, freezeMerchant, unfreezeMerchant, deregisterMerchant, getMyMerchant } from "@/api/biz/merchant"
import { useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'
import { ref, getCurrentInstance, onMounted } from 'vue'

const { proxy } = getCurrentInstance()
const router = useRouter()
const userStore = useUserStore()

// 检查商户用户是否完成登记
async function checkMerchantRegistration() {
  
  const userRoles = userStore.roles
  
  // ✅ 获取当前登录用户的ID
  const currentUserId = userStore.id || userStore.userId
  
  const isMerchant = userRoles && userRoles.some(role => 
    role === 'merchant' || role === 'ROLE_MERCHANT'
  )
  
  if (!isMerchant) {
    return true // 非商户用户直接返回true
  }
  
  try {
    const response = await getMyMerchant()
    
    if (response.code === 200 && response.data) {
      
      // ✅ 关键安全检查：验证商户归属
      if (currentUserId && response.data.userId !== currentUserId) {
        // 视为未登记，要求重新注册
        proxy.$modal.confirm('您还未完成商户信息登记，请先完善商户信息', '提示', {
          confirmButtonText: '去登记',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          router.push('/merchant/register')
        }).catch(() => {
          router.back()
        })
        return false
      }
      
      const auditStatus = response.data.auditStatus
      
      // 根据审核状态显示不同提示
      if (auditStatus === '0' || auditStatus === 0) {
        // 待审核
        proxy.$modal.alert('您的商户信息正在审核中，请耐心等待', '审核状态', {
          type: 'info'
        })
        return false // 阻止加载列表
      } else if (auditStatus === '2' || auditStatus === 2) {
        // 审核驳回
        proxy.$modal.confirm(`您的商户信息审核未通过\n驳回原因：${response.data.rejectReason || '未知'}\n\n是否重新提交？`, '审核驳回', {
          confirmButtonText: '去修改',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          router.push('/merchant/register')
        })
        return false // 阻止加载列表
      } else if (auditStatus === '1' || auditStatus === 1) {
        // 审核通过
        localStorage.setItem('merchantRegistered', 'true')
        return true
      } else {
        // 未知状态
        return false
      }
    } else {
      // 没有找到商户信息
      
      // ✅ 容错处理：尝试从列表查询，但必须验证 userId 匹配
      try {
        const listResponse = await listMerchant({
          pageNum: 1,
          pageSize: 10, // 获取更多数据以便筛选
        })
        
        if (listResponse.data && listResponse.data.list && listResponse.data.list.length > 0) {
          // ✅ 关键：查找属于当前用户的商户
          const myMerchant = listResponse.data.list.find(
            merchant => merchant.userId === currentUserId
          )
          
          if (myMerchant) {
            // 使用找到的商户信息继续判断
            const auditStatus = myMerchant.auditStatus || '0'
            
            if (auditStatus === '0' || auditStatus === 0) {
              proxy.$modal.alert('您的商户信息正在审核中，请耐心等待', '审核状态', {
                type: 'info'
              })
              return false
            } else if (auditStatus === '2' || auditStatus === 2) {
              proxy.$modal.confirm(`您的商户信息审核未通过\n驳回原因：${myMerchant.rejectReason || '未知'}\n\n是否重新提交？`, '审核驳回', {
                confirmButtonText: '去修改',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                router.push('/merchant/register')
              })
              return false
            } else if (auditStatus === '1' || auditStatus === 1) {
              localStorage.setItem('merchantRegistered', 'true')
              return true
            }
          } else {
          }
        } else {
        }
      } catch (listError) {
      }
      
      // 如果所有方式都确认没有商户信息，提示去登记
      proxy.$modal.confirm('您还未完成商户信息登记，请先完善商户信息', '提示', {
        confirmButtonText: '去登记',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        router.push('/merchant/register')
      }).catch(() => {
        router.back()
      })
      return false
    }
  } catch (error) {
    // API调用失败时，使用备用逻辑
    const merchantRegistered = localStorage.getItem('merchantRegistered')
    if (!merchantRegistered) {
      proxy.$modal.confirm('您还未完成商户信息登记，请先完善商户信息', '提示', {
        confirmButtonText: '去登记',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        router.push('/merchant/register')
      }).catch(() => {
        router.back()
      })
      return false
    }
    return true
  }
}

const merchantList = ref([])
const open = ref(false)
const viewOpen = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const title = ref("")

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  merchantName: undefined,
  licenseNo: undefined,
  legalPerson: undefined,
  phone: undefined,
  status: undefined,
  auditStatus: '1'  // 默认只显示审核通过的商户
})

const form = ref({})
const viewForm = ref({})

const validatePhone = (rule, value, callback) => {
  if (value && !/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error("手机号格式不正确"))
  } else {
    callback()
  }
}

const rules = {
  merchantName: [{ required: true, message: "商户名称不能为空", trigger: "blur" }],
  licenseNo: [{ required: true, message: "营业执照号不能为空", trigger: "blur" }],
  legalPerson: [{ required: true, message: "法人姓名不能为空", trigger: "blur" }],
  phone: [{ validator: validatePhone, trigger: "blur" }],
  email: [{ type: 'email', message: "邮箱格式不正确", trigger: "blur" }]
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

function goToFront() {
  router.push('/index')
}

/** 查询商户列表 */
function getList(paginationParams) {
  if (paginationParams) {
    queryParams.value.pageNum = paginationParams.page
    queryParams.value.pageSize = paginationParams.limit
  }
  
  loading.value = true
  listMerchant(queryParams.value).then(response => {
    merchantList.value = response.data.list
    total.value = response.data.total
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    id: undefined,
    merchantName: undefined,
    licenseNo: undefined,
    legalPerson: undefined,
    phone: undefined,
    email: undefined,
    address: undefined,
    businessScope: undefined,
    logoUrl: undefined,
    description: undefined,
    status: '0',
    userId: undefined
  }
  proxy.resetForm("merchantRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList(null)
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加商户"
}

/** 查看详情按钮操作 */
function handleView(row) {
  const id = row.id
  getMerchant(id).then(response => {
    viewForm.value = response.data
    viewOpen.value = true
  })
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id
  getMerchant(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改商户"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["merchantRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateMerchant(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList(null)
        })
      } else {
        addMerchant(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList(null)
        })
      }
    }
  })
}

/** 冻结商户 */
function handleFreeze(row) {
  proxy.$modal.confirm('是否确认冻结商户"' + row.merchantName + '"？').then(function() {
    return freezeMerchant(row.id)
  }).then(() => {
    getList(null)
    proxy.$modal.msgSuccess("冻结成功")
  }).catch(() => {})
}

/** 解冻商户 */
function handleUnfreeze(row) {
  proxy.$modal.confirm('是否确认解冻商户"' + row.merchantName + '"？').then(function() {
    return unfreezeMerchant(row.id)
  }).then(() => {
    getList(null)
    proxy.$modal.msgSuccess("解冻成功")
  }).catch(() => {})
}

/** 注销商户 */
function handleDeregister(row) {
  proxy.$modal.confirm('是否确认注销商户"' + row.merchantName + '"？注销后商户将无法恢复。').then(function() {
    return deregisterMerchant(row.id)
  }).then(() => {
    getList(null)
    proxy.$modal.msgSuccess("注销成功")
  }).catch(() => {})
}

/** 删除按钮操作 */
function handleDelete(row) {
  const id = row.id
  proxy.$modal.confirm('是否确认删除商户编号为"' + id + '"的数据项？').then(function() {
    return delMerchant(id)
  }).then(() => {
    getList(null)
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

// ✅ 页面加载时检查商户注册状态并加载列表
onMounted(async () => {
  
  try {
    // 路由守卫已经检查过审核状态，这里直接加载列表
    getList(null)
  } catch (error) {
  }
})
</script>