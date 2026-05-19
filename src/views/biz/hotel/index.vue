<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="酒店名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入酒店名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="星级" prop="star">
        <el-select v-model="queryParams.star" placeholder="请选择星级" clearable>
          <el-option label="一星" value="1" />
          <el-option label="二星" value="2" />
          <el-option label="三星" value="3" />
          <el-option label="四星" value="4" />
          <el-option label="五星" value="5" />
        </el-select>
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['hotel:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="hotelList">
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="酒店名称" align="center" prop="name" :show-overflow-tooltip="true" />
      <el-table-column label="地址" align="center" prop="address" :show-overflow-tooltip="true" />
      <el-table-column label="星级" align="center" prop="star" width="100">
        <template #default="scope">
          <el-rate v-model="scope.row.star" disabled show-score text-color="#ff9900" />
        </template>
      </el-table-column>
      <el-table-column label="评分" align="center" prop="score" width="100" />
      <el-table-column label="设施" align="center" prop="facility" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)" v-hasPermi="['hotel:query']">详情</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['hotel:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['hotel:remove']">删除</el-button>
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

    <!-- 添加或修改酒店对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="hotelRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="酒店名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入酒店名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="星级" prop="star">
              <el-rate v-model="form.star" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="地址" prop="address">
              <el-input v-model="form.address" type="textarea" placeholder="请输入酒店地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="评分" prop="score">
              <el-input-number v-model="form.score" :min="0" :max="5" :precision="1" :step="0.1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="0">正常</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="设施" prop="facility">
              <el-input v-model="form.facility" type="textarea" placeholder="请输入酒店设施，多个设施用逗号分隔" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="图片URL" prop="imgUrl">
              <el-input v-model="form.imgUrl" placeholder="请输入图片URL" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商家ID" prop="businessId">
              <el-input-number v-model="form.businessId" :min="0" />
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
    <el-dialog title="酒店详情" v-model="viewOpen" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="酒店ID">{{ viewForm.id }}</el-descriptions-item>
        <el-descriptions-item label="酒店名称">{{ viewForm.name }}</el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">{{ viewForm.address }}</el-descriptions-item>
        <el-descriptions-item label="星级">
          <el-rate v-model="viewForm.star" disabled show-score text-color="#ff9900" />
        </el-descriptions-item>
        <el-descriptions-item label="评分">{{ viewForm.score }}</el-descriptions-item>
        <el-descriptions-item label="设施" :span="2">{{ viewForm.facility }}</el-descriptions-item>
        <el-descriptions-item label="商家ID">{{ viewForm.businessId }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <dict-tag :options="sys_normal_disable" :value="viewForm.status" />
        </el-descriptions-item>
        <el-descriptions-item label="图片URL" :span="2">
          <el-image 
            v-if="viewForm.imgUrl" 
            :src="viewForm.imgUrl" 
            style="width: 200px; height: 150px"
            fit="cover"
            :preview-src-list="[viewForm.imgUrl]"
          />
          <span v-else>无图片</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(viewForm.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ parseTime(viewForm.updateTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup name="Hotel">
import { listHotel, getHotel, delHotel, addHotel, updateHotel } from "@/api/biz/hotel"

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict("sys_normal_disable")

const hotelList = ref([])
const open = ref(false)
const viewOpen = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const title = ref("")

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  star: undefined,
  status: undefined
})

const form = ref({})
const viewForm = ref({})

const rules = {
  name: [{ required: true, message: "酒店名称不能为空", trigger: "blur" }],
  address: [{ required: true, message: "酒店地址不能为空", trigger: "blur" }]
}

/** 查询酒店列表 */
function getList(paginationParams) {
  // 如果传入了分页参数，更新 queryParams
  if (paginationParams) {
    queryParams.value.pageNum = paginationParams.page
    queryParams.value.pageSize = paginationParams.limit
  }
  
  loading.value = true
  listHotel(queryParams.value).then(response => {
    hotelList.value = response.data.list
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
    name: undefined,
    address: undefined,
    star: 0,
    score: 0,
    imgUrl: undefined,
    facility: undefined,
    businessId: undefined,
    status: "0"
  }
  proxy.resetForm("hotelRef")
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
  title.value = "添加酒店"
}

/** 查看详情按钮操作 */
function handleView(row) {
  const id = row.id
  getHotel(id).then(response => {
    viewForm.value = response.data
    viewOpen.value = true
  })
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || id
  getHotel(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改酒店"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["hotelRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateHotel(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList(null)
        })
      } else {
        addHotel(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList(null)
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const ids = row.id
  proxy.$modal.confirm('是否确认删除酒店编号为"' + ids + '"的数据项？').then(function() {
    return delHotel(ids)
  }).then(() => {
    getList(null)
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

getList(null)
</script>
