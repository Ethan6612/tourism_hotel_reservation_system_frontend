<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="酒店ID" prop="hotelId">
        <el-input
          v-model="queryParams.hotelId"
          placeholder="请输入酒店ID"
          clearable
          @keyup.enter="handleQuery"
        />
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
          v-hasPermi="['room:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="roomList">
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="酒店ID" align="center" prop="hotelId" width="100" />
      <el-table-column label="房型" align="center" prop="roomType" :show-overflow-tooltip="true" />
      <el-table-column label="面积" align="center" prop="area" width="100" />
      <el-table-column label="床型" align="center" prop="bedType" width="120" />
      <el-table-column label="价格" align="center" prop="price" width="100">
        <template #default="scope">
          <span>¥{{ scope.row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column label="库存" align="center" prop="stock" width="100" />
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
          <el-button link type="primary" icon="View" @click="handleView(scope.row)" v-hasPermi="['room:query']">详情</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['room:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['room:remove']">删除</el-button>
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

    <!-- 添加或修改房源对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="roomRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="酒店ID" prop="hotelId">
              <el-input-number v-model="form.hotelId" :min="1" placeholder="请输入酒店ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房型" prop="roomType">
              <el-input v-model="form.roomType" placeholder="请输入房型名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="面积" prop="area">
              <el-input v-model="form.area" placeholder="如：35平米" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="床型" prop="bedType">
              <el-input v-model="form.bedType" placeholder="如：1.8米大床" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" :step="10" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input-number v-model="form.stock" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
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
            <el-form-item label="图片URL" prop="imgUrl">
              <el-input v-model="form.imgUrl" placeholder="请输入图片URL" />
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
    <el-dialog title="房源详情" v-model="viewOpen" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="房源ID">{{ viewForm.id }}</el-descriptions-item>
        <el-descriptions-item label="酒店ID">{{ viewForm.hotelId }}</el-descriptions-item>
        <el-descriptions-item label="房型">{{ viewForm.roomType }}</el-descriptions-item>
        <el-descriptions-item label="面积">{{ viewForm.area }}</el-descriptions-item>
        <el-descriptions-item label="床型">{{ viewForm.bedType }}</el-descriptions-item>
        <el-descriptions-item label="价格">¥{{ viewForm.price }}</el-descriptions-item>
        <el-descriptions-item label="库存">{{ viewForm.stock }}</el-descriptions-item>
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

<script setup name="Room">
import { listRoom, getRoom, delRoom, addRoom, updateRoom } from "@/api/biz/room"

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict("sys_normal_disable")

const roomList = ref([])
const open = ref(false)
const viewOpen = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const title = ref("")

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  hotelId: undefined,
  status: undefined
})

const form = ref({})
const viewForm = ref({})

const rules = {
  hotelId: [{ required: true, message: "酒店ID不能为空", trigger: "blur" }],
  roomType: [{ required: true, message: "房型名称不能为空", trigger: "blur" }],
  price: [{ required: true, message: "价格不能为空", trigger: "blur" }],
  stock: [{ required: true, message: "库存不能为空", trigger: "blur" }]
}

/** 查询房源列表 */
function getList(paginationParams) {
  if (paginationParams) {
    queryParams.value.pageNum = paginationParams.page
    queryParams.value.pageSize = paginationParams.limit
  }
  loading.value = true
  listRoom(queryParams.value).then(response => {
    roomList.value = response.data.list
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
    hotelId: undefined,
    roomType: undefined,
    area: undefined,
    bedType: undefined,
    price: 0,
    stock: 0,
    status: "0",
    imgUrl: undefined
  }
  proxy.resetForm("roomRef")
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
  title.value = "添加房源"
}

/** 查看详情按钮操作 */
function handleView(row) {
  const id = row.id
  getRoom(id).then(response => {
    viewForm.value = response.data
    viewOpen.value = true
  })
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || id
  getRoom(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改房源"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["roomRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateRoom(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList(null)
        })
      } else {
        addRoom(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除房源编号为"' + ids + '"的数据项？').then(function() {
    return delRoom(ids)
  }).then(() => {
    getList(null)
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

getList(null)
</script>
