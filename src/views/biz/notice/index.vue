<template>
  <div class="app-container">
    <div class="page-top mb8">
      <h2>🔔 通知中心</h2>
      <p class="subtitle">系统通知与公告消息</p>
    </div>

    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="通知标题" prop="noticeTitle">
        <el-input v-model="queryParams.noticeTitle" placeholder="请输入通知标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="通知类型" prop="noticeType">
        <el-select v-model="queryParams.noticeType" placeholder="请选择类型" clearable>
          <el-option label="通知" value="1" />
          <el-option label="公告" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 通知列表 -->
    <div v-loading="loading" class="notice-list">
      <div v-if="noticeList.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无通知消息" :image-size="120" />
      </div>

      <div
        v-for="item in noticeList"
        :key="item.noticeId || item.id"
        class="notice-item"
        :class="{ unread: !item._read }"
        @click="handleView(item)"
      >
        <div class="notice-icon">
          <span v-if="item.noticeType === '1'">📢</span>
          <span v-else>📣</span>
        </div>
        <div class="notice-body">
          <div class="notice-header">
            <span class="notice-title">{{ item.noticeTitle }}</span>
            <el-tag :type="item.noticeType === '1' ? 'primary' : 'warning'" size="small">
              {{ item.noticeType === '1' ? '通知' : '公告' }}
            </el-tag>
            <el-tag v-if="item.status === '0'" type="success" size="small" effect="plain">正常</el-tag>
            <el-tag v-else type="info" size="small" effect="plain">已关闭</el-tag>
          </div>
          <p class="notice-preview">{{ truncateText(item.noticeContent, 120) }}</p>
          <div class="notice-footer">
            <span class="notice-time">{{ parseTime(item.createTime) }}</span>
            <span class="notice-creator" v-if="item.createBy">发布人：{{ item.createBy }}</span>
          </div>
        </div>
      </div>
    </div>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 通知详情对话框 -->
    <el-dialog title="通知详情" v-model="detailOpen" width="600px" append-to-body>
      <div class="notice-detail">
        <div class="detail-header">
          <h3>{{ detailForm.noticeTitle }}</h3>
          <div class="detail-meta">
            <el-tag :type="detailForm.noticeType === '1' ? 'primary' : 'warning'" size="small">
              {{ detailForm.noticeType === '1' ? '通知' : '公告' }}
            </el-tag>
            <span>{{ parseTime(detailForm.createTime) }}</span>
            <span v-if="detailForm.createBy">发布人：{{ detailForm.createBy }}</span>
          </div>
        </div>
        <el-divider />
        <div class="detail-content" v-html="detailForm.noticeContent || '暂无内容'"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="BizNotice">
import { ref } from 'vue'
import { listMerchantNotice, getMerchantNotice } from '@/api/biz/notice'

const { proxy } = getCurrentInstance()

const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const detailOpen = ref(false)

const noticeList = ref([])
const detailForm = ref({})

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  noticeTitle: undefined,
  noticeType: undefined
})

function truncateText(text, maxLen) {
  if (!text) return ''
  const plain = text.replace(/<[^>]+>/g, '')
  return plain.length > maxLen ? plain.substring(0, maxLen) + '...' : plain
}

function getList(paginationParams) {
  if (paginationParams) {
    queryParams.value.pageNum = paginationParams.page
    queryParams.value.pageSize = paginationParams.limit
  }
  loading.value = true
  listMerchantNotice(queryParams.value).then(response => {
    const data = response.data || response
    let list = data.list || data.rows || (Array.isArray(data) ? data : [])
    const readIds = JSON.parse(localStorage.getItem('merchantReadNoticeIds') || '[]')
    list = list.map(item => ({ ...item, _read: readIds.includes(item.noticeId || item.id) }))
    noticeList.value = list
    total.value = data.total || list.length
    loading.value = false
  }).catch(() => {
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

function handleView(item) {
  const id = item.noticeId || item.id
  getMerchantNotice(id).then(response => {
    detailForm.value = response.data || response
    detailOpen.value = true
  }).catch(() => {
    // 如果详情接口失败，直接使用列表数据展示
    detailForm.value = item
    detailOpen.value = true
  })

  item._read = true
  const readIds = JSON.parse(localStorage.getItem('merchantReadNoticeIds') || '[]')
  if (!readIds.includes(id)) {
    readIds.push(id)
    localStorage.setItem('merchantReadNoticeIds', JSON.stringify(readIds))
  }
}

getList()
</script>

<style scoped lang="scss">
.page-top {
  h2 { font-size: 22px; font-weight: 700; color: #333; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: #999; margin: 0; }
}
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.notice-item {
  display: flex;
  gap: 16px;
  padding: 18px 22px;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
  box-shadow: 0 1px 6px rgba(0,0,0,0.04);
  &:hover {
    border-left-color: #409eff;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  }
  &.unread {
    background: #f0f7ff;
    border-left-color: #409eff;
  }
}
.notice-icon {
  font-size: 28px;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 50%;
}
.notice-body { flex: 1; min-width: 0; }
.notice-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.notice-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  flex: 1;
}
.notice-preview {
  font-size: 13px;
  color: #999;
  line-height: 1.5;
  margin: 0 0 8px;
}
.notice-footer {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #bbb;
}
.notice-detail {
  .detail-header {
    h3 { margin: 0 0 12px; font-size: 18px; color: #333; }
    .detail-meta { display: flex; gap: 12px; align-items: center; font-size: 13px; color: #999; }
  }
  .detail-content {
    font-size: 14px;
    color: #555;
    line-height: 1.8;
    min-height: 100px;
  }
}
.empty-state { padding: 60px 0; }
</style>
