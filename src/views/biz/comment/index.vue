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
      <el-form-item label="房型ID" prop="roomId">
        <el-input
          v-model="queryParams.roomId"
          placeholder="请输入房型ID"
          clearable
          @keyup.enter="handleQuery"
        />
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
          icon="DataAnalysis"
          @click="handleStatistics"
          v-hasPermi="['comment:query']"
        >评分统计</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="commentList">
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="用户ID" align="center" prop="userId" width="100" />
      <el-table-column label="酒店ID" align="center" prop="hotelId" width="100" />
      <el-table-column label="房型ID" align="center" prop="roomId" width="100" />
      <el-table-column label="评分" align="center" prop="score" width="150">
        <template #default="scope">
          <el-rate v-model="scope.row.score" disabled show-score text-color="#ff9900" />
        </template>
      </el-table-column>
      <el-table-column label="评价内容" align="center" prop="content" :show-overflow-tooltip="true" />
      <el-table-column label="图片" align="center" prop="imgUrl" width="100">
        <template #default="scope">
          <el-image 
            v-if="scope.row.imgUrl" 
            :src="scope.row.imgUrl" 
            style="width: 50px; height: 50px"
            fit="cover"
            :preview-src-list="[scope.row.imgUrl]"
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="回复内容" align="center" prop="replyContent" :show-overflow-tooltip="true" />
      <el-table-column label="回复时间" align="center" prop="replyTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.replyTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)" v-hasPermi="['comment:query']">详情</el-button>
          <el-button 
            v-if="!scope.row.replyContent" 
            link 
            type="primary" 
            icon="ChatDotRound" 
            @click="handleReply(scope.row)" 
            v-hasPermi="['comment:reply']"
          >回复</el-button>
          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['comment:remove']"
          >删除</el-button>
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

    <!-- 查看详情对话框 -->
    <el-dialog title="评价详情" v-model="viewOpen" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="评价ID">{{ viewForm.id }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ viewForm.userId }}</el-descriptions-item>
        <el-descriptions-item label="酒店ID">{{ viewForm.hotelId }}</el-descriptions-item>
        <el-descriptions-item label="房型ID">{{ viewForm.roomId }}</el-descriptions-item>
        <el-descriptions-item label="评分" :span="2">
          <el-rate v-model="viewForm.score" disabled show-score text-color="#ff9900" />
        </el-descriptions-item>
        <el-descriptions-item label="评价内容" :span="2">{{ viewForm.content }}</el-descriptions-item>
        <el-descriptions-item label="图片" :span="2">
          <el-image 
            v-if="viewForm.imgUrl" 
            :src="viewForm.imgUrl" 
            style="width: 200px; height: 150px"
            fit="cover"
            :preview-src-list="[viewForm.imgUrl]"
          />
          <span v-else>无图片</span>
        </el-descriptions-item>
        <el-descriptions-item label="回复内容" :span="2">{{ viewForm.replyContent || '暂无回复' }}</el-descriptions-item>
        <el-descriptions-item label="回复时间">{{ parseTime(viewForm.replyTime) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(viewForm.createTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 回复评价对话框 -->
    <el-dialog title="回复评价" v-model="replyOpen" width="600px" append-to-body>
      <el-form ref="replyRef" :model="replyForm" :rules="replyRules" label-width="100px">
        <el-form-item label="评价内容">
          <el-input v-model="currentComment.content" type="textarea" :rows="3" disabled />
        </el-form-item>
        <el-form-item label="回复内容" prop="replyContent">
          <el-input v-model="replyForm.replyContent" type="textarea" :rows="4" placeholder="请输入回复内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitReply">确 定</el-button>
          <el-button @click="replyOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 评分统计对话框 -->
    <el-dialog title="评分统计" v-model="statisticsOpen" width="700px" append-to-body>
      <el-form :model="statisticsForm" label-width="100px">
        <el-form-item label="酒店ID">
          <el-input v-model="statisticsForm.hotelId" placeholder="请输入酒店ID（可选）" clearable />
        </el-form-item>
        <el-form-item label="房型ID">
          <el-input v-model="statisticsForm.roomId" placeholder="请输入房型ID（可选）" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadStatistics">查询统计</el-button>
        </el-form-item>
      </el-form>

      <div v-if="statisticsData" style="margin-top: 20px;">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="平均评分">
            <el-rate v-model="statisticsData.averageScore" disabled show-score text-color="#ff9900" />
            {{ statisticsData.averageScore }}
          </el-descriptions-item>
          <el-descriptions-item label="评价总数">{{ statisticsData.totalComments }}</el-descriptions-item>
          <el-descriptions-item label="5星数量">{{ statisticsData.fiveStarCount }}</el-descriptions-item>
          <el-descriptions-item label="4星数量">{{ statisticsData.fourStarCount }}</el-descriptions-item>
          <el-descriptions-item label="3星数量">{{ statisticsData.threeStarCount }}</el-descriptions-item>
          <el-descriptions-item label="2星数量">{{ statisticsData.twoStarCount }}</el-descriptions-item>
          <el-descriptions-item label="1星数量">{{ statisticsData.oneStarCount }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="Comment">
import { listComment, getComment, replyComment, delComment, getScoreStatistics } from "@/api/biz/comment"
import { getToken } from '@/utils/auth'

const { proxy } = getCurrentInstance()

const commentList = ref([])
const viewOpen = ref(false)
const replyOpen = ref(false)
const statisticsOpen = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  hotelId: undefined,
  roomId: undefined
  // status: '1'  // ✅ 暂时注释掉，等待后端添加 status 字段后再启用
})

const viewForm = ref({})
const currentComment = ref({})
const replyForm = ref({
  replyContent: ''
})

const statisticsForm = ref({
  hotelId: undefined,
  roomId: undefined
})

const statisticsData = ref(null)

const replyRules = {
  replyContent: [{ required: true, message: "回复内容不能为空", trigger: "blur" }]
}

/** 查询评价列表 */
function getList(paginationParams) {
  if (paginationParams) {
    queryParams.value.pageNum = paginationParams.page
    queryParams.value.pageSize = paginationParams.limit
  }
  loading.value = true
  
  listComment(queryParams.value).then(response => {
    
    if (response.data) {
      
      commentList.value = response.data.rows || []
      total.value = response.data.total || 0
      
      if (commentList.value.length > 0) {
      }
    } else {
      proxy.$modal.msgError('服务器返回数据异常')
    }
    
    loading.value = false
  }).catch(error => {
    proxy.$modal.msgError('查询评价列表失败: ' + (error.message || '未知错误'))
    loading.value = false
  })
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

/** 查看详情按钮操作 */
function handleView(row) {
  const id = row.id
  getComment(id).then(response => {
    viewForm.value = response.data
    viewOpen.value = true
  })
}

/** 回复评价按钮操作 */
function handleReply(row) {
  currentComment.value = row
  replyForm.value.replyContent = ''
  replyOpen.value = true
}

/** 提交回复 */
function submitReply() {
  proxy.$refs["replyRef"].validate(valid => {
    if (valid) {
      replyComment(currentComment.value.id, replyForm.value.replyContent).then(response => {
        proxy.$modal.msgSuccess("回复成功")
        replyOpen.value = false
        getList(null)
      })
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  proxy.$modal.confirm('是否确认删除评价编号为"' + row.id + '"的数据项？').then(function() {
    return delComment(row.id)
  }).then(() => {
    getList(null)
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 评分统计按钮操作 */
function handleStatistics() {
  statisticsForm.value.hotelId = undefined
  statisticsForm.value.roomId = undefined
  statisticsData.value = null
  statisticsOpen.value = true
}

/** 加载统计数据 */
function loadStatistics() {
  const params = {}
  if (statisticsForm.value.hotelId) {
    params.hotelId = statisticsForm.value.hotelId
  }
  if (statisticsForm.value.roomId) {
    params.roomId = statisticsForm.value.roomId
  }

  getScoreStatistics(params).then(response => {
    statisticsData.value = response.data
    if (statisticsData.value.averageScore) {
      statisticsData.value.averageScore = parseFloat(statisticsData.value.averageScore)
    }
  })
}

getList(null)
</script>
