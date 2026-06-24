<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="分类名称" prop="categoryName">
        <el-input v-model="queryParams.categoryName" placeholder="请输入分类名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
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
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增分类</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="categoryList">
      <el-table-column label="分类ID" align="center" prop="categoryId" width="100" />
      <el-table-column label="分类名称" align="center" prop="categoryName" :show-overflow-tooltip="true" min-width="200" />
      <el-table-column label="排序" align="center" prop="sortOrder" width="100" />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'">
            {{ scope.row.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" width="220" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button v-if="scope.row.status === '0'" link type="warning" icon="Lock" @click="handleStatusChange(scope.row, '1')">停用</el-button>
          <el-button v-if="scope.row.status === '1'" link type="success" icon="Unlock" @click="handleStatusChange(scope.row, '0')">启用</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="categoryRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="0">正常</el-radio>
            <el-radio value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="AdminCategory">
import { ref, getCurrentInstance } from 'vue'
import { listCategory, addCategory, updateCategory, delCategory, updateCategoryStatus } from '@/api/biz/category'

const { proxy } = getCurrentInstance()

const categoryList = ref([])
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const open = ref(false)
const title = ref('')

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  categoryName: undefined,
  status: undefined
})

const form = ref({
  categoryId: undefined,
  categoryName: '',
  sortOrder: 0,
  status: '0'
})

const rules = {
  categoryName: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
  sortOrder: [{ required: true, message: '排序不能为空', trigger: 'blur' }]
}

/** 查询分类列表 */
function getList() {
  loading.value = true
  listCategory(queryParams.value).then(res => {
    const page = res.data || {}
    categoryList.value = page.rows || []
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
    categoryId: undefined,
    categoryName: '',
    sortOrder: 0,
    status: '0'
  }
  proxy.resetForm('categoryRef')
}

function cancel() {
  open.value = false
  reset()
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '新增分类'
}

function handleUpdate(row) {
  reset()
  form.value = { ...row }
  open.value = true
  title.value = '编辑分类'
}

function submitForm() {
  proxy.$refs['categoryRef'].validate(valid => {
    if (valid) {
      if (form.value.categoryId != undefined) {
        updateCategory(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addCategory(form.value).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleStatusChange(row, status) {
  const label = status === '0' ? '启用' : '停用'
  proxy.$modal.confirm(`确认${label}分类"${row.categoryName}"？`).then(() => {
    updateCategoryStatus(row.categoryId, status).then(() => {
      proxy.$modal.msgSuccess(`${label}成功`)
      getList()
    })
  }).catch(() => {})
}

function handleDelete(row) {
  proxy.$modal.confirm(`确认删除分类"${row.categoryName}"？删除后不可恢复。`).then(() => {
    delCategory(row.categoryId).then(() => {
      proxy.$modal.msgSuccess('删除成功')
      getList()
    })
  }).catch(() => {})
}

getList()
</script>
